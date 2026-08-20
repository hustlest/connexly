/**
 * Server-only client for the NAR IPv4 Tracker (arin3.data-centers.com).
 *
 * The tracker is a Flask app behind a single-password login. We log in once,
 * cache the session cookie in module memory, and use it to call the per-RIR
 * DataTables endpoints (`/api/arin/data`, `/api/ripe/data`) to pull the latest
 * transfer records.
 *
 * Credentials come from env vars:
 *   ARIN_TRACKER_URL       (default: https://arin3.data-centers.com)
 *   ARIN_TRACKER_PASSWORD  (required for live data; falls back to static rows)
 *
 * Server-only: this module makes outbound HTTP calls with credentials and
 * must not be imported by any client component.
 */
import type { TransferLog } from "@/types/market";
import {
  staticTransferLogRows,
  type TransferLogEntry,
  type TransferLogRir,
} from "./transfer-log-static";

const DEFAULT_BASE_URL = "https://arin3.data-centers.com";
const DEFAULT_PER_RIR_LIMIT = 25;

// Module-level session cache. Reset when the cookie expires or auth fails.
type SessionCache = {
  cookie: string;
  expiresAt: number;
};
let sessionCache: SessionCache | null = null;
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getBaseUrl(): string {
  return process.env.ARIN_TRACKER_URL?.trim() || DEFAULT_BASE_URL;
}

function getPassword(): string | null {
  const pw = process.env.ARIN_TRACKER_PASSWORD?.trim();
  return pw && pw.length > 0 ? pw : null;
}

/**
 * Parse a single Set-Cookie header (or array) and return just the
 * `name=value` pairs we need to send back as a Cookie header.
 */
function extractCookies(headers: Headers): string {
  // Node-compatible: try getSetCookie() if available (Node 20+/undici), else fallback.
  type HeadersWithGetSetCookie = Headers & {
    getSetCookie?: () => string[];
  };
  const h = headers as HeadersWithGetSetCookie;
  const setCookieList: string[] =
    typeof h.getSetCookie === "function"
      ? h.getSetCookie()
      : (() => {
          const raw = headers.get("set-cookie");
          return raw ? [raw] : [];
        })();

  return setCookieList
    .map((c) => c.split(";", 1)[0]?.trim())
    .filter((s): s is string => Boolean(s))
    .join("; ");
}

async function login(): Promise<string | null> {
  const password = getPassword();
  if (!password) return null;

  const baseUrl = getBaseUrl();
  const body = new URLSearchParams({ password }).toString();

  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html",
    },
    body,
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  // Successful login responds with 302 + Set-Cookie (session=...).
  if (res.status !== 302 && res.status !== 303 && res.status !== 200) {
    return null;
  }

  const cookie = extractCookies(res.headers);
  return cookie || null;
}

async function getSessionCookie(forceRefresh = false): Promise<string | null> {
  const now = Date.now();
  if (!forceRefresh && sessionCache && sessionCache.expiresAt > now) {
    return sessionCache.cookie;
  }
  const cookie = await login();
  if (!cookie) {
    sessionCache = null;
    return null;
  }
  sessionCache = { cookie, expiresAt: now + SESSION_TTL_MS };
  return cookie;
}

type DataTablesResponse<T> = {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
};

type RawTransferRow = {
  "Transfer Date": string;
  "IPv4 Range": string;
  "Recipient Organization": string;
  "Source Organization": string;
  "Registration Date"?: string;
  "Transfer Type": string;
  "Source RIR": string;
  "Recipient RIR": string;
  "Source Country"?: string;
  "Recipient Country"?: string;
};

function buildDataTablesQuery(
  rir: "arin" | "ripe" | "apnic",
  length: number,
): string {
  const columns =
    rir === "arin"
      ? [
          ["Transfer Date", "true"],
          ["IPv4 Range", "false"],
          ["Recipient Organization", "true"],
          ["Source Organization", "true"],
          ["Registration Date", "true"],
          ["Transfer Type", "true"],
          ["Source RIR", "true"],
          ["Recipient RIR", "true"],
        ]
      : [
          ["Transfer Date", "true"],
          ["IPv4 Range", "false"],
          ["Recipient Organization", "true"],
          ["Source Organization", "true"],
          ["Transfer Type", "true"],
          ["Source RIR", "true"],
          ["Recipient RIR", "true"],
        ];
  const params = new URLSearchParams({
    draw: "1",
    start: "0",
    length: String(length),
    "order[0][column]": "0",
    "order[0][dir]": "desc",
  });
  columns.forEach(([data, orderable], i) => {
    params.set(`columns[${i}][data]`, data);
    params.set(`columns[${i}][orderable]`, orderable);
  });
  return params.toString();
}

async function fetchRirData(
  rir: "arin" | "ripe" | "apnic",
  cookie: string,
  length: number,
): Promise<RawTransferRow[]> {
  const baseUrl = getBaseUrl();
  const qs = buildDataTablesQuery(rir, length);
  const res = await fetch(`${baseUrl}/api/${rir}/data?${qs}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookie,
    },
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Tracker /${rir}/data returned ${res.status}`);
  }
  const json = (await res.json()) as DataTablesResponse<RawTransferRow>;
  return Array.isArray(json?.data) ? json.data : [];
}

/** "208.71.255.0/24" → "/24"; returns null if it can't be parsed. */
function extractCidrSuffix(range: string): string | null {
  const m = /\/(\d{1,2})/.exec(range);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n < 8 || n > 32) return null;
  return `/${n}`;
}

/** Synthesize a USD total based on subnet size and a published price-per-IP table. */
const PRICE_PER_IP: Record<string, number> = {
  "/24": 19,
  "/23": 18.5,
  "/22": 18,
  "/21": 17.5,
  "/20": 17.25,
  "/19": 17,
  "/18": 16.75,
  "/17": 16.25,
  "/16": 15.5,
};
function estimatedTotalPrice(range: string): string {
  const suffix = extractCidrSuffix(range);
  if (!suffix) return "—";
  const prefix = parseInt(suffix.slice(1), 10);
  const ipCount = Math.pow(2, 32 - prefix);
  const price = PRICE_PER_IP[suffix] ?? 18;
  const total = Math.round(ipCount * price);
  return `$${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** "2026-04-24" → "4/24/26" (matches the existing UI's date format). */
function formatShortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${parseInt(mo, 10)}/${parseInt(d, 10)}/${y.slice(2)}`;
}

function toTransferLogEntry(row: RawTransferRow): TransferLogEntry {
  const sourceRir = (row["Source RIR"] || "ARIN").toUpperCase() as TransferLogRir;
  const recipientRir = (row["Recipient RIR"] || "ARIN").toUpperCase() as TransferLogRir;
  return {
    transferDate: formatShortDate(row["Transfer Date"]),
    ipv4Range: row["IPv4 Range"],
    recipientOrganization: row["Recipient Organization"] || "Unknown",
    sourceOrganization: row["Source Organization"] || "Unknown",
    registrationDate: row["Registration Date"]
      ? formatShortDate(row["Registration Date"])
      : "",
    transferType: row["Transfer Type"] || "",
    sourceRir,
    recipientRir,
  };
}

function toMarketSidebarTransferLog(
  row: RawTransferRow,
  ctaHref: string,
): TransferLog {
  return {
    date: formatShortDate(row["Transfer Date"]),
    subnet: row["IPv4 Range"],
    buyer: row["Recipient Organization"] || "Unknown",
    seller: row["Source Organization"] || "Unknown",
    totalPrice: estimatedTotalPrice(row["IPv4 Range"]),
    ctaHref,
  };
}

/**
 * Fetch the latest ARIN + RIPE transfer rows, sorted by transfer date desc.
 * Falls back to {@link staticTransferLogRows} if the tracker is unreachable
 * or no password is configured.
 */
export async function fetchArinRipeTransferLogs(
  perRirLimit: number = DEFAULT_PER_RIR_LIMIT,
): Promise<TransferLogEntry[]> {
  const password = getPassword();
  if (!password) return staticTransferLogRows;

  try {
    let cookie = await getSessionCookie();
    if (!cookie) return staticTransferLogRows;

    const fetchBoth = async () =>
      Promise.all([
        fetchRirData("arin", cookie!, perRirLimit),
        fetchRirData("ripe", cookie!, perRirLimit),
      ]);

    let arin: RawTransferRow[] = [];
    let ripe: RawTransferRow[] = [];
    try {
      [arin, ripe] = await fetchBoth();
    } catch {
      // session may have expired; force-refresh once
      cookie = await getSessionCookie(true);
      if (!cookie) return staticTransferLogRows;
      [arin, ripe] = await fetchBoth();
    }

    const combined = [...arin, ...ripe].map(toTransferLogEntry);
    combined.sort((a, b) =>
      b.transferDate.localeCompare(a.transferDate, "en", { numeric: true }),
    );
    return combined.length > 0 ? combined : staticTransferLogRows;
  } catch {
    return staticTransferLogRows;
  }
}

/**
 * Fetch the latest N transfers shaped for the home page's "Transfer Log Data"
 * sidebar panel (date/subnet/buyer/seller/totalPrice/ctaHref).
 */
export async function fetchLatestTransfersForSidebar(
  limit = 8,
  ctaHref = "/live-transfer-logs",
): Promise<TransferLog[]> {
  const password = getPassword();
  if (!password) {
    // Fall back to the static rows mapped into TransferLog shape.
    return staticTransferLogRows.slice(0, limit).map((r) => ({
      date: r.transferDate,
      subnet: r.ipv4Range,
      buyer: r.recipientOrganization,
      seller: r.sourceOrganization,
      totalPrice: estimatedTotalPrice(r.ipv4Range),
      ctaHref,
    }));
  }

  try {
    let cookie = await getSessionCookie();
    if (!cookie) throw new Error("no session");

    let arin: RawTransferRow[] = [];
    let ripe: RawTransferRow[] = [];
    try {
      [arin, ripe] = await Promise.all([
        fetchRirData("arin", cookie, Math.max(limit, 10)),
        fetchRirData("ripe", cookie, Math.max(limit, 10)),
      ]);
    } catch {
      cookie = await getSessionCookie(true);
      if (!cookie) throw new Error("no session after refresh");
      [arin, ripe] = await Promise.all([
        fetchRirData("arin", cookie, Math.max(limit, 10)),
        fetchRirData("ripe", cookie, Math.max(limit, 10)),
      ]);
    }

    const combined = [...arin, ...ripe];
    combined.sort((a, b) =>
      b["Transfer Date"].localeCompare(a["Transfer Date"], "en", {
        numeric: true,
      }),
    );
    return combined.slice(0, limit).map((row) => toMarketSidebarTransferLog(row, ctaHref));
  } catch {
    return staticTransferLogRows.slice(0, limit).map((r) => ({
      date: r.transferDate,
      subnet: r.ipv4Range,
      buyer: r.recipientOrganization,
      seller: r.sourceOrganization,
      totalPrice: estimatedTotalPrice(r.ipv4Range),
      ctaHref,
    }));
  }
}

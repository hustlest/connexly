import { NextResponse } from "next/server";
import {
  fetchTransferLogPage,
  MAX_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
  TRACKER_RIRS,
  type TrackerRir,
} from "@/lib/arin-transfer-log";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 25;
/**
 * Ceiling on how deep a caller may page. The largest dataset holds ~57k rows,
 * so this is well past the end of the data while still bounding the offsets we
 * forward to the tracker.
 */
const MAX_OFFSET = 200_000;

function parseIntParam(raw: string | null, fallback: number): number {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isInteger(n) ? n : NaN;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const rirParam = (params.get("rir") ?? "arin").toLowerCase();
  if (!TRACKER_RIRS.includes(rirParam as TrackerRir)) {
    return NextResponse.json(
      { error: `rir must be one of: ${TRACKER_RIRS.join(", ")}` },
      { status: 400 },
    );
  }
  const rir = rirParam as TrackerRir;

  const page = parseIntParam(params.get("page"), 0);
  const pageSize = parseIntParam(params.get("pageSize"), DEFAULT_PAGE_SIZE);
  if (!Number.isInteger(page) || page < 0) {
    return NextResponse.json({ error: "page must be an integer >= 0" }, { status: 400 });
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return NextResponse.json(
      { error: `pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}` },
      { status: 400 },
    );
  }

  const start = page * pageSize;
  if (start > MAX_OFFSET) {
    return NextResponse.json(
      { error: `page offset may not exceed ${MAX_OFFSET}` },
      { status: 400 },
    );
  }

  const search = (params.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);

  try {
    const { rows, total } = await fetchTransferLogPage({ rir, start, length: pageSize, search });
    return NextResponse.json(
      { rows, total, page, pageSize, rir, q: search },
      {
        headers: {
          // Edge/CDN caching: brief shared cache, served stale while revalidating.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    // The tracker is unreachable or unauthenticated. Report it rather than
    // serving static rows, which would look like a complete result set.
    return NextResponse.json(
      { error: "Transfer log tracker is unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

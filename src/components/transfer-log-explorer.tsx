"use client";

import { useEffect, useState } from "react";
import { TRACKER_RIRS, type TrackerRir } from "@/lib/arin-transfer-log";
import type { TransferLogEntry } from "@/lib/transfer-log-static";
import { TransferLogTable } from "@/components/ui/transfer-log-table";

const PAGE_SIZES = [10, 15, 25, 50];
const SEARCH_DEBOUNCE_MS = 300;

type PageResponse = {
  rows: TransferLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  rir: TrackerRir;
  q: string;
};

type SettleStatus = "ready" | "error";

export function TransferLogExplorer() {
  const [rir, setRir] = useState<TrackerRir>("arin");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PageResponse | null>(null);
  const [status, setStatus] = useState<SettleStatus>("ready");
  const [retryTick, setRetryTick] = useState(0);

  // Loading is derived, not set directly in the fetch effect: a plain key
  // built from the current query params is compared against the key of the
  // last response that settled. retryTick is folded in so retrying the same
  // query still reads as loading until the new attempt settles.
  const requestKey = `${rir}|${page}|${pageSize}|${search}|${retryTick}`;
  const [settledKey, setSettledKey] = useState<string | null>(null);

  // Debounce the visible search box into the value that actually drives the fetch.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const key = `${rir}|${page}|${pageSize}|${search}|${retryTick}`;

    const params = new URLSearchParams({
      rir,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) params.set("q", search);

    fetch(`/api/transfer-logs/page?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("request failed");
        return (await res.json()) as PageResponse;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus("ready");
        setSettledKey(key);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setSettledKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [rir, page, pageSize, search, retryTick]);

  function setRirAndResetPage(r: TrackerRir) {
    setRir(r);
    setPage(0);
  }

  function setPageSizeAndResetPage(size: number) {
    setPageSize(size);
    setPage(0);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(0);
  }

  function retry() {
    setRetryTick((t) => t + 1);
  }

  const loading = requestKey !== settledKey;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rows = data?.rows ?? [];
  const pageStart = page * pageSize;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-dark">
        <div className="flex gap-1">
          {TRACKER_RIRS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRirAndResetPage(r)}
              className={`relative px-4 py-2.5 text-sm font-bold tracking-[0.01em] transition-colors duration-200 ${
                rir === r ? "text-white" : "text-bone/60 hover:text-bone/80"
              }`}
            >
              {r.toUpperCase()}
              {rir === r ? (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-orange" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-[280px] pb-2.5 sm:w-auto">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40"
          >
            <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search any subnet or org"
            className="w-full rounded-[3px] border-[1.5px] border-bone/30 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-bone/40 focus:border-orange focus:outline-none"
          />
        </div>
      </div>

      <p className="mt-3 max-w-[720px] text-xs text-bone/50">
        Each tab pages through that registry&rsquo;s own records. A row&rsquo;s Source/Recipient
        Registry columns below show the actual counterparty on the transfer, which may differ
        from the active tab.
      </p>

      <div className="mt-6 rounded-[3px] bg-paper p-6 md:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-navy/70">
          <label className="flex items-center gap-2">
            Show
            <select
              value={pageSize}
              onChange={(e) => setPageSizeAndResetPage(Number(e.target.value))}
              className="rounded-[3px] border-[1.5px] border-navy/20 bg-white px-2 py-1 text-navy focus:border-orange focus:outline-none"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            entries
          </label>

          {searchInput ? (
            <button
              type="button"
              onClick={clearSearch}
              className="text-xs font-bold uppercase tracking-[0.05em] text-orange hover:text-navy"
            >
              Clear search
            </button>
          ) : null}
        </div>

        {status === "error" ? (
          <div className="py-10 text-center text-sm text-navy/60">
            <p>Couldn&rsquo;t load transfer records for {rir.toUpperCase()}.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-[3px] border-[1.5px] border-navy/20 px-3 py-1.5 text-xs font-bold text-navy transition-colors duration-200 hover:border-navy/40"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <TransferLogTable entries={rows} loading={loading} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-navy/45">
                Showing {rows.length === 0 ? 0 : pageStart + 1}–{pageStart + rows.length} of{" "}
                {total}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={loading || page === 0}
                  className="rounded-[3px] border-[1.5px] border-navy/20 px-3 py-1.5 text-xs font-bold text-navy transition-colors duration-200 hover:border-navy/40 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Prev
                </button>
                <span className="text-xs text-navy/60">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={loading || page >= totalPages - 1}
                  className="rounded-[3px] border-[1.5px] border-navy/20 px-3 py-1.5 text-xs font-bold text-navy transition-colors duration-200 hover:border-navy/40 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

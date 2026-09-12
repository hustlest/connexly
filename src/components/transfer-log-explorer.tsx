"use client";

import { useMemo, useState } from "react";
import type { Rir, TransferLogEntry } from "@/lib/types";
import { TransferLogTable } from "@/components/ui/transfer-log-table";

const RIR_FILTERS: ("ALL" | Rir)[] = ["ALL", "ARIN", "RIPE"];
const PAGE_SIZES = [10, 15, 25, 50];

function parseUsDate(value: string) {
  const [month, day, yearRaw] = value.split("/").map(Number);
  const year = yearRaw < 100 ? yearRaw + 2000 : yearRaw;
  return new Date(year, month - 1, day).getTime();
}

export function TransferLogExplorer({ entries }: { entries: TransferLogEntry[] }) {
  const [rir, setRir] = useState<"ALL" | Rir>("ALL");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pageSize, setPageSize] = useState(15);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTime = from ? new Date(from).getTime() : null;
    const toTime = to ? new Date(to).getTime() : null;

    return entries.filter((e) => {
      if (rir !== "ALL" && e.sourceRir !== rir && e.recipientRir !== rir) return false;
      if (
        q &&
        !e.ipv4Range.toLowerCase().includes(q) &&
        !e.recipientOrg.toLowerCase().includes(q) &&
        !e.sourceOrg.toLowerCase().includes(q)
      ) {
        return false;
      }
      const entryTime = parseUsDate(e.transferDate);
      if (fromTime !== null && entryTime < fromTime) return false;
      if (toTime !== null && entryTime > toTime) return false;
      return true;
    });
  }, [entries, rir, query, from, to]);

  const visible = filtered.slice(0, pageSize);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {RIR_FILTERS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRir(r)}
              className={`text-data rounded-[3px] border px-3 py-1.5 text-xs font-bold tracking-[0.02em] transition-colors duration-200 ${
                rir === r
                  ? "border-orange bg-orange text-white"
                  : "border-bone/30 text-bone/70 hover:border-bone/60 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-[280px] sm:w-auto">
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any subnet or org"
            className="w-full rounded-[3px] border-[1.5px] border-bone/30 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white placeholder:text-bone/40 focus:border-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 rounded-[3px] bg-paper p-6 md:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-navy/70">
          <label className="flex items-center gap-2">
            Show
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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

          <label className="flex items-center gap-2">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-[3px] border-[1.5px] border-navy/20 bg-white px-2 py-1 text-navy focus:border-orange focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-[3px] border-[1.5px] border-navy/20 bg-white px-2 py-1 text-navy focus:border-orange focus:outline-none"
            />
          </label>
        </div>

        <TransferLogTable entries={visible} />

        <div className="mt-4 text-xs text-navy/45">
          Showing {visible.length === 0 ? 0 : 1}–{visible.length} of {filtered.length}
        </div>
      </div>
    </div>
  );
}

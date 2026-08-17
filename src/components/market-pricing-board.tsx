"use client";

import { useMemo, useState } from "react";
import type { PricingBoardEntry, PricingBoardStats } from "@/lib/types";
import { RirBadge } from "@/components/ui/rir-badge";

export function MarketPricingBoard({
  entries,
  stats,
}: {
  entries: PricingBoardEntry[];
  stats: PricingBoardStats;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.subnet.toLowerCase().includes(q) || e.rir.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div className="min-w-0 rounded-[3px] bg-paper p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[19px] font-bold text-navy">Market Pricing Board</h2>
        <div className="relative w-full max-w-[280px] sm:w-auto">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/35"
          >
            <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any subnet"
            className="w-full rounded-[3px] border-[1.5px] border-navy/15 bg-white py-2 pl-9 pr-3 text-sm text-navy placeholder:text-navy/35 focus:border-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-y border-navy/10 py-5 sm:grid-cols-4">
        <div>
          <div className="text-xs text-navy/50">Transfers Today</div>
          <div className="text-data mt-1 text-lg font-bold text-navy">
            {stats.transfersToday}
          </div>
        </div>
        <div>
          <div className="text-xs text-navy/50">Addresses Moved</div>
          <div className="text-data mt-1 text-lg font-bold text-navy">
            {stats.addressesMoved.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-navy/50">Avg $/IP</div>
          <div className="text-data mt-1 text-lg font-bold text-navy">
            ${stats.avgPricePerIp.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-navy/50">Range</div>
          <div className="text-data mt-1 text-lg font-bold text-navy">
            ${stats.rangeLow.toLocaleString()} – ${stats.rangeHigh.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-5 max-h-[420px] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr>
              {["Subnet", "Price / IP", "Total", "RIR", "Date"].map((h) => (
                <th
                  key={h}
                  className="sticky top-0 border-b-2 border-navy bg-paper pb-2.5 pr-3 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#8994A2]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-line-light">
                <td className="py-3 pr-3">
                  <span className="text-data inline-flex rounded-[3px] border border-navy/20 px-2 py-0.5 text-xs font-bold text-navy">
                    {entry.subnet}
                  </span>
                </td>
                <td className="text-data py-3 pr-3 text-[#33465C]">
                  ${entry.pricePerIp.toFixed(2)}
                </td>
                <td className="text-data py-3 pr-3 font-bold text-orange">
                  ${entry.totalPrice.toLocaleString()}
                </td>
                <td className="py-3 pr-3">
                  <RirBadge rir={entry.rir} onLight />
                </td>
                <td className="text-data py-3 pr-3 text-[#33465C]/70 italic">{entry.date}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-navy/45">
                  No subnets match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

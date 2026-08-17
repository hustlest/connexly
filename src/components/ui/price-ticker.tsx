import type { TickerEntry } from "@/lib/types";

function formatUsd(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function TickerItems({ entries }: { entries: TickerEntry[] }) {
  return (
    <>
      {entries.map((e, i) => (
        <span key={i} className="text-data flex shrink-0 items-center gap-3 pr-10 text-[13px] text-bone/55">
          <span className="font-bold text-white">{formatUsd(e.totalPrice)}</span>
          <span className="text-bone/35">{e.date}</span>
          <span className="text-bone/35">·</span>
          <span>{e.subnet}</span>
          <span className="text-bone/35">·</span>
          <span className="text-orange">{e.rir}</span>
          <span className="text-bone/35">·</span>
          <span>${e.pricePerIp.toFixed(2)}</span>
        </span>
      ))}
    </>
  );
}

export function PriceTicker({ entries }: { entries: TickerEntry[] }) {
  return (
    <div className="mt-9 overflow-hidden border-y border-line-dark py-4">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-bone/45">
        Avg weekly price per subnet
      </div>
      <div className="flex w-max">
        <div className="ticker-track flex w-max">
          <TickerItems entries={entries} />
          <TickerItems entries={entries} />
        </div>
      </div>
    </div>
  );
}

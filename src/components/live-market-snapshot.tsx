import Link from "next/link";
import type { MarketSnapshot } from "@/lib/types";
import { RirBadge } from "@/components/ui/rir-badge";

export function LiveMarketSnapshot({ snapshot }: { snapshot: MarketSnapshot }) {
  return (
    <div className="min-w-0 rounded-[3px] bg-paper p-6 md:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-[19px] font-bold text-navy">Live Market Snapshot</h2>
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#4E9469]">
          Auto-refresh
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#8994A2]">
          Market Depth
        </div>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">RIR</dt>
            <dd>
              <RirBadge rir={snapshot.rir} onLight />
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">Subnet</dt>
            <dd className="text-data font-bold text-navy">{snapshot.subnet}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">Weekly Avg $/IP</dt>
            <dd className="text-data font-bold text-navy">
              ${snapshot.weeklyAvgPricePerIp.toFixed(2)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">Total Price</dt>
            <dd className="text-data font-bold text-orange">
              ${snapshot.totalPrice.toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full rounded-full bg-orange"
            style={{ width: `${snapshot.depthPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-7 border-t border-navy/10 pt-6">
        <div className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#8994A2]">
          Latest Transfer
        </div>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">Date</dt>
            <dd className="text-data text-navy">{snapshot.latestTransfer.date}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">Subnet</dt>
            <dd className="text-data text-navy">{snapshot.latestTransfer.subnet}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-navy/55">Buyer</dt>
            <dd className="truncate text-right text-navy">{snapshot.latestTransfer.buyer}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-navy/55">Seller</dt>
            <dd className="truncate text-right text-navy">{snapshot.latestTransfer.seller}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-navy/55">Total Price</dt>
            <dd className="text-data font-bold text-orange">
              ${snapshot.latestTransfer.totalPrice.toLocaleString()}
            </dd>
          </div>
        </dl>

        <Link
          href="/transfer-logs"
          className="mt-6 inline-flex w-full items-center justify-center rounded-[3px] bg-navy px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-navy/85"
        >
          View Full Transfer Log
        </Link>
      </div>
    </div>
  );
}

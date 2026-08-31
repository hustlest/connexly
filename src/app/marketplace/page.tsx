import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PriceTicker } from "@/components/ui/price-ticker";
import { MarketPricingBoard } from "@/components/market-pricing-board";
import { LiveMarketSnapshot } from "@/components/live-market-snapshot";
import {
  getMarketSnapshot,
  getPricingBoardEntries,
  getPricingBoardStats,
  getTickerEntries,
} from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Marketplace — Connexly",
  description: "Real-time IPv4 market pricing across ARIN, RIPE, and APNIC.",
};

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const [entries, stats, ticker, snapshot] = await Promise.all([
    getPricingBoardEntries(),
    getPricingBoardStats(),
    getTickerEntries(),
    getMarketSnapshot(),
  ]);

  return (
    <Container className="py-16 md:py-20">
      <div className="max-w-[720px]">
        <h1 className="text-[32px] font-light leading-[1.1] tracking-[-0.01em] text-white md:text-[44px]">
          Marketplace
        </h1>
        <p className="mt-3 text-[17px] font-light leading-[1.55] text-bone/78">
          Live IPv4 pricing across ARIN, RIPE, and APNIC — updated in
          real time.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/10 px-4 py-2">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-orange">
            <path
              fill="currentColor"
              d="M10 1.5l6.5 2.4v5.1c0 4.4-2.8 7.9-6.5 9.5-3.7-1.6-6.5-5.1-6.5-9.5V3.9L10 1.5zm0 2.1L5.5 5.2v3.8c0 3.4 2 6.1 4.5 7.4 2.5-1.3 4.5-4 4.5-7.4V5.2L10 3.6z"
            />
          </svg>
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-orange-bright">
            ARIN Qualified Facilitator
          </span>
        </div>
      </div>

      <PriceTicker entries={ticker} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <MarketPricingBoard entries={entries} stats={stats} />
        <LiveMarketSnapshot snapshot={snapshot} />
      </div>
    </Container>
  );
}

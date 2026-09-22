export type Rir = "ARIN" | "RIPE" | "APNIC";

// Same situation for the market-data feed: a live sheet could technically
// contain LACNIC/AFRINIC. Scoped independently from TransferLogRir since
// Marketplace and Transfer Logs are wired up and evolve separately.
export type MarketRir = Rir | "LACNIC" | "AFRINIC";

export interface PricingBoardEntry {
  id: string;
  subnet: string;
  pricePerIp: number;
  totalPrice: number;
  rir: MarketRir;
  date: string;
}

export interface PricingBoardStats {
  transfersToday: number;
  addressesMoved: number;
  avgPricePerIp: number;
  rangeLow: number;
  rangeHigh: number;
}

export interface TickerEntry {
  totalPrice: number;
  date: string;
  subnet: string;
  rir: MarketRir;
  pricePerIp: number;
}

export interface MarketSnapshot {
  rir: MarketRir;
  subnet: string;
  weeklyAvgPricePerIp: number;
  totalPrice: number;
  depthPercent: number;
  latestTransfer: {
    date: string;
    subnet: string;
    buyer: string;
    seller: string;
    totalPrice: number;
  };
}

export interface Testimonial {
  quote: string;
  name: string;
  org: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  photo?: string;
}

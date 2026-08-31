export type Rir = "ARIN" | "RIPE" | "APNIC";

// The live transfer-log feed's RIR union is wider than the rest of the
// site's (it also reports LACNIC/AFRINIC), even though in practice it only
// ever queries ARIN and RIPE. Scoped to transfer logs so it doesn't widen
// `Rir` for Marketplace, which is being wired up separately.
export type TransferLogRir = Rir | "LACNIC" | "AFRINIC";

export interface PricingBoardEntry {
  id: string;
  subnet: string;
  pricePerIp: number;
  totalPrice: number;
  rir: Rir;
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
  rir: Rir;
  pricePerIp: number;
}

export interface MarketSnapshot {
  rir: Rir;
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

export interface TransferLogEntry {
  id: string;
  transferDate: string;
  ipv4Range: string;
  recipientOrg: string;
  sourceOrg: string;
  registrationDate: string;
  transferType: string;
  sourceRir: TransferLogRir;
  recipientRir: TransferLogRir;
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

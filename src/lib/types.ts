export type Rir = "ARIN" | "RIPE" | "APNIC";

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
  sourceRir: Rir;
  recipientRir: Rir;
}

export interface Testimonial {
  quote: string;
  name: string;
  org: string;
  isPlaceholder?: boolean;
}

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  isPlaceholder?: boolean;
}

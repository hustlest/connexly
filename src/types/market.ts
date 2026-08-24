export type Rir = "ARIN" | "RIPE" | "APNIC" | "LACNIC" | "AFRINIC";

export type NavItem = {
  label: string;
  href: string;
};

export type TickerItem = {
  block: string;
  rir: Rir;
  pricePerIp: string;
  changePct?: number;
};

export type PriceBoardRow = {
  block: string;
  pricePerIp: string;
  totalPrice: string;
  rir: Rir;
  date: string;
};

export type MarketSnapshot = {
  rir: Rir;
  subnet: string;
  weeklyAvgPricePerIp: string;
  totalPrice: string;
  /** Progress 0–100, for the progress bar. Defaults to 65 if omitted. */
  progressPercent?: number;
};

export type TransferLog = {
  date: string;
  subnet: string;
  buyer: string;
  seller: string;
  totalPrice: string;
  ctaHref: string;
};

export type MarketStats = {
  transfersToday: number;
  addressesMoved: string;
  avgPricePerIp: string;
  rangeLow: string;
  rangeHigh: string;
};

export type HomePageContent = {
  brand: string;
  navItems: NavItem[];
  heroTitle: string;
  heroSubtitle: string;
  tickerLabel: string;
  tickerItems: TickerItem[];
  boardTitle: string;
  boardSearchPlaceholder: string;
  boardRows: PriceBoardRow[];
  stats?: MarketStats;
  snapshotTitle: string;
  snapshot: MarketSnapshot;
  transferTitle: string;
  transferLog: TransferLog;
  footerTagline: string;
  footerListOnce: string;
  footerSyndicated: string;
  copyright: string;
};

import type {
  MarketSnapshot,
  PricingBoardEntry,
  PricingBoardStats,
  Rir,
  TickerEntry,
} from "./types";

const SUBNET_SIZE_TO_IP_COUNT: Record<string, number> = {
  "/16": 65536,
  "/17": 32768,
  "/18": 16384,
  "/19": 8192,
  "/20": 4096,
  "/21": 2048,
  "/22": 1024,
  "/23": 512,
  "/24": 256,
};

function ipCountFor(subnet: string) {
  return SUBNET_SIZE_TO_IP_COUNT[subnet] ?? 256;
}

function boardEntry(
  id: string,
  subnet: string,
  pricePerIp: number,
  rir: Rir,
  date: string
): PricingBoardEntry {
  return {
    id,
    subnet,
    pricePerIp,
    totalPrice: Math.round(pricePerIp * ipCountFor(subnet) * 100) / 100,
    rir,
    date,
  };
}

// Mock data layer mirroring what the ported IPv4Xchange pricing feed
// returns, so these getters can be swapped for a live fetch without
// touching call sites.
const PRICING_BOARD_ENTRIES: PricingBoardEntry[] = [
  boardEntry("PB-01", "/22", 18.0, "ARIN", "8/13/26"),
  boardEntry("PB-02", "/20", 17.25, "RIPE", "8/12/26"),
  boardEntry("PB-03", "/22", 18.0, "ARIN", "8/11/26"),
  boardEntry("PB-04", "/21", 17.5, "APNIC", "8/10/26"),
  boardEntry("PB-05", "/17", 16.25, "RIPE", "8/9/26"),
  boardEntry("PB-06", "/22", 18.0, "RIPE", "8/8/26"),
  boardEntry("PB-07", "/23", 18.5, "RIPE", "8/7/26"),
  boardEntry("PB-08", "/24", 22.5, "ARIN", "8/6/26"),
  boardEntry("PB-09", "/20", 16.9, "APNIC", "8/5/26"),
  boardEntry("PB-10", "/19", 15.75, "RIPE", "8/4/26"),
  boardEntry("PB-11", "/18", 15.1, "APNIC", "8/3/26"),
  boardEntry("PB-12", "/21", 18.2, "ARIN", "8/2/26"),
  boardEntry("PB-13", "/22", 19.0, "RIPE", "7/30/26"),
  boardEntry("PB-14", "/16", 14.5, "APNIC", "7/22/26"),
];

const TICKER_ENTRIES: TickerEntry[] = PRICING_BOARD_ENTRIES.slice(0, 10).map((e) => ({
  totalPrice: e.totalPrice,
  date: e.date,
  subnet: e.subnet,
  rir: e.rir,
  pricePerIp: e.pricePerIp,
}));

const MARKET_SNAPSHOT: MarketSnapshot = {
  rir: "RIPE",
  subnet: "/20",
  weeklyAvgPricePerIp: 17.25,
  totalPrice: 70656,
  depthPercent: 62,
  latestTransfer: {
    date: "8/14/26",
    subnet: "158.51.0.0/23",
    buyer: "Arrow Datacenters Inc.",
    seller: "Meridian Networks LLC",
    totalPrice: 9472,
  },
};

export async function getPricingBoardEntries(): Promise<PricingBoardEntry[]> {
  return PRICING_BOARD_ENTRIES;
}

export async function getTickerEntries(): Promise<TickerEntry[]> {
  return TICKER_ENTRIES;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  return MARKET_SNAPSHOT;
}

const PRICING_BOARD_STATS: PricingBoardStats = {
  transfersToday: 12,
  addressesMoved: 63744,
  avgPricePerIp: 17.68,
  rangeLow: 5760,
  rangeHigh: 950272,
};

export async function getPricingBoardStats(): Promise<PricingBoardStats> {
  return PRICING_BOARD_STATS;
}

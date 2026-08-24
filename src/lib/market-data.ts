import type { HomePageContent } from "@/types/market";

export const fallbackData: HomePageContent = {
  brand: "IPv4Xchange",
  navItems: [
    { label: "Market Pricing Board", href: "#market-pricing-board" },
    { label: "Live Transfer Logs", href: "/live-transfer-logs" },
    { label: "About Us", href: "/about-us" },
  ],
  heroTitle: "Real-Time IPv4 Market Intelligence",
  heroSubtitle:
    "Comprehensive pricing data from leading brokers - empowering informed decisions for commodity customers and the IPv4 market.",
  tickerLabel: "Avg weekly price per subnet",
  tickerItems: [
    { block: "/24", rir: "ARIN", pricePerIp: "$28.85/IP" },
    { block: "/19", rir: "RIPE", pricePerIp: "$15.50/IP" },
    { block: "/18", rir: "ARIN", pricePerIp: "$28.85/IP" },
    { block: "/21", rir: "RIPE", pricePerIp: "$17.50/IP" },
    { block: "/16", rir: "ARIN", pricePerIp: "$15.50/IP" },
  ],
  boardTitle: "Market Pricing Board",
  boardSearchPlaceholder: "Search any subnet",
  boardRows: [
    {
      block: "/21",
      pricePerIp: "$17.50",
      totalPrice: "$35,000",
      rir: "RIPE",
      date: "2/25/26",
    },
    {
      block: "/21",
      pricePerIp: "$17.50",
      totalPrice: "$35,000",
      rir: "ARIN",
      date: "2/25/26",
    },
    {
      block: "/19",
      pricePerIp: "$15.50",
      totalPrice: "$126,976",
      rir: "RIPE",
      date: "2/24/26",
    },
    {
      block: "/24",
      pricePerIp: "$25.68",
      totalPrice: "$6,574",
      rir: "ARIN",
      date: "2/24/26",
    },
    {
      block: "/20",
      pricePerIp: "$16.90",
      totalPrice: "$69,222",
      rir: "RIPE",
      date: "2/23/26",
    },
    {
      block: "/22",
      pricePerIp: "$18.25",
      totalPrice: "$18,688",
      rir: "ARIN",
      date: "2/23/26",
    },
    {
      block: "/17",
      pricePerIp: "$15.80",
      totalPrice: "$2,070,118",
      rir: "APNIC",
      date: "2/22/26",
    },
    {
      block: "/18",
      pricePerIp: "$15.95",
      totalPrice: "$1,045,299",
      rir: "LACNIC",
      date: "2/22/26",
    },
    {
      block: "/23",
      pricePerIp: "$21.40",
      totalPrice: "$10,957",
      rir: "RIPE",
      date: "2/21/26",
    },
    {
      block: "/24",
      pricePerIp: "$26.10",
      totalPrice: "$6,682",
      rir: "ARIN",
      date: "2/21/26",
    },
    {
      block: "/19",
      pricePerIp: "$15.65",
      totalPrice: "$128,205",
      rir: "APNIC",
      date: "2/20/26",
    },
    {
      block: "/20",
      pricePerIp: "$16.75",
      totalPrice: "$68,608",
      rir: "AFRINIC",
      date: "2/20/26",
    },
    {
      block: "/21",
      pricePerIp: "$17.80",
      totalPrice: "$36,454",
      rir: "ARIN",
      date: "2/19/26",
    },
    {
      block: "/22",
      pricePerIp: "$18.05",
      totalPrice: "$18,483",
      rir: "LACNIC",
      date: "2/19/26",
    },
    {
      block: "/16",
      pricePerIp: "$15.40",
      totalPrice: "$1,009,254",
      rir: "RIPE",
      date: "2/18/26",
    },
    {
      block: "/17",
      pricePerIp: "$15.55",
      totalPrice: "$2,037,350",
      rir: "ARIN",
      date: "2/18/26",
    },
    {
      block: "/23",
      pricePerIp: "$21.15",
      totalPrice: "$10,829",
      rir: "APNIC",
      date: "2/17/26",
    },
    {
      block: "/24",
      pricePerIp: "$25.95",
      totalPrice: "$6,644",
      rir: "RIPE",
      date: "2/17/26",
    },
    {
      block: "/19",
      pricePerIp: "$15.35",
      totalPrice: "$125,747",
      rir: "LACNIC",
      date: "2/16/26",
    },
    {
      block: "/20",
      pricePerIp: "$16.60",
      totalPrice: "$67,994",
      rir: "ARIN",
      date: "2/16/26",
    },
    {
      block: "/21",
      pricePerIp: "$17.25",
      totalPrice: "$35,328",
      rir: "AFRINIC",
      date: "2/15/26",
    },
    {
      block: "/22",
      pricePerIp: "$18.30",
      totalPrice: "$18,739",
      rir: "RIPE",
      date: "2/15/26",
    },
    {
      block: "/18",
      pricePerIp: "$15.72",
      totalPrice: "$1,030,881",
      rir: "APNIC",
      date: "2/14/26",
    },
    {
      block: "/24",
      pricePerIp: "$26.25",
      totalPrice: "$6,720",
      rir: "ARIN",
      date: "2/14/26",
    },
  ],
  snapshotTitle: "Live Market Snapshot",
  snapshot: {
    rir: "ARIN",
    subnet: "/16",
    weeklyAvgPricePerIp: "$15.50",
    totalPrice: "$1,015,808",
  },
  transferTitle: "Transfer Log Data",
  transferLog: {
    date: "2/15/26",
    subnet: "/16",
    buyer: "Buyer",
    seller: "Seller",
    totalPrice: "RIPE",
    ctaHref: "/live-transfer-logs",
  },
  footerTagline: "Comprehensive IPv4 market intelligence.",
  footerListOnce: "LIST ONCE. REACH MANY.",
  footerSyndicated:
    "Syndicated visibility across lending brokers.\nTransparent pricing. No auctions - just quotes.",
  copyright: "©2026 IPv4Xchange. All rights reserved.",
};

async function fetchFromSheets(): Promise<HomePageContent | null> {
  try {
    const { fetchMarketDataFromSheets } = await import("./sheets-market-data");
    return fetchMarketDataFromSheets();
  } catch {
    return null;
  }
}

export async function getMarketData(): Promise<HomePageContent> {
  const fromSheets = await fetchFromSheets();
  const data = fromSheets ?? fallbackData;
  const { computeSnapshotFromBoardRows, computeStatsFromBoardRows } = await import("./sheets-market-data");
  data.snapshot = computeSnapshotFromBoardRows(data.boardRows);
  data.stats = computeStatsFromBoardRows(data.boardRows);

  // Replace the static "Transfer Log Data" card with the most recent live entry.
  try {
    const { fetchLatestTransfersForSidebar } = await import("./arin-transfer-log");
    const live = await fetchLatestTransfersForSidebar(1, data.transferLog.ctaHref);
    if (live.length > 0) {
      data.transferLog = live[0];
    }
  } catch {
    // Keep the fallback transferLog if live fetch fails.
  }

  return data;
}

import { cache } from "react";
import type {
  MarketSnapshot,
  PricingBoardEntry,
  PricingBoardStats,
  TickerEntry,
} from "./types";
import { getMarketData } from "./market-data";

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

// The API returns pre-formatted display strings (e.g. "$17.50", "63,744")
// everywhere; the existing components call .toFixed()/.toLocaleString() on
// raw numbers. This strips everything but digits and the decimal point.
function parseNumericString(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

// getMarketData() hits Google Sheets / the ARIN tracker — share one fetch
// per request across all four getters below instead of four.
const getCachedMarketData = cache(getMarketData);

async function getBoardEntries(): Promise<PricingBoardEntry[]> {
  const data = await getCachedMarketData();
  return data.boardRows.map((row, i) => ({
    id: `PB-${i + 1}`,
    subnet: row.block,
    pricePerIp: parseNumericString(row.pricePerIp),
    totalPrice: parseNumericString(row.totalPrice),
    rir: row.rir,
    date: row.date,
  }));
}

export async function getPricingBoardEntries(): Promise<PricingBoardEntry[]> {
  return getBoardEntries();
}

export async function getTickerEntries(): Promise<TickerEntry[]> {
  const [data, entries] = await Promise.all([getCachedMarketData(), getBoardEntries()]);

  return data.tickerItems.map((item) => {
    // Ticker items carry no date/totalPrice of their own — the API derives
    // them from a same-block boardRows entry in the first place, so recover
    // those fields (and reuse the already-parsed price) from that sibling
    // row rather than re-parsing item.pricePerIp's "$x.xx/IP" format.
    const match = entries.find((e) => e.subnet === item.block);
    if (match) {
      return {
        totalPrice: match.totalPrice,
        date: match.date,
        subnet: match.subnet,
        rir: match.rir,
        pricePerIp: match.pricePerIp,
      };
    }

    const pricePerIp = parseNumericString(item.pricePerIp);
    return {
      totalPrice: Math.round(pricePerIp * ipCountFor(item.block) * 100) / 100,
      date: "—",
      subnet: item.block,
      rir: item.rir,
      pricePerIp,
    };
  });
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const data = await getCachedMarketData();
  const snapshot = data.snapshot;
  const transfer = data.transferLog;

  return {
    rir: snapshot.rir,
    subnet: snapshot.subnet,
    weeklyAvgPricePerIp: parseNumericString(snapshot.weeklyAvgPricePerIp),
    totalPrice: parseNumericString(snapshot.totalPrice),
    depthPercent: snapshot.progressPercent ?? 65,
    latestTransfer: {
      date: transfer.date,
      subnet: transfer.subnet,
      buyer: transfer.buyer,
      seller: transfer.seller,
      totalPrice: parseNumericString(transfer.totalPrice),
    },
  };
}

export async function getPricingBoardStats(): Promise<PricingBoardStats> {
  const data = await getCachedMarketData();
  const stats = data.stats;
  if (!stats) {
    return {
      transfersToday: 0,
      addressesMoved: 0,
      avgPricePerIp: 0,
      rangeLow: 0,
      rangeHigh: 0,
    };
  }

  return {
    transfersToday: stats.transfersToday,
    addressesMoved: parseNumericString(stats.addressesMoved),
    avgPricePerIp: parseNumericString(stats.avgPricePerIp),
    rangeLow: parseNumericString(stats.rangeLow),
    rangeHigh: parseNumericString(stats.rangeHigh),
  };
}

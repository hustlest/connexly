import type { HomePageContent, MarketSnapshot, MarketStats, PriceBoardRow, Rir } from "@/types/market";
import { getSheetValues, tabRange } from "./google-sheets";
import { fallbackData } from "./market-data";

const VALID_RIRS: Rir[] = ["ARIN", "RIPE", "APNIC", "LACNIC", "AFRINIC"];

function parsePricePerIp(s: string): number {
  return parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
}

function parseTotalPrice(s: string): number {
  return parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
}

function parseBlockPrefix(block: string): number {
  const m = block.match(/^\/(\d+)$/);
  return m ? parseInt(m[1], 10) : 32;
}

export function computeSnapshotFromBoardRows(boardRows: PriceBoardRow[]): MarketSnapshot {
  if (!boardRows.length) return fallbackData.snapshot;
  const smallestBlockRow = boardRows.reduce((a, b) =>
    parseBlockPrefix(a.block) >= parseBlockPrefix(b.block) ? a : b
  );
  const smallestBlock = smallestBlockRow.block;
  const rowsForBlock = boardRows.filter((r) => r.block === smallestBlock);
  const avgPrice =
    rowsForBlock.length > 0
      ? rowsForBlock.reduce((sum, r) => sum + parsePricePerIp(r.pricePerIp), 0) / rowsForBlock.length
      : parsePricePerIp(smallestBlockRow.pricePerIp);
  const totalSum = rowsForBlock.reduce((sum, r) => sum + parseTotalPrice(r.totalPrice), 0);
  const formatAvg = (n: number) => `$${n.toFixed(2)}`;
  const formatTotal = (n: number) =>
    `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const totals = boardRows.map((r) => parseTotalPrice(r.totalPrice));
  const minT = Math.min(...totals);
  const maxT = Math.max(...totals);
  const minW = 18;
  const maxW = 92;
  const progressPercent =
    maxT === minT ? 1 : minW + ((totalSum - minT) / (maxT - minT)) * (maxW - minW);

  return {
    rir: smallestBlockRow.rir,
    subnet: smallestBlock,
    weeklyAvgPricePerIp: formatAvg(avgPrice),
    totalPrice: formatTotal(totalSum),
    progressPercent: Math.min(maxW, Math.max(minW, progressPercent)),
  };
}

function ipCount(block: string): number {
  const m = block.match(/^\/(\d+)$/);
  return m ? Math.pow(2, 32 - parseInt(m[1], 10)) : 0;
}

export function computeStatsFromBoardRows(boardRows: PriceBoardRow[]): MarketStats {
  if (!boardRows.length) {
    return {
      transfersToday: 0,
      addressesMoved: "0",
      avgPricePerIp: "$0.00",
      rangeLow: "$0",
      rangeHigh: "$0",
    };
  }
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${String(today.getFullYear()).slice(-2)}`;
  const transfersToday = boardRows.filter((r) => r.date === todayStr).length;
  const addressesMoved = boardRows.reduce((sum, r) => sum + ipCount(r.block), 0);
  const prices = boardRows.map((r) => parsePricePerIp(r.pricePerIp));
  const totals = boardRows.map((r) => parseTotalPrice(r.totalPrice));
  const avgPrice =
    prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minT = Math.min(...totals);
  const maxT = Math.max(...totals);
  return {
    transfersToday: transfersToday || boardRows.length,
    addressesMoved: addressesMoved.toLocaleString("en-US"),
    avgPricePerIp: `$${avgPrice.toFixed(2)}`,
    rangeLow: `$${minT.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    rangeHigh: `$${maxT.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  };
}

function parseSheetRow(row: string[]): PriceBoardRow | null {
  if (row.length < 5) return null;
  const [dateRaw, block, rirRaw, totalPrice, pricePerIp] = row;
  if (!dateRaw || !block || !rirRaw || !totalPrice || !pricePerIp) return null;
  const rir = VALID_RIRS.includes(rirRaw as Rir) ? (rirRaw as Rir) : "ARIN";
  const date = formatDate(dateRaw);
  return {
    block: block.startsWith("/") ? block : `/${block}`,
    pricePerIp: pricePerIp.startsWith("$") ? pricePerIp : `$${pricePerIp}`,
    totalPrice: totalPrice.startsWith("$") ? totalPrice : `$${totalPrice}`,
    rir,
    date,
  };
}

function formatDate(raw: string): string {
  const parts = raw.split("/");
  if (parts.length !== 3) return raw;
  const [m, d, y] = parts;
  const year = y && y.length === 4 ? y.slice(-2) : y ?? "";
  return `${m}/${d}/${year}`;
}

function deriveTickerItems(boardRows: PriceBoardRow[]) {
  const byBlock = new Map<string, { price: string; rir: Rir }>();
  for (const r of boardRows) {
    if (!byBlock.has(r.block)) byBlock.set(r.block, { price: r.pricePerIp, rir: r.rir });
  }
  const blocks = ["/24", "/19", "/18", "/21", "/16"];
  return blocks.map((block) => {
    const v = byBlock.get(block) ?? fallbackData.tickerItems.find((t) => t.block === block);
    return {
      block,
      rir: (v as { rir: Rir })?.rir ?? "ARIN",
      pricePerIp: (v as { price: string })?.price ?? "$0/IP",
    };
  });
}

export async function fetchMarketDataFromSheets(): Promise<HomePageContent | null> {
  try {
    const rows = await getSheetValues(tabRange("A:E"));
    if (rows.length < 2) {
      console.log("[sheets-market-data] fetchMarketDataFromSheets: too few rows (" + rows.length + "), returning null");
      return null;
    }
    const header = rows[0].map((h) => h?.toLowerCase() ?? "");
    const dataStart = header[0]?.includes("date") ? 1 : 0;
    const boardRows: PriceBoardRow[] = [];
    for (let i = dataStart; i < rows.length; i++) {
      const row = parseSheetRow(rows[i]);
      if (row) boardRows.push(row);
    }
    const snapshot = computeSnapshotFromBoardRows(boardRows);
    const stats = computeStatsFromBoardRows(boardRows);
    const firstRow = boardRows[0];
    const transferLog = firstRow
      ? {
          date: firstRow.date,
          subnet: firstRow.block,
          buyer: "—",
          seller: "—",
          totalPrice: firstRow.rir,
          ctaHref: "/live-transfer-logs",
        }
      : fallbackData.transferLog;
    const tickerItems = deriveTickerItems(boardRows);
    return {
      ...fallbackData,
      boardRows: boardRows.slice(0, 24),
      tickerItems,
      stats,
      snapshot,
      transferLog,
    };
  } catch {
    return null;
  }
}

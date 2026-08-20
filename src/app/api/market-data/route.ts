import { NextResponse } from "next/server";
import { fallbackData, getMarketData } from "@/lib/market-data";
import { computeSnapshotFromBoardRows } from "@/lib/sheets-market-data";

export async function GET() {
  try {
    const data = await getMarketData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/market-data]", err);
    const data = {
      ...fallbackData,
      snapshot: computeSnapshotFromBoardRows(fallbackData.boardRows),
    };
    return NextResponse.json(data);
  }
}

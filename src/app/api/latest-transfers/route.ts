import { NextResponse } from "next/server";
import { fetchLatestTransfersForSidebar } from "@/lib/arin-transfer-log";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const limit = Math.min(
    25,
    Math.max(1, limitRaw ? parseInt(limitRaw, 10) || 8 : 8),
  );

  const transfers = await fetchLatestTransfersForSidebar(limit);
  return NextResponse.json(transfers, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

import { NextResponse } from "next/server";
import { fetchArinRipeTransferLogs } from "@/lib/arin-transfer-log";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await fetchArinRipeTransferLogs();
  return NextResponse.json(rows, {
    headers: {
      // Edge/CDN caching: brief shared cache, served stale while revalidating.
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

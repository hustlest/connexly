import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { TransferLogExplorer } from "@/components/transfer-log-explorer";
import { getTransferLogs } from "@/lib/transfer-logs";

export const metadata: Metadata = {
  title: "Transfer Logs — Connexly",
  description: "Search public IPv4 registry transfer records across ARIN and RIPE.",
};

export default async function TransferLogsPage() {
  const entries = await getTransferLogs();

  return (
    <Container className="py-16 md:py-20">
      <h1 className="text-[32px] font-light leading-[1.1] tracking-[-0.01em] text-white md:text-[44px]">
        Transfer Logs
      </h1>
      <p className="mt-3 max-w-[640px] text-[17px] font-light leading-[1.55] text-bone/78">
        A transparent, up-to-date record of completed IPv4 transfers.
      </p>

      <div className="mt-10">
        <TransferLogExplorer entries={entries} />
      </div>
    </Container>
  );
}

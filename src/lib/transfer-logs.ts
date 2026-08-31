import type { TransferLogEntry } from "./types";
import { fetchArinRipeTransferLogs } from "./arin-transfer-log";

export async function getTransferLogs(): Promise<TransferLogEntry[]> {
  const rows = await fetchArinRipeTransferLogs();
  return rows.map((row, i) => ({
    id: `TL-${i + 1}`,
    transferDate: row.transferDate,
    ipv4Range: row.ipv4Range,
    recipientOrg: row.recipientOrganization,
    sourceOrg: row.sourceOrganization,
    registrationDate: row.registrationDate,
    transferType: row.transferType,
    sourceRir: row.sourceRir,
    recipientRir: row.recipientRir,
  }));
}

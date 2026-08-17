import type { TransferLogEntry } from "@/lib/types";
import { RirBadge } from "./rir-badge";

const HEADERS = [
  "Transfer Date",
  "IPv4 Range",
  "Recipient Organization",
  "Source Organization",
  "Registration Date",
  "Transfer Type",
  "Source RIR",
  "Recipient RIR",
];

export function TransferLogTable({ entries }: { entries: TransferLogEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="border-b-2 border-navy pb-2.5 pr-4 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#8994A2]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-line-light">
              <td className="text-data py-3 pr-4 text-[#33465C]">{entry.transferDate}</td>
              <td className="text-data py-3 pr-4 font-bold text-navy">{entry.ipv4Range}</td>
              <td className="py-3 pr-4 text-[#33465C]">{entry.recipientOrg}</td>
              <td className="py-3 pr-4 text-[#33465C]">{entry.sourceOrg}</td>
              <td className="text-data py-3 pr-4 text-[#33465C]/70 italic">
                {entry.registrationDate}
              </td>
              <td className="py-3 pr-4">
                <span className="text-data inline-flex rounded-[3px] bg-sage/40 px-2 py-0.5 text-[11px] font-bold text-[#1E5A34]">
                  {entry.transferType}
                </span>
              </td>
              <td className="py-3 pr-4">
                <RirBadge rir={entry.sourceRir} onLight />
              </td>
              <td className="py-3 pr-4">
                <RirBadge rir={entry.recipientRir} onLight />
              </td>
            </tr>
          ))}
          {entries.length === 0 ? (
            <tr>
              <td colSpan={HEADERS.length} className="py-10 text-center text-sm text-navy/45">
                No transfers match these filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

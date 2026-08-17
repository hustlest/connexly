import type { Rir } from "@/lib/types";

export function RirBadge({ rir, onLight = false }: { rir: Rir; onLight?: boolean }) {
  return (
    <span
      className={`text-data inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[11px] font-bold tracking-[0.02em] ${
        onLight
          ? "border-navy/25 text-navy/75"
          : "border-bone/30 text-bone/80"
      }`}
    >
      {rir}
    </span>
  );
}

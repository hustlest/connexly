"use client";

import { useReducedMotion } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";

export function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <h1 className="max-w-[720px] text-[40px] font-light leading-[1.08] tracking-[-0.01em] text-white md:text-[56px]">
      <TextScramble as="span" trigger={!prefersReducedMotion}>
        IPv4 addresses, handled end to end.
      </TextScramble>
    </h1>
  );
}

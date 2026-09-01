"use client";

import { useReducedMotion } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";

export function ScrambleHeading({
  as = "h1",
  className,
  children,
  duration,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: string;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <TextScramble
      as={as}
      className={className}
      trigger={!prefersReducedMotion}
      duration={duration}
    >
      {children}
    </TextScramble>
  );
}

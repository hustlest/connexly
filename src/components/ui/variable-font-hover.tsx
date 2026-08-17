"use client";

import { useState } from "react";
import { type AnimationOptions, motion, stagger, useAnimate } from "framer-motion";

interface VariableFontHoverProps {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  transition?: AnimationOptions;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number;
  className?: string;
  onClick?: () => void;
}

export function VariableFontHover({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  transition = { type: "spring", duration: 0.7 },
  staggerDuration = 0.03,
  staggerFrom = "first",
  className,
  onClick,
}: VariableFontHoverProps) {
  const [scope, animate] = useAnimate();
  const [isHovered, setIsHovered] = useState(false);

  const mergeTransition = (base: AnimationOptions): AnimationOptions => ({
    ...base,
    delay: stagger(staggerDuration, { from: staggerFrom }),
  });

  function handleHoverStart() {
    if (isHovered) return;
    setIsHovered(true);
    animate(
      ".letter",
      { fontVariationSettings: toFontVariationSettings },
      mergeTransition(transition)
    );
  }

  function handleHoverEnd() {
    setIsHovered(false);
    animate(
      ".letter",
      { fontVariationSettings: fromFontVariationSettings },
      mergeTransition(transition)
    );
  }

  return (
    <motion.span
      ref={scope}
      className={className}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={onClick}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter, i) => (
        <motion.span
          key={i}
          className="letter inline-block whitespace-pre"
          style={{ fontVariationSettings: fromFontVariationSettings }}
          aria-hidden="true"
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

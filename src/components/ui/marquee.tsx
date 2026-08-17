"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: number;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = "left",
  speed = 30,
  className,
  ...props
}: MarqueeProps) {
  const [paused, setPaused] = React.useState(false);

  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      {...props}
    >
      <div className="relative flex overflow-hidden py-5">
        <div
          className={cn(
            "flex w-max shrink-0",
            direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
          )}
          style={
            {
              "--duration": `${speed}s`,
              // Same reliable JS-driven pause used by the testimonial
              // marquee — a pure CSS :hover rule doesn't consistently
              // repaint this compositor-threaded transform animation.
              animationPlayState: pauseOnHover && paused ? "paused" : "running",
            } as React.CSSProperties
          }
        >
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}

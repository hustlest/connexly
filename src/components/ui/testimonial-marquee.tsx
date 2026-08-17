"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  name: string;
  text: string;
  avatar: string;
  role?: string;
  username?: string;
}

export interface TestimonialMarqueeProps {
  items: Testimonial[];
  variant?: "default" | "stacked" | "dual" | "flush" | "flush-dual";
  className?: string;
  speed?: number;
  containerClassName?: string;
}

const MarqueeStyles = React.memo(() => (
  <style>
    {`
        @keyframes marquee-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-100%, 0, 0); }
        }
        @keyframes marquee-right {
          from { transform: translate3d(-100%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left {
           animation: marquee-left var(--duration) linear infinite;
        }
        .animate-marquee-right {
           animation: marquee-right var(--duration) linear infinite;
        }
        `}
  </style>
));
MarqueeStyles.displayName = "MarqueeStyles";

const MarqueeRow = React.memo(
  ({
    children,
    direction = "left",
    speed = 40,
    className,
    pauseOnHover = true,
  }: {
    children: React.ReactNode;
    direction?: "left" | "right";
    speed?: number;
    className?: string;
    pauseOnHover?: boolean;
  }) => {
    const [paused, setPaused] = React.useState(false);
    // A CSS-only group-hover:[animation-play-state] rule doesn't reliably
    // repaint this compositor-threaded (will-change: transform) animation in
    // every browser, so drive the pause with real hover handlers and an
    // inline style instead — inline styles always win the cascade.
    const trackStyle = {
      "--duration": `${speed}s`,
      animationPlayState: pauseOnHover && paused ? "paused" : "running",
    } as React.CSSProperties;

    return (
      <div
        className={cn("flex overflow-hidden p-2 [--gap:1rem]", className)}
        onMouseEnter={() => pauseOnHover && setPaused(true)}
        onMouseLeave={() => pauseOnHover && setPaused(false)}
      >
        <div
          className={cn(
            "flex shrink-0 justify-start [gap:var(--gap)] min-w-full pr-[var(--gap)] will-change-transform [backface-visibility:hidden]",
            direction === "left"
              ? "animate-marquee-left"
              : "animate-marquee-right",
          )}
          style={trackStyle}
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "flex shrink-0 justify-start [gap:var(--gap)] min-w-full pr-[var(--gap)] will-change-transform [backface-visibility:hidden]",
            direction === "left"
              ? "animate-marquee-left"
              : "animate-marquee-right",
          )}
          style={trackStyle}
        >
          {children}
        </div>
      </div>
    );
  },
);
MarqueeRow.displayName = "MarqueeRow";

const TestimonialCard = React.memo(
  ({
    item,
    variant = "default",
  }: {
    item: Testimonial;
    variant?: "default" | "flush";
  }) => {
    const body = (
      <div className="relative z-10 flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-bone/60">
          &quot;{item.text}&quot;
        </p>

        <div className="flex items-center gap-3 pt-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line-dark">
            <img
              src={item.avatar}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{item.name}</span>
            {item.role && (
              <span className="text-xs text-bone/45">{item.role}</span>
            )}
            {item.username && (
              <span className="text-xs text-bone/45">@{item.username}</span>
            )}
          </div>
        </div>
      </div>
    );

    if (variant === "flush") {
      return (
        <div className="group relative flex h-[400px] w-[350px] shrink-0 flex-col justify-between overflow-hidden rounded-[3px] border border-line-dark bg-navy-panel p-6 transition-colors hover:bg-navy-panel/70 transform-gpu [backface-visibility:hidden]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {body}
        </div>
      );
    }

    return (
      <div className="group relative flex h-auto w-[350px] shrink-0 flex-col justify-between overflow-hidden rounded-[3px] border border-line-dark bg-navy-panel p-6 transition-all hover:bg-navy-panel/70 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transform-gpu [backface-visibility:hidden]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {body}
      </div>
    );
  },
);
TestimonialCard.displayName = "TestimonialCard";

export function TestimonialMarquee({
  items,
  variant = "default",
  className,
  speed = 30,
  containerClassName,
}: TestimonialMarqueeProps) {
  const cnContainer = cn(containerClassName, className);

  const itemsToDisplay = React.useMemo(() => {
    let result = [...items];
    // Ensure we have enough items to fill the width for smooth animation
    // 10 items is a safe heuristic for most screen sizes with 350px cards
    while (result.length < 10) {
      result = [...result, ...items];
    }
    return result;
  }, [items]);

  return (
    <React.Fragment>
      <MarqueeStyles />
      {variant === "dual" ? (
        <div
          className={cn(
            "flex flex-col gap-4 py-8 overflow-hidden",
            containerClassName,
          )}
        >
          <MarqueeRow speed={speed} direction="left">
            {itemsToDisplay
              .slice(0, Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard key={`row1-${i}`} item={item} />
              ))}
          </MarqueeRow>
          <MarqueeRow speed={speed} direction="right">
            {itemsToDisplay
              .slice(Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard key={`row2-${i}`} item={item} />
              ))}
          </MarqueeRow>
        </div>
      ) : variant === "stacked" ? (
        <div
          className={cn(
            "relative flex flex-col gap-2 py-8 overflow-hidden h-[600px] justify-center rotate-[-2deg] scale-110",
            containerClassName,
          )}
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-navy via-transparent to-navy pointer-events-none" />
          <MarqueeRow
            speed={speed * 1.5}
            direction="left"
            className="[--gap:0.75rem]"
          >
            {itemsToDisplay
              .slice(0, Math.ceil(itemsToDisplay.length / 3))
              .map((item, i) => (
                <TestimonialCard key={`s-row1-${i}`} item={item} />
              ))}
          </MarqueeRow>
          <MarqueeRow
            speed={speed * 1.2}
            direction="right"
            className="[--gap:0.75rem]"
          >
            {itemsToDisplay
              .slice(
                Math.ceil(itemsToDisplay.length / 3),
                Math.ceil(itemsToDisplay.length / 3) * 2,
              )
              .map((item, i) => (
                <TestimonialCard key={`s-row2-${i}`} item={item} />
              ))}
          </MarqueeRow>
          <MarqueeRow
            speed={speed * 1.5}
            direction="left"
            className="[--gap:0.75rem]"
          >
            {itemsToDisplay
              .slice(Math.ceil(itemsToDisplay.length / 3) * 2)
              .map((item, i) => (
                <TestimonialCard key={`s-row3-${i}`} item={item} />
              ))}
          </MarqueeRow>
        </div>
      ) : variant === "flush" ? (
        <div
          className={cn(
            "overflow-hidden bg-navy relative",
            cnContainer,
          )}
        >
          <MarqueeRow
            speed={speed}
            direction="left"
            className="[--gap:16px] p-0"
          >
            {itemsToDisplay.map((item, i) => (
              <TestimonialCard key={`flush-${i}`} item={item} variant="flush" />
            ))}
          </MarqueeRow>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-navy to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-navy to-transparent"></div>
        </div>
      ) : variant === "flush-dual" ? (
        <div
          className={cn(
            "flex flex-col overflow-hidden border-y border-line-dark bg-navy relative",
            containerClassName,
          )}
        >
          <MarqueeRow
            speed={speed}
            direction="left"
            className="[--gap:0rem] p-0 border-b border-line-dark"
          >
            {itemsToDisplay
              .slice(0, Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard
                  key={`fd-row1-${i}`}
                  item={item}
                  variant="flush"
                />
              ))}
          </MarqueeRow>
          <MarqueeRow
            speed={speed}
            direction="right"
            className="[--gap:0rem] p-0"
          >
            {itemsToDisplay
              .slice(Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard
                  key={`fd-row2-${i}`}
                  item={item}
                  variant="flush"
                />
              ))}
          </MarqueeRow>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-navy to-transparent z-10"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-navy to-transparent z-10"></div>
        </div>
      ) : (
        <div className={cn("py-8 overflow-hidden", cnContainer)}>
          <MarqueeRow speed={speed} direction="left">
            {itemsToDisplay.map((item, i) => (
              <TestimonialCard key={`default-${i}`} item={item} />
            ))}
          </MarqueeRow>
        </div>
      )}
    </React.Fragment>
  );
}

export default TestimonialMarquee;

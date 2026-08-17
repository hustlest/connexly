"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Tab = "buy" | "sell" | "lease";

const TABS: { id: Tab; label: string }[] = [
  { id: "buy", label: "Buy" },
  { id: "sell", label: "Sell" },
  { id: "lease", label: "Lease" },
];

interface TabContent {
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  steps: [string, string, string];
}

const CONTENT: Record<Tab, TabContent> = {
  buy: {
    eyebrow: "Buy",
    heading: "Buy IPv4 addresses with confidence",
    description:
      "Every block Connexly sells is vetted and ARIN-clean before it ever reaches you — no surprises at transfer time. A dedicated broker manages the process from first match to final registration.",
    ctaLabel: "Browse available blocks →",
    ctaHref: "/marketplace",
    steps: [
      "Browse or request a match",
      "Get a quote",
      "Close via ARIN-compliant transfer",
    ],
  },
  sell: {
    eyebrow: "Sell",
    heading: "Turn unused IPv4 space into working capital",
    description:
      "If you're holding more address space than you use, Connexly gets it in front of qualified buyers at current market pricing — discreetly, and without disrupting your network.",
    ctaLabel: "Get a free valuation →",
    ctaHref: "/contact",
    steps: [
      "Get a free valuation",
      "We match you with a buyer",
      "Close via ARIN-compliant transfer",
    ],
  },
  lease: {
    eyebrow: "Lease",
    heading: "Lease IPv4 addresses without giving up long-term ownership",
    description:
      "Need address space now but not ready to sell or buy outright? Lease terms are flexible, provisioning is fast, and every agreement is ARIN-compliant.",
    ctaLabel: "Talk to a broker about leasing →",
    ctaHref: "/contact",
    steps: ["Tell us your capacity needs", "Get lease terms", "Provision and go live"],
  },
};

export function Ipv4ServicesTabs({ initialTab = "buy" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const content = CONTENT[tab];

  return (
    <div>
      <div className="flex gap-1 border-b border-line-dark">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-5 py-3.5 text-sm font-bold tracking-[0.01em] transition-colors duration-200 ${
              tab === t.id ? "text-white" : "text-bone/60 hover:text-bone/80"
            }`}
          >
            {t.label}
            {tab === t.id ? (
              <span className="absolute inset-x-0 -bottom-px h-[2px] bg-orange" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-9">
        <div className="eyebrow mb-3">{content.eyebrow}</div>
        <h2 className="max-w-[560px] text-[26px] font-bold leading-[1.2] tracking-[-0.01em] text-white md:text-[31px]">
          {content.heading}
        </h2>
        <p className="mt-4 max-w-[640px] text-[15px] font-light leading-[1.6] text-bone/70">
          {content.description}
        </p>
        <Button href={content.ctaHref} className="mt-6">
          {content.ctaLabel}
        </Button>

        <div className="mt-10 grid gap-6 border-t border-line-dark pt-8 sm:grid-cols-3">
          {content.steps.map((step, i) => (
            <div key={step}>
              <div className="eyebrow mb-2">Step {i + 1}</div>
              <div className="text-sm text-bone/85">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

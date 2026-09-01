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
    heading: "Acquire IPv4 space with complete confidence",
    description:
      "Every block facilitated by Connexly undergoes rigorous blacklist and provenance checks prior to settlement. Your dedicated broker handles escrow, compliance, and final registry updates seamlessly.",
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
    heading: "Maximize the value of your surplus IPv4 space",
    description:
      "Transform unutilized address blocks into immediate working capital. Connexly negotiates top-tier market pricing with vetted buyers, executing every transaction confidentially and securely from valuation to closing.",
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
    heading: "Lease IPv4 addresses with flexible, low-commitment terms",
    description:
      "Access the capacity you need today without the heavy capital expenditure of buying outright. We offer flexible contract terms, rapid LOA provisioning, and fully ARIN-compliant lease agreements.",
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

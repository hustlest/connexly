"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { VariableFontHover } from "./ui/variable-font-hover";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/transfer-logs", label: "Transfer Logs" },
  { href: "/ipv4-services", label: "IPv4 Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line-dark bg-navy-deep/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center justify-between px-6 md:px-10 lg:px-16">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Image
            src="/connexly-logo-primary.svg"
            alt="Connexly"
            width={509}
            height={123}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <VariableFontHover
                  label={link.label}
                  fromFontVariationSettings="'wght' 400"
                  toFontVariationSettings="'wght' 700"
                  staggerDuration={0.02}
                  staggerFrom="center"
                  className={`text-sm tracking-[0.01em] transition-colors duration-200 ${
                    active ? "text-white" : "text-bone/62 hover:text-white"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact" variant="primary" className="!px-5 !py-2.5 text-[13px]">
            Request a quote
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-[1.5px] w-5 bg-bone transition-transform duration-200 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-bone transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-bone transition-transform duration-200 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line-dark bg-navy-deep px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block py-2.5 text-[15px] ${
                      active ? "text-white" : "text-bone/62"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Button href="/contact" variant="primary" className="mt-3 w-full">
            Request a quote
          </Button>
        </nav>
      ) : null}
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Container } from "./ui/container";

const PRODUCT_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/transfer-logs", label: "Transfer Logs" },
  { href: "/ipv4-services", label: "IPv4 Services" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const REGISTRIES = ["ARIN", "RIPE"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-dark bg-navy-deep">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2">
            <Image
              src="/connexly-logo-primary.svg"
              alt="Connexly"
              width={509}
              height={123}
              className="h-6 w-auto"
            />
            <p className="mt-4 max-w-[320px] text-sm font-light leading-[1.6] text-bone/60">
              An ARIN Qualified Facilitator with over 30 years of digital
              infrastructure expertise, guaranteeing compliant,
              friction-free IPv4 transfers worldwide.
            </p>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-bone/60">
              Product
            </div>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-bone/70 transition-colors duration-200 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-bone/60">
              Company
            </div>
            <ul className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-bone/70 transition-colors duration-200 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line-dark pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-bone/60">
            © {year} Connexly. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {REGISTRIES.map((r) => (
              <span
                key={r}
                className="text-[11px] uppercase tracking-[0.08em] text-bone/60"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

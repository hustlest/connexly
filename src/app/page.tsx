import { ClipboardList, ShoppingCart, Banknote, CalendarClock, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { TestimonialMarquee } from "@/components/ui/testimonial-marquee";
import { Marquee } from "@/components/ui/marquee";
import { InteractiveGlobe } from "@/components/ui/interactive-globe";
import { HeroIpPulse } from "@/components/hero-ip-pulse";
import { HeroHeadline } from "@/components/hero-headline";
import { testimonials } from "@/lib/testimonials";
import { clientLogos } from "@/lib/client-logos";

function initialsAvatar(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#ed7d31" fill-opacity="0.14"/><text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#ed7d31">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MARQUEE_TESTIMONIALS = testimonials.map((t) => ({
  name: t.name,
  role: t.org,
  text: t.quote,
  avatar: initialsAvatar(t.name),
}));

const OFFERINGS = [
  {
    icon: ShoppingCart,
    title: "Buy",
    description: "Acquire clean, vetted IPv4 blocks",
  },
  {
    icon: Banknote,
    title: "Sell",
    description: "Turn unused space into capital",
  },
  {
    icon: CalendarClock,
    title: "Lease",
    description: "Flexible terms, no long-term hold",
  },
  {
    icon: Store,
    title: "Marketplace",
    description: "Live pricing, every registry",
  },
  {
    icon: ClipboardList,
    title: "Transfer Logs",
    description: "A transparent transfer record",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line-dark bg-gradient-to-b from-navy-deep to-navy">
        <HeroIpPulse />
        <Container className="relative py-24 md:py-32">
          <div className="eyebrow mb-4">ARIN Qualified Facilitator</div>
          <HeroHeadline />
          <p className="mt-5 max-w-[560px] text-[17px] font-light leading-[1.55] text-bone/78">
            Connexly helps enterprises buy, sell, and lease clean IPv4
            allocations across ARIN, RIPE, and APNIC — backed by live
            market data and a fully transparent transfer process.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/marketplace">Browse the Marketplace</Button>
            <Button href="/contact" variant="secondary">
              Talk to a Broker
            </Button>
          </div>
        </Container>
      </section>

      {/* WHAT WE OFFER */}
      <section className="border-b border-line-dark">
        <Container className="py-20 md:py-24">
          <Reveal>
            <div className="eyebrow">What We Offer</div>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[3px] border border-line-dark bg-line-dark sm:grid-cols-2 lg:grid-cols-5">
            {OFFERINGS.map((item, i) => (
              <Reveal key={item.title} delayMs={i * 60} className="bg-navy-panel p-6">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[3px] bg-orange/10 text-orange">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-[17px] font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-[1.5] text-bone/60">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* WHY CONNEXLY */}
      <section className="overflow-hidden">
        <Container className="py-10 md:py-12">
          <Reveal>
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <div className="eyebrow mb-5">Why Connexly</div>
                <p className="max-w-[560px] text-[19px] font-light leading-[1.6] text-bone/80">
                  Based in Silicon Valley, Connexly has helped hundreds of
                  companies acquire and manage IPv4 assets over 30 years in
                  the networking space. As an ARIN Qualified Facilitator,
                  every transfer follows registry policy from first quote to
                  final record.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <InteractiveGlobe
                  size={420}
                  dotColor="rgba(231, 226, 219, ALPHA)"
                  arcColor="rgba(237, 125, 49, 0.45)"
                  markerColor="rgba(245, 164, 104, 1)"
                />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <Container className="pt-20 md:pt-24">
          <Reveal>
            <div className="eyebrow">Reviews</div>
          </Reveal>
        </Container>
        <Reveal>
          <TestimonialMarquee
            items={MARQUEE_TESTIMONIALS}
            variant="flush"
            speed={120}
            className="mt-8"
          />
        </Reveal>
      </section>

      {/* CLIENT LOGOS */}
      <section className="border-b border-line-dark py-14 md:py-16">
        <Reveal>
          <Marquee speed={160}>
            {clientLogos.map((logo) => (
              <div
                key={logo.name}
                className="mx-8 flex h-10 w-[140px] shrink-0 items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-10 w-auto max-w-full object-contain opacity-50 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-navy-deep">
        <Container className="flex flex-col items-center gap-6 py-20 text-center md:py-24">
          <h2 className="max-w-[480px] text-[28px] font-bold leading-[1.15] tracking-[-0.01em] text-white md:text-[34px]">
            Ready to move IPv4 addresses?
          </h2>
          <Button href="/contact">Get in touch</Button>
        </Container>
      </section>
    </>
  );
}

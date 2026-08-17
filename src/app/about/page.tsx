import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { team } from "@/lib/team";

export const metadata: Metadata = {
  title: "About — Connexly",
  description: "Connexly is an IPv4 broker and ARIN Qualified Facilitator with 30+ years navigating the registries.",
};

export default function AboutPage() {
  return (
    <>
      <Container className="py-16 md:py-20">
        <div className="eyebrow mb-3">About</div>
        <h1 className="max-w-[640px] text-[32px] font-light leading-[1.15] tracking-[-0.01em] text-white md:text-[40px]">
          Three decades in IPv4, one straightforward process
        </h1>
        <p className="mt-4 max-w-[620px] text-[17px] font-light leading-[1.55] text-bone/78">
          Connexly was founded to make IPv4 transactions simple,
          transparent, and fast. Based in Silicon Valley, the team has
          helped hundreds of enterprises across technology, finance,
          legal, healthcare, education, and government buy, sell, and
          lease clean IPv4 space.
        </p>
      </Container>

      <section className="border-y border-line-dark">
        <Container className="py-20 md:py-24">
          <Reveal>
            <SectionHeading eyebrow="Team" title="Who you'll work with" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {team.map((member, i) => (
              <Reveal key={member.name} delayMs={i * 60}>
                <div className="h-full rounded-[3px] bg-paper p-6">
                  <div className="text-[17px] font-bold text-navy">{member.name}</div>
                  <div className="mt-0.5 text-xs uppercase tracking-[0.05em] text-[#7C8A9A]">
                    {member.title}
                  </div>
                  <p className="mt-3 text-sm font-light leading-[1.6] text-navy/70">
                    {member.bio}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-20">
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-[3px] bg-navy-panel p-8 sm:flex-row sm:items-center md:p-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
              <ShieldCheck className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="text-[17px] font-light leading-[1.55] text-bone/85">
              <span className="font-bold text-white">ARIN Qualified Facilitator</span>{" "}
              — every Connexly transaction follows registry policy from
              first quote to final record.
            </p>
          </div>
        </Reveal>
      </Container>
    </>
  );
}

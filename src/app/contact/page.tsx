import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — Connexly",
  description: "Get in touch with a Connexly broker about buying, selling, or leasing IPv4 space.",
};

export default function ContactPage() {
  return (
    <section className="bg-gradient-to-b from-navy-deep to-navy">
      <Container className="py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div className="eyebrow mb-3">Contact</div>
            <h1 className="text-[32px] font-light leading-[1.15] tracking-[-0.01em] text-white md:text-[40px]">
              Contact us
            </h1>
            <p className="mt-4 max-w-[440px] text-[17px] font-light leading-[1.55] text-bone/78">
              We&rsquo;d love to hear from you. Reach out directly, or send a
              message below.
            </p>

            <div className="mt-10 space-y-6 text-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.05em] text-bone/60">
                  Direct contact
                </div>
                <div className="mt-2 space-y-1 text-bone/80">
                  <div>sales@connexly.com</div>
                  <div>(917) 886-2491</div>
                  <div>Woodside, California</div>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </Container>
    </section>
  );
}

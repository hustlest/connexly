import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Ipv4ServicesTabs } from "@/components/ipv4-services-tabs";

export const metadata: Metadata = {
  title: "IPv4 Services — Connexly",
  description: "Buy, sell, or lease IPv4 address space with Connexly.",
};

type Tab = "buy" | "sell" | "lease";

export default async function Ipv4ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab: Tab = params.tab === "sell" || params.tab === "lease" ? params.tab : "buy";

  return (
    <Container className="py-16 md:py-20">
      <h1 className="text-[32px] font-light leading-[1.1] tracking-[-0.01em] text-white md:text-[40px]">
        IPv4 Services
      </h1>
      <p className="mt-3 max-w-[620px] text-[17px] font-light leading-[1.55] text-bone/78">
        Buy, sell, or lease clean IPv4 address space — all in one place.
      </p>

      <div className="mt-10">
        <Ipv4ServicesTabs initialTab={tab} />
      </div>
    </Container>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  light = false,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  light?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow mb-3.5">{eyebrow}</div>
      <h2
        className={`text-[28px] md:text-[34px] font-bold tracking-[-0.01em] leading-[1.15] ${
          light ? "text-navy" : "text-white"
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-3 max-w-[640px] text-[17px] font-light leading-[1.55] ${
            light ? "text-navy/70" : "text-bone/78"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

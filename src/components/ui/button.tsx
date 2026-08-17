import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[3px] text-sm font-bold tracking-[0.01em] transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-orange text-white px-6 py-3 hover:bg-orange-bright",
  secondary:
    "bg-transparent text-white border-[1.5px] border-bone/50 px-6 py-3 hover:border-bone hover:bg-white/5",
  ghost:
    "bg-transparent text-sage underline underline-offset-4 decoration-sage/40 hover:decoration-sage px-0 py-0",
};

interface LinkButtonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
}

interface NativeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  href?: undefined;
}

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { variant = "primary", children, className = "" } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if (props.href) {
    const { href, target, rel } = props;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, href: _href, children: _children, className: _className, ...rest } = props;
  void _variant;
  void _href;
  void _children;
  void _className;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

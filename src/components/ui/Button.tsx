import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-semibold transition-colors";

const variants = {
  primary: "bg-accent-400 text-canvas hover:bg-accent-300",
  secondary: "border border-line-2 text-ink hover:border-accent-400 hover:text-accent-400",
} as const;

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

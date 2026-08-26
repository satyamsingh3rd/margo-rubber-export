import Link from "next/link";
import type { ReactNode } from "react";

// `active:scale-[0.97]` is the tactile press: the button gives under the
// pointer instead of only changing colour. Transition covers transform as
// well as colour so the release eases back rather than snapping.
const base =
  "inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-200 ease-standard active:scale-[0.97]";

const variants = {
  primary: "bg-accent-400 text-canvas hover:bg-accent-300",
  secondary: "border border-line-2 text-ink hover:border-accent-400 hover:text-accent-400",
} as const;

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  onClick,
}: {
  href: string;
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
  /**
   * Optional, and only usable from a client component. The mobile nav needs
   * it: the header lives in the layout, so it survives the route change and
   * the menu would otherwise still be open on the page you just landed on.
   */
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

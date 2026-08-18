"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Img } from "@/components/ui/Img";
import {
  HEADER_NAV as NAV,
} from "@/content/navigation";

/**
 * Nav differs across the Figma screens (homepage shows "Case Studies",
 * contact shows "Facility", a route that does not exist). This follows the
 * blueprint nav spec; see §5.6 of the implementation plan.
 *
 * The Products mega-dropdown is not built yet, that is its own task.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-line bg-canvas/80 fixed inset-x-0 top-0 z-50 border-b backdrop-blur">
      <Container className="flex h-20 items-center gap-8">
        <Link
          href="/"
          className="text-ink shrink-0 font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="flex items-center gap-2.5">
            <Img k="brand.mark" className="size-10 shrink-0" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-base font-bold tracking-tight">MARGO</span>
              <span className="text-ink-4 mt-1 text-[9px] font-normal tracking-[0.22em]">
                RUBBER PRODUCTS
              </span>
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-ink-3 hover:text-ink text-sm transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Button href="/contact" className="hidden sm:inline-flex">
            Request Quote <span aria-hidden>→</span>
          </Button>

          {/* Mobile menu toggle. 44px hit target, meets the WCAG 2.2 AA
              touch-target size folded into the pre-launch QA gate. */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="border-line text-ink grid size-11 place-items-center rounded-lg border lg:hidden"
          >
            <span aria-hidden className="text-lg leading-none">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-nav"
          className="panel-in border-line bg-canvas border-t lg:hidden"
        >
          <Container className="py-4">
            <ul className="divide-line divide-y">
              {NAV.map((n) => (
                <li key={n.label}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="text-ink-2 hover:text-ink block py-4 text-sm"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button href="/contact" className="mt-4 w-full justify-center sm:hidden">
              Request Quote <span aria-hidden>→</span>
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}

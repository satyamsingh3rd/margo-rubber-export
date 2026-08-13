"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * SCROLL REVEAL — one observer for the whole site.
 *
 * Mounted once in the root layout. Everything else opts in with a plain
 * `data-reveal` attribute, which is just markup, so section components stay
 * Server Components and no client boundary is created per section. This is
 * the entire client cost of the motion layer: one component, no library.
 *
 * TWO CONSTRAINTS PULL IN OPPOSITE DIRECTIONS, AND BOTH HAVE DRAWN BLOOD.
 *
 * 1. Hiding in CSS alone is fail-closed. If the bundle never loads, the page
 *    is blank below the hero — unacceptable on a site whose entire strategy is
 *    being readable by machines.
 *
 * 2. Hiding by stamping an attribute onto each element from an effect is
 *    fail-open but hydration-unsafe. `cacheComponents` streams the page, so
 *    parts of the tree hydrate AFTER this effect runs. Marking a node React
 *    has not hydrated yet produces "a tree hydrated but some attributes of the
 *    server rendered HTML didn't match", which React explicitly will not patch
 *    up. That is what the previous version did, and it threw on every page.
 *
 * The resolution is to mark ONE element instead of every element: `data-js` on
 * <body>, set here, which is what arms the hide rule in CSS. <body> carries
 * `suppressHydrationWarning`, and an attribute is used rather than a class
 * because `className` is a prop React owns and re-renders, while `data-js` is
 * not, so React neither warns about it nor strips it later.
 *
 * It does not need to be set before paint, which is what lets it live in an
 * effect rather than an inline script. Everything that reveals is below the
 * fold by policy, so at the moment the rule starts applying there is nothing
 * on screen for it to affect. (An inline `<script>` was the first attempt and
 * React objects to those inside components anyway: it does not execute them
 * on the client.)
 *
 * Every early return below therefore leaves the page untouched, because
 * `data-js` is set last — after the guards, immediately before observing. No
 * JavaScript, no attribute, nothing hidden, and the page renders exactly as it
 * would have without any of this.
 */
export function RevealObserver() {
  // App Router keeps this component mounted across client navigations, so the
  // effect has to re-run per route or the next page's elements are never
  // observed and never animate.
  const pathname = usePathname();

  useEffect(() => {
    // The stylesheet already un-hides everything under this preference, so
    // returning here leaves a complete, static page.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Without support nothing would ever reveal, so never arm the hide.
    if (typeof IntersectionObserver === "undefined") return;

    const nodes = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-revealed])",
    );
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          // Reveal is one-way. Unobserving as we go means a long page stops
          // costing anything once the reader has passed it, and scrolling
          // back up never replays.
          observer.unobserve(entry.target);
        }
      },
      // Fires slightly before the element is fully on screen, so the motion
      // reads as already arriving rather than starting late.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    // Arm the CSS hide only now that an observer exists to undo it, then
    // observe. Anything that returned above leaves the page fully visible.
    document.body.setAttribute("data-js", "");
    nodes.forEach((n) => io.observe(n));

    return () => {
      io.disconnect();
      // If this ever unmounts, nothing is left to reveal what is still
      // hidden, so lift the rule with it.
      document.body.removeAttribute("data-js");
    };
  }, [pathname]);

  return null;
}


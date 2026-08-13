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
 * WHY JAVASCRIPT APPLIES THE HIDDEN STATE, NOT CSS
 *
 * The obvious build is to hide `[data-reveal]` in the stylesheet and let the
 * observer un-hide it. That was the first attempt and it is quietly dangerous:
 * the content is hidden whether or not the observer ever runs. Anything that
 * stops the effect — a bundle that fails to load, a hydration mismatch, a
 * browser without IntersectionObserver — leaves every section below the hero
 * permanently invisible, on a site whose whole strategy is being readable by
 * machines.
 *
 * So the hidden state is applied HERE, one line before the element is
 * observed. An element can only be invisible if this code is running and has
 * taken responsibility for revealing it again. No JavaScript means no
 * `data-reveal-armed`, which means the page renders exactly as it would have
 * without any of this.
 *
 * Arming after paint would normally cause a flash. It does not here, because
 * revealed elements are below the fold by policy — heroes and the header pass
 * `reveal={false}` — so the user cannot see the element at the moment it is
 * armed. See the Container docblock in ui/Section.tsx.
 *
 * A hidden document (a background tab) never computes intersections, so
 * nothing reveals while it is hidden. That resolves itself: the moment the tab
 * is shown the browser computes intersections and the callback fires.
 */
export function RevealObserver() {
  // App Router keeps this component mounted across client navigations, so the
  // effect has to re-run per route or the next page's elements are never
  // armed and never animate.
  const pathname = usePathname();

  useEffect(() => {
    // Leave the page exactly as rendered. Nothing is armed, so nothing can be
    // hidden, which is the correct reading of the preference and also the
    // safest branch.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Guard rather than assume. Without support, skipping the arm step leaves
    // the page static and complete.
    if (typeof IntersectionObserver === "undefined") return;

    let io: IntersectionObserver | null = null;
    let armed: HTMLElement[] = [];

    /**
     * Never arm a hidden document.
     *
     * A hidden document computes no intersections and runs no transitions, so
     * arming one hides content with nothing able to bring it back until the
     * tab is shown. In principle the browser resolves that on
     * `visibilitychange` by itself; waiting for the event rather than relying
     * on it removes the assumption entirely, and a page nobody is looking at
     * loses nothing by staying static.
     */
    const arm = () => {
      if (io) return;
      const nodes = document.querySelectorAll<HTMLElement>(
        "[data-reveal]:not([data-revealed])",
      );
      if (nodes.length === 0) return;
      io = build();
      armed = Array.from(nodes);
      armed.forEach((n) => {
        n.setAttribute("data-reveal-armed", "");
        io!.observe(n);
      });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") arm();
    };

    const build = () =>
      new IntersectionObserver(
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

    if (document.visibilityState === "visible") arm();
    else document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      io?.disconnect();
      // Un-arm on teardown. If this component unmounts while elements are
      // still armed, they would be stranded invisible with nothing left to
      // reveal them.
      armed.forEach((n) => n.removeAttribute("data-reveal-armed"));
    };
  }, [pathname]);

  return null;
}

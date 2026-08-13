"use client";

import { useEffect, useState } from "react";

/**
 * Sticky table of contents from the Privacy Policy comp: a bordered card with
 * a numbered, icon-led list and one highlighted entry.
 *
 * The highlight is scroll position, not a click handler. Clicking an entry is
 * a plain anchor jump — no JS required and no `preventDefault`, so the URL
 * carries the section and the browser's own smooth-scroll and back button both
 * work. The observer only decides which entry looks active.
 */

const ICONS: Record<string, React.ReactNode> = {
  doc: (
    <>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
      <path d="M13.5 3.5V9H19M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  cookie: (
    <>
      <path d="M20.9 12.3A9 9 0 1 1 11.7 3.1a3.5 3.5 0 0 0 4.8 4.4 3.5 3.5 0 0 0 4.4 4.8z" />
      <path d="M9 9.5h.01M8 14.5h.01M13.5 14h.01" />
    </>
  ),
  external: (
    <>
      <path d="M10 5H6.5a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2H17a2 2 0 0 0 2-2V14" />
      <path d="M14 4.5h5.5V10M19.5 4.5 11 13" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7M12 14.5v2" />
    </>
  ),
  user: (
    <>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 20a6.5 6.5 0 0 1 13 0M17 11.5l1.8 1.8 3.2-3.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.4 2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5z" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01M15 10h.01M8.8 14.5a4 4 0 0 0 6.4 0" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.5A8 8 0 0 0 6.3 6.3L4 8.5" />
      <path d="M4 12.5a8 8 0 0 0 13.7 5.2L20 15.5" />
      <path d="M4 4.5v4h4M20 19.5v-4h-4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 5 6v6c0 4.3 2.9 7.6 7 8.8 4.1-1.2 7-4.5 7-8.8V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M7 20h10M4 9h16M4 9l-2.5 5.5h5zM20 9l-2.5 5.5h5z" />
    </>
  ),
  ship: (
    <>
      <path d="M4 17.5 5.5 11 12 8.8 18.5 11 20 17.5" />
      <path d="M12 8.8V5H9M3 19.5c1.5 0 1.5 1.2 3 1.2s1.5-1.2 3-1.2 1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.8 21 19.5H3z" />
      <path d="M12 9.5v4.2M12 16.6h.01" />
    </>
  ),
  box: (
    <>
      <path d="m12 3.2 8 4.4v8.8l-8 4.4-8-4.4V7.6z" />
      <path d="m4 7.6 8 4.4 8-4.4M12 12v8.8" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      aria-hidden
    >
      {ICONS[name] ?? ICONS.doc}
    </svg>
  );
}

export function LegalToc({
  items,
  heading = "Table of contents",
}: {
  items: readonly {
    id: string;
    title: string;
    navLabel?: string;
    icon: string;
  }[];
  heading?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    /**
     * Deliberately a scroll listener rather than an IntersectionObserver.
     *
     * The observer version of this went stale: its callback receives only the
     * entries whose intersection CHANGED, so once section 2 had scrolled into
     * the band and section 1 out of it, the next callback carried section 1
     * alone (now not intersecting) and there was nothing left to select. The
     * highlight simply stopped moving partway down the page.
     *
     * Reading positions directly has no such state to go stale: the active
     * section is the last one whose top has passed the read line, evaluated
     * fresh every frame. Twelve getBoundingClientRect calls inside a rAF are
     * far cheaper than the layout the page does anyway.
     */
    const LINE = 140; // px below the viewport top — just under the header
    let frame = 0;

    const measure = () => {
      frame = 0;
      let current = nodes[0].id;
      for (const n of nodes) {
        if (n.getBoundingClientRect().top > LINE) break;
        current = n.id;
      }
      // At the end of the page the final sections may be too short ever to
      // reach the line, so the highlight would stick one or two entries early.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        current = nodes[nodes.length - 1].id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label={heading} className="rounded-2xl border-line bg-surface-3 border p-6">
      <p className="text-ink flex items-center gap-3 text-[0.8125rem] font-bold tracking-[0.12em] uppercase">
        <span aria-hidden className="bg-accent-400 inline-block h-4 w-[3px] rounded-full" />
        {heading}
      </p>

      <hr className="border-line mt-5 border-0 border-t" />

      <ol className="mt-4 space-y-0.5">
        {items.map((s, i) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                // 13px, not 14: the comp's contents column is narrower than
                // this one and still sets "How We Use Information" on a single
                // line, which only works a step down from body size.
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[0.8125rem] transition-colors ${
                  on
                    ? "border-accent-400/40 bg-accent-400/10 text-accent-400"
                    : "text-ink-3 hover:text-ink-2 border-transparent hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`text-eyebrow font-mono tabular-nums ${on ? "text-accent-400/70" : "text-ink-4"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon name={s.icon} />
                <span className="min-w-0 flex-1">{s.navLabel ?? s.title}</span>
                {/* Always rendered, only sometimes visible. Mounting the dot
                    on activation narrows the label by its width plus the gap,
                    which re-wrapped the longest entry to two lines and made
                    the whole list jump as the reader scrolled past it. */}
                <span
                  aria-hidden
                  className={`size-1.5 shrink-0 rounded-full ${on ? "bg-accent-400" : "bg-transparent"}`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import Link from "next/link";
import { Container } from "@/components/ui/Section";

/**
 * Shared layout for /thank-you and the 404.
 *
 * Same page type: a short statement, an optional ordered explanation, and
 * routes back into the site. Neither has a Figma design, so this is derived
 * from the established system rather than matched to a comp.
 */

const ICONS: Record<string, React.ReactNode> = {
  box: (
    <>
      <path d="m12 3.2 8 4.4v8.8l-8 4.4-8-4.4V7.6z" />
      <path d="m4 7.6 8 4.4 8-4.4M12 12v8.8" />
    </>
  ),
  sector: (
    <>
      <path d="M4 20V9.5l5.5 3.2V9.5L15 12.7V5h5v15z" />
      <path d="M4 20h16" />
    </>
  ),
  doc: (
    <>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
      <path d="M13.5 3.5V9H19M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
  ribbon: (
    <>
      <circle cx="12" cy="9" r="5.2" />
      <path d="m8.9 13.6-1.6 6.4 4.7-2.2 4.7 2.2-1.6-6.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      <path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5" />
    </svg>
  );
}

/** Tick, used only on /thank-you where the state is a success. */
function Tick() {
  return (
    <span className="border-accent-400/30 bg-accent-400/10 text-accent-400 grid size-14 place-items-center rounded-full border">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

export function UtilityPage({
  eyebrow,
  h1Lines,
  intro,
  steps,
  note,
  linksHeading,
  links,
  actions,
  responsePromise,
  showTick = false,
}: {
  eyebrow: string;
  h1Lines: readonly string[];
  intro: string;
  steps: readonly { name: string; body: string }[];
  note?: string;
  linksHeading: string;
  links: readonly {
    icon: string;
    label: string;
    body: string;
    href: string;
  }[];
  actions: readonly { label: string; href: string; variant: string }[];
  /** Rendered from SITE, never written into content. */
  responsePromise?: string;
  showTick?: boolean;
}) {
  return (
    <section className="bg-canvas relative isolate overflow-hidden py-28 md:py-36">
      <span
        aria-hidden
        className="bg-accent-400/10 pointer-events-none absolute -top-24 left-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <Container reveal={false}>
        <div className="max-w-[46rem]">
          {showTick && <div className="mb-8">{<Tick />}</div>}

          <p className="text-eyebrow text-accent-400 font-mono uppercase">
            {eyebrow}
          </p>

          <h1 className="text-display-2 mt-5">
            {h1Lines.map((line) => (
              <span key={line} className="block">
                {line.split("*").map((part, i) =>
                  i % 2 === 1 ? (
                    <span key={part} className="text-accent-400">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </span>
            ))}
          </h1>

          <p className="text-ink-3 mt-6 leading-relaxed">{intro}</p>

          {responsePromise && (
            <p className="border-accent-400/40 bg-accent-400/5 text-ink-2 mt-8 rounded-md border p-5 text-sm leading-relaxed">
              You can expect a reply within{" "}
              <strong className="text-accent-400 font-semibold">
                {responsePromise}
              </strong>
              .
            </p>
          )}

          {steps.length > 0 && (
            <ol className="divide-line border-line mt-10 divide-y border-t">
              {steps.map((s, i) => (
                <li key={s.name} className="flex gap-5 py-6">
                  <span className="text-eyebrow border-accent-400/30 bg-accent-400/10 text-accent-400 grid size-8 shrink-0 place-items-center rounded-md border font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-ink text-base font-semibold">
                      {s.name}
                    </h2>
                    <p className="text-ink-4 mt-1.5 text-sm leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {note && (
            <p className="text-ink-4 mt-8 text-sm leading-relaxed">{note}</p>
          )}

          {actions.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3">
              {actions.map((a) =>
                a.variant === "primary" ? (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="bg-accent-400 text-canvas hover:bg-accent-300 shadow-glow rounded-pill inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors"
                  >
                    {a.label}
                    <Arrow />
                  </Link>
                ) : (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="border-line-2 text-ink hover:border-accent-400/60 rounded-pill inline-flex items-center border px-6 py-3.5 text-sm font-semibold transition-colors"
                  >
                    {a.label}
                  </Link>
                ),
              )}
            </div>
          )}
        </div>

        <div className="mt-16">
          <p className="text-eyebrow text-ink-4 font-mono uppercase">
            {linksHeading}
          </p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="rounded-card border-line hover:border-accent-400/40 flex h-full gap-4 border bg-[#0B0D10] p-6 transition-colors"
                >
                  <span className="border-accent-400/20 bg-accent-400/10 text-accent-400 grid size-10 shrink-0 place-items-center rounded-lg border">
                    <Icon name={l.icon} />
                  </span>
                  <span>
                    <span className="text-ink block text-base font-semibold">
                      {l.label}
                    </span>
                    <span className="text-ink-4 mt-1.5 block text-sm leading-relaxed">
                      {l.body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

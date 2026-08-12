import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-site px-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Section label. Two variants, both in the design system:
 *  · plain  — numbered sections on category pages ("02 · SPECIFICATION REFERENCE")
 *  · rule   — hub pages, which prefix the label with a short horizontal rule
 */
export function Eyebrow({
  children,
  variant = "plain",
}: {
  children: ReactNode;
  variant?: "plain" | "rule";
}) {
  return (
    <p className="text-eyebrow text-accent-400 flex items-center gap-3 font-mono uppercase">
      {variant === "rule" && (
        <span aria-hidden className="bg-accent-400 inline-block h-px w-8" />
      )}
      {children}
    </p>
  );
}

/**
 * A numbered page section. Heading and eyebrow come from the section's own
 * content block — never an orphan heading in the MDX body.
 */
export function Section({
  eyebrow,
  heading,
  body,
  id,
  children,
  className = "",
  headingLevel: H = "h2",
  eyebrowVariant = "plain",
  accentLastWords = 0,
}: {
  eyebrow?: string;
  heading?: string;
  body?: string;
  id?: string;
  children?: ReactNode;
  className?: string;
  headingLevel?: "h2" | "h3";
  eyebrowVariant?: "plain" | "rule";
  /** Renders the last word of the heading in accent, as the hub pages do. */
  accentLastWords?: number;
}) {
  const words = heading?.split(" ") ?? [];
  const accentCount = accentLastWords ?? 0;
  const lead = accentCount ? words.slice(0, -accentCount).join(" ") : heading;
  const accent = accentCount ? words.slice(-accentCount).join(" ") : "";

  return (
    <section id={id} className={`scroll-mt-24 py-16 md:py-24 ${className}`}>
      <Container>
        {(eyebrow || heading || body) && (
          <header className="mb-10 max-w-[62ch]">
            {eyebrow && <Eyebrow variant={eyebrowVariant}>{eyebrow}</Eyebrow>}
            {heading && (
              <H className="text-h2 mt-3">
                {lead}
                {accent && <span className="text-accent-400"> {accent}</span>}
              </H>
            )}
            {body && <p className="text-ink-3 mt-4 leading-relaxed">{body}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}

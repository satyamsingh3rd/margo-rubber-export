import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-site px-6 md:px-[50px] ${className}`}>
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
  center = false,
}: {
  children: ReactNode;
  variant?: "plain" | "rule";
  center?: boolean;
}) {
  return (
    <p
      className={`text-eyebrow text-accent-400 flex items-center gap-3 font-mono uppercase ${
        center ? "justify-center" : ""
      }`}
    >
      {variant === "rule" && (
        <span aria-hidden className="bg-accent-400 inline-block h-px w-8" />
      )}
      {children}
      {/* Mirrored rule on centred headers, so the label sits between two
          strokes rather than being pushed off-centre by one. */}
      {variant === "rule" && center && (
        <span aria-hidden className="bg-accent-400 inline-block h-px w-8" />
      )}
    </p>
  );
}

/**
 * The accent bloom used at band changes.
 *
 * A flat #2BBCC4 at 6% faded out with a mask, rather than a colour gradient:
 * the brand allows one blue, so the fade is in alpha only. `overflow-hidden`
 * on the section keeps it from bleeding into the neighbour above, and the
 * Container is `relative` so the copy sits in front without a z-index.
 */
export function SectionGlow() {
  return (
    <span
      aria-hidden
      className="bg-accent-400/[0.06] pointer-events-none absolute inset-x-0 top-0 h-24 [mask-image:linear-gradient(to_bottom,black,transparent)]"
    />
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
  align = "left",
  glow = false,
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
  /** Centres the eyebrow, heading and lede. The comps use this for section
   *  headers that introduce a full-width grid below them. */
  align?: "left" | "center";
  /**
   * Soft accent bloom at the top edge, masked out over 6rem.
   *
   * The UI-changes2 comps use it at every band change: it is what stops two
   * adjacent dark sections reading as one undifferentiated block. Kept off
   * by default — the nine older category pages have flat bands by design.
   */
  glow?: boolean;
}) {
  const words = heading?.split(" ") ?? [];
  const accentCount = accentLastWords ?? 0;
  const lead = accentCount ? words.slice(0, -accentCount).join(" ") : heading;
  const accent = accentCount ? words.slice(-accentCount).join(" ") : "";

  /**
   * Inline `*accent*` marking, as the hub headings already use. Needed
   * because `accentLastWords` can only reach the END of a heading, and the
   * comps frequently accent words in the middle: "Rubber that performs where
   * *generic parts* fail." Content controls which words, so nine industry
   * pages sharing one template can each mark their own.
   */
  const marked = heading?.includes("*")
    ? heading
        .split("*")
        .map((part, i) =>
          i % 2 === 1 ? (
            <span key={part} className="text-accent-400">
              {part}
            </span>
          ) : (
            part
          ),
        )
    : null;

  return (
    // `relative overflow-hidden` only when there is a glow to clip. Applying
    // it unconditionally would put an `overflow` ancestor above every section
    // on the site — which breaks `position: sticky`, and the pinned trade-lane
    // sequence on /export depends on it.
    <section
      id={id}
      className={`scroll-mt-24 py-[70px] ${glow ? "relative overflow-hidden" : ""} ${className}`}
    >
      {glow && <SectionGlow />}
      <Container className={glow ? "relative" : ""}>
        {(eyebrow || heading || body) && (
          <header
            className={`mb-10 ${
              align === "center"
                ? "mx-auto max-w-[52rem] text-center"
                : "max-w-[62ch]"
            }`}
          >
            {eyebrow && (
              <Eyebrow variant={eyebrowVariant} center={align === "center"}>
                {eyebrow}
              </Eyebrow>
            )}
            {heading && (
              <H className="text-h2 mt-3">
                {marked ?? (
                  <>
                    {lead}
                    {accent && (
                      <span className="text-accent-400"> {accent}</span>
                    )}
                  </>
                )}
              </H>
            )}
            {body && (
              <p
                className={`text-ink-3 mt-4 leading-relaxed ${
                  align === "center" ? "mx-auto max-w-[62ch]" : ""
                }`}
              >
                {body}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}

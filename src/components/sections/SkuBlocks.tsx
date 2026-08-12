import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { COMPOUNDS, SITE } from "@/content/site";

/**
 * SKU DETAIL TEMPLATE — from `single category.png`.
 *
 * Built to strategy D3 / Scenario 1 in §4.5: route and template now, shipped
 * noindex until real spec content exists.
 *
 * Three things in the design are NOT built, and should not be until they can
 * be honest:
 *
 *   · "4.8 / 5 from 143 verified orders". Fabricated aggregateRating is banned
 *     by name in FORBIDDEN_CLAIMS as the Asian Sealing / ARPL pattern, and is
 *     a manual-action risk.
 *   · "RoHS, REACH" in the certifications row. Margo holds ISO 9001:2015 only.
 *   · Image gallery, 360 preview, cross-section diagram, datasheet and DWG
 *     downloads. No per-part photography or documents exist.
 *
 * Everything else renders. Where a spec is unknown the table says "On request"
 * rather than carrying a number nobody has confirmed.
 */

function Arrow({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5" />
    </svg>
  );
}

function Tick({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20.5 11.2V12a8.5 8.5 0 1 1-5-7.8" />
      <path d="m8.6 11.6 2.9 2.9 8-8" />
    </svg>
  );
}

/* ── hero ───────────────────────────────────────────────────────────────── */
export function SkuHero({
  categorySlug,
  categoryLabel,
  productCode,
  h1,
  intro,
}: {
  categorySlug: string;
  categoryLabel: string;
  productCode?: string;
  h1: string;
  intro: string;
}) {
  return (
    <header className="bg-canvas relative isolate overflow-hidden pt-32 pb-14 md:pt-44">
      <span
        aria-hidden
        className="bg-accent-400/10 pointer-events-none absolute -top-24 -left-32 -z-10 size-[30rem] rounded-full blur-3xl"
      />
      <Container>
        <nav aria-label="Breadcrumb">
          <ol className="text-eyebrow text-ink-4 flex flex-wrap items-center gap-2 font-mono uppercase">
            <li>
              <Link href="/products" className="hover:text-ink transition-colors">
                Products
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/products/${categorySlug}`}
                className="hover:text-ink transition-colors"
              >
                {categoryLabel}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink-2">{productCode || h1}</li>
          </ol>
        </nav>

        <p className="text-eyebrow text-accent-400 mt-8 font-mono uppercase">
          {categoryLabel}
          {productCode ? ` · ${productCode}` : ""}
        </p>

        <h1 className="text-display-2 mt-4 max-w-[22ch]">{h1}</h1>

        <p className="text-ink-3 mt-6 max-w-[58ch] leading-relaxed">{intro}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={`/contact?part=${encodeURIComponent(h1)}`}
            className="bg-accent-400 text-canvas hover:bg-accent-300 shadow-glow rounded-pill inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors"
          >
            Request a quote
            <Arrow />
          </Link>
          <Link
            href={`/products/${categorySlug}`}
            className="border-line-2 text-ink hover:border-accent-400/60 rounded-pill inline-flex items-center border px-6 py-3.5 text-sm font-semibold transition-colors"
          >
            All {categoryLabel}
          </Link>
        </div>

        {/* Only the certification Margo actually holds. */}
        <ul className="text-ink-4 mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
          <li className="flex items-center gap-2">
            <Tick className="text-accent-400 size-4" />
            ISO 9001:2015
          </li>
          <li className="flex items-center gap-2">
            <Tick className="text-accent-400 size-4" />
            100% visual inspection
          </li>
          <li className="flex items-center gap-2">
            <Tick className="text-accent-400 size-4" />
            Made to drawing
          </li>
        </ul>
      </Container>
    </header>
  );
}

/* ── engineering data ───────────────────────────────────────────────────── */
export function SkuSpecs({
  productCode,
  specs,
  categoryLabel,
}: {
  productCode?: string;
  specs: readonly { label: string; value: string }[];
  categoryLabel: string;
}) {
  // Rows we can state truthfully today come from the facts registry. Anything
  // part-specific stays "On request" until Margo supplies it.
  const base: { label: string; value: string; known: boolean }[] = [
    { label: "Product code", value: productCode ?? "On request", known: !!productCode },
    { label: "Product family", value: categoryLabel, known: true },
    { label: "Hardness (Shore A)", value: "On request", known: false },
    { label: "Operating temperature", value: "Compound dependent, see below", known: true },
    { label: "Dimensions", value: "To customer drawing", known: true },
    { label: "Tolerance", value: "On request", known: false },
    { label: "Colour", value: "Black standard, custom on request", known: true },
    { label: "Certification", value: SITE.certifications.join(", "), known: true },
    {
      label: "Minimum order",
      value: `${SITE.moq.value.toLocaleString()} ${SITE.moq.unit}`,
      known: true,
    },
    { label: "Lead time", value: "On request", known: false },
  ];

  const rows = specs.length
    ? specs.map((s) => ({ ...s, known: true }))
    : base;

  return (
    <section className="bg-band border-line border-t py-16 md:py-20">
      <Container>
        <p className="text-eyebrow text-accent-400 font-mono uppercase">
          Technical specifications
        </p>
        <h2 className="text-h2 mt-3">Engineering Data</h2>

        <div className="rounded-card border-line mt-8 overflow-hidden border">
          <dl className="divide-line divide-y">
            {rows.map((r) => (
              <div
                key={r.label}
                className="grid gap-2 px-6 py-4 sm:grid-cols-[240px_1fr]"
              >
                <dt className="text-ink-4 text-sm">{r.label}</dt>
                <dd
                  className={`text-sm ${r.known ? "text-ink" : "text-ink-4 italic"}`}
                >
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {specs.length === 0 && (
          <p className="text-ink-4 mt-5 max-w-[62ch] text-sm leading-relaxed">
            Dimensional and hardness data for this part is issued with
            quotation. We publish figures once they are confirmed against the
            production drawing rather than listing indicative values.
          </p>
        )}
      </Container>
    </section>
  );
}

/* ── compound options ───────────────────────────────────────────────────── */
export function SkuCompounds({ codes }: { codes: readonly string[] }) {
  // Rendered from SITE.COMPOUNDS, which is Margo's own published table. This
  // is the one section on the page carrying real, sourced data.
  const available = COMPOUNDS.filter((c) => codes.includes(c.code));
  if (!available.length) return null;

  return (
    <section className="bg-canvas border-line border-t py-16 md:py-20">
      <Container>
        <p className="text-eyebrow text-accent-400 font-mono uppercase">
          Available materials
        </p>
        <h2 className="text-h2 mt-3">Compound options</h2>
        <p className="text-ink-3 mt-4 max-w-[58ch] leading-relaxed">
          Select the compound best suited to your operating environment. Service
          temperatures below are Margo&rsquo;s published ranges.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {available.map((c) => (
            <li
              key={c.code}
              className="rounded-card border-line border bg-[#080808] p-6"
            >
              <p className="text-accent-400 text-base font-semibold">
                {c.code}
              </p>
              <p className="text-ink-4 mt-1 text-xs">{c.name}</p>
              <p className="text-ink mt-4 text-sm font-medium">
                {c.tempC[0]}°C to +{c.tempC[1]}°C
              </p>
              <p className="text-ink-4 mt-2 text-xs leading-relaxed">
                {c.note}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── closing CTA ────────────────────────────────────────────────────────── */
export function SkuCta({
  h1,
  categorySlug,
  categoryLabel,
}: {
  h1: string;
  categorySlug: string;
  categoryLabel: string;
}) {
  return (
    <section className="bg-band border-line border-t py-16 md:py-20">
      <Container>
        <div className="rounded-card border-line border-l-accent-400 flex flex-wrap items-center justify-between gap-8 border border-l-2 bg-[#080808] p-8 md:p-10">
          <div>
            <h2 className="text-ink text-2xl font-semibold">
              Need this part quoted?
            </h2>
            <p className="text-ink-4 mt-3 max-w-[52ch] text-sm leading-relaxed">
              Send your drawing or a sample. We confirm compound, hardness and
              tolerance, then quote against your annual quantity. Response
              within {SITE.responsePromise}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/contact?part=${encodeURIComponent(h1)}`}
              className="bg-accent-400 text-canvas hover:bg-accent-300 shadow-glow rounded-pill inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors"
            >
              Request a quote
              <Arrow />
            </Link>
            <Link
              href={`/products/${categorySlug}`}
              className="border-line-2 text-ink hover:border-accent-400/60 rounded-pill inline-flex items-center border px-6 py-3.5 text-sm font-semibold transition-colors"
            >
              Back to {categoryLabel}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

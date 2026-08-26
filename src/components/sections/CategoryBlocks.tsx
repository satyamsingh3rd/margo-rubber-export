/**
 * CATEGORY PAGE BLOCKS — the sections introduced by the two new category
 * comps in UI-changes2/ (Extrusion Profiles, Sponge & Foam Rubber).
 *
 * Kept apart from Blocks.tsx, which holds the sections every one of the
 * original nine categories uses. These four are optional and only two pages
 * currently set them.
 *
 * All server components. Nothing here is interactive.
 */

/**
 * A grid of code/name/body cards.
 *
 * Two sections use it: the profile library, where `code` is the part number,
 * and the sectors grid, where there is no code and the name carries the card.
 */
export function CardGrid({
  items,
}: {
  items: readonly {
    id?: string;
    code?: string;
    name: string;
    body: string;
  }[];
}) {
  return (
    <div className="rounded-card grid gap-[2px] overflow-hidden bg-[#0C0C0C] sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        // `scroll-mt` clears the 80px fixed header, so a card deep-linked
        // from the mega-dropdown lands below it rather than behind it.
        <div
          key={c.name}
          id={c.id}
          className="scroll-mt-28 bg-[#0A0A0A] px-7 py-7"
        >
          {c.code && (
            <p className="text-accent-400 font-mono text-xs tracking-[0.14em] uppercase">
              {c.code}
            </p>
          )}
          <h3 className={`text-ink text-base font-semibold ${c.code ? "mt-2.5" : ""}`}>
            {c.name}
          </h3>
          <p className="text-ink-4 mt-3 text-sm leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Ordered manufacturing stages.
 *
 * Numbered, because the order is the information — compounding has to happen
 * before extrusion, curing before cut-off. An unordered list would lose that.
 * `<ol>` rather than a div grid for the same reason.
 */
export function ProcessSteps({
  steps,
}: {
  steps: readonly { name: string; body: string }[];
}) {
  return (
    <ol className="grid gap-[2px] sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li
          key={s.name}
          className="border-line bg-surface-2 rounded-card border p-7"
        >
          <span className="text-accent-400 font-mono text-sm tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="text-ink mt-4 text-base font-semibold">{s.name}</h3>
          <p className="text-ink-4 mt-3 text-sm leading-relaxed">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * The "specify in four lines" block: each parameter with the format expected
 * of it, so a buyer can assemble a complete enquiry without a phone call.
 */
export function SpecifyGrid({
  items,
}: {
  items: readonly { label: string; value: string; body: string }[];
}) {
  return (
    <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="border-line border-t pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="text-ink text-base font-semibold">{it.label}</dt>
            <span className="text-accent-400 font-mono text-sm">{it.value}</span>
          </div>
          <dd className="text-ink-4 mt-3 text-sm leading-relaxed">{it.body}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small facts above a CTA's buttons — MOQ, sample quantity, turnaround. */
export function CtaChips({ chips }: { chips: readonly string[] }) {
  return (
    <ul className="mt-7 flex flex-wrap gap-2">
      {chips.map((c) => (
        <li
          key={c}
          className="border-line text-ink-3 rounded-pill border px-3.5 py-1.5 text-xs"
        >
          {c}
        </li>
      ))}
    </ul>
  );
}

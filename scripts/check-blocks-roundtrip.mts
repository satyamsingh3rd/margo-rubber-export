import { getAllSlugs, getFrontmatter } from "../src/lib/content.ts";
import { toBlocks } from "../src/lib/product-blocks.ts";
import { toIndustryBlocks } from "../src/lib/industry-blocks.ts";
import { parseBlocks } from "../src/content/blocks.ts";
import { toSanityBlock } from "../src/lib/product-migrate.ts";

/**
 * BLOCK ROUND-TRIP CHECK
 *
 * Proves that a category page survives the journey to Sanity and back without
 * changing, WITHOUT needing a write token or a document in the dataset.
 *
 * The journey has four steps and this exercises three of them:
 *
 *   1. .mdx frontmatter  → blocks          (toBlocks — the read adapter)
 *   2. blocks            → Sanity document (toSanity — the migration writer)
 *   3. Sanity document   → GROQ result     (simulated projection)
 *   4. GROQ result       → blocks          (parseBlocks — the read path)
 *
 * If the blocks that come out of step 4 equal the blocks that went into step
 * 2, then the storage shape, the projection and the validation all agree. The
 * only thing left untested is the network hop, which is checked separately by
 * running the real query against the live dataset.
 *
 * This exists because the storage shape and the render shape genuinely differ
 * in two places — spec-table rows and the parts grid — and both differences
 * are invisible until a real page is migrated. Finding them here costs
 * seconds; finding them during the migration costs a day.
 */

/* ── Step 2: blocks → Sanity document ─────────────────────────────────────── */

/**
 * Imported from the real writer, not reimplemented.
 *
 * This half MUST be shared: a private copy here would let the migration script
 * drift from what this check proves, which is the one failure this check
 * exists to prevent. The GROQ mirror below is the opposite case and is
 * deliberately a separate implementation.
 */

/* ── Step 3: Sanity document → what GROQ returns ──────────────────────────── */

/**
 * Mirrors `productCategoryBySlugQuery` by hand.
 *
 * Deliberately a separate implementation rather than a shared helper: the
 * point is to check that the projection written in GROQ does what the writer
 * assumes, and a shared helper would make the two agree by construction and
 * prove nothing.
 */
function projectAsGroq(
  stored: Record<string, unknown>[],
  doc: { anchors?: unknown[]; navLabel?: string; slug?: string; faqs?: unknown[] },
): unknown[] {
  return stored.map((raw) => {
    const out: Record<string, unknown> = { ...raw };

    if (raw._type === "block.specTable" && Array.isArray(raw.rows)) {
      out.rows = (raw.rows as Array<{ cells: string[] }>).map((r) => r.cells);
    }

    if (raw._type === "block.partsGrid") {
      out.parts = doc.anchors;
      out.categoryLabel = doc.navLabel;
      out.categorySlug = doc.slug;
    }

    // Industry FAQ: the questions live on the document, same arrangement.
    if (raw._type === "block.industryFaq") {
      out.items = doc.faqs;
    }

    return out;
  });
}

/* ── Comparison ───────────────────────────────────────────────────────────── */

/** `_key`s are added by the writer, so they are not part of the comparison. */
function withoutKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([k]) => k !== "_key")
        .map(([k, v]) => [k, withoutKeys(v)])
        .sort(([a], [b]) => (a as string).localeCompare(b as string)),
    );
  }
  return value;
}

const show = (v: unknown) => JSON.stringify(withoutKeys(v));

/* ── Run ──────────────────────────────────────────────────────────────────── */

let failures = 0;
let checked = 0;
let pages = 0;

/**
 * Both collections, through the same three steps. Industries were added after
 * products and immediately justified the effort: their FAQ block joins from the
 * document exactly as the parts grid does, and that join is the kind of thing
 * this check exists to keep honest.
 */
const COLLECTIONS = [
  { name: "products" as const, blocks: (fm: never, slug: string) => toBlocks(fm, slug) },
  { name: "industries" as const, blocks: (fm: never) => toIndustryBlocks(fm) },
];

for (const collection of COLLECTIONS) {
  for (const slug of getAllSlugs(collection.name)) {
    const fm = getFrontmatter(collection.name, slug) as never as Record<string, unknown>;
    const original = collection.blocks(fm as never, slug);

    const stored = original.map(toSanityBlock).map((b) => {
      // The writer strips the joined list before storing; mirror that here or
      // the comparison would pass for the wrong reason.
      const out = { ...b };
      if (out._type === "block.industryFaq") delete out.items;
      return out;
    });

    const projected = projectAsGroq(stored, {
      anchors: fm.anchors as unknown[],
      navLabel: fm.navLabel as string,
      slug,
      faqs: fm.faqs as unknown[],
    });

    const { blocks, errors } = parseBlocks(projected, `${slug} (round-trip)`);
    checked += original.length;
    pages++;

    if (errors.length > 0) {
      failures += errors.length;
      console.error(`✖ ${slug}: ${errors.length} block(s) failed validation`);
      for (const e of errors) console.error(`    ${e}`);
      continue;
    }

    if (blocks.length !== original.length) {
      failures++;
      console.error(`✖ ${slug}: ${original.length} blocks in, ${blocks.length} out`);
      continue;
    }

    let pageBad = 0;
    original.forEach((before, i) => {
      const after = blocks[i];
      if (show(before) === show(after)) return;
      pageBad++;
      failures++;
      console.error(`✖ ${slug} block ${i} (${before._type}) changed:`);
      console.error(`    before: ${show(before).slice(0, 220)}`);
      console.error(`    after:  ${show(after).slice(0, 220)}`);
    });

    if (pageBad === 0) {
      console.log(`✓ ${collection.name}/${slug} — ${original.length} blocks round-tripped`);
    }
  }
}

console.log(
  `\n${checked} blocks across ${pages} pages; ` +
    (failures === 0 ? "all identical." : `${failures} problem(s).`),
);

process.exit(failures === 0 ? 0 : 1);

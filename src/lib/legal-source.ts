import { cacheTag } from "next/cache";
import { client } from "../../sanity/client";
import { legalBySlugQuery, legalSlugsQuery } from "../../sanity/queries";
import { getAllSlugs, getFrontmatter } from "@/lib/content";
import { legalSchema, type LegalPage } from "@/content/schemas";

/**
 * WHERE A LEGAL PAGE COMES FROM
 *
 * Sanity if the document exists there; the .mdx file otherwise.
 *
 * This is the seam that lets the migration happen a page at a time rather
 * than as one cutover. A slug that has been moved is served from the CMS; a
 * slug that has not is served from the repository exactly as before. The site
 * stays live throughout, and the two sources cannot disagree because only one
 * of them answers for any given slug.
 *
 * The Sanity result is validated against the SAME Zod schema the .mdx files
 * are. That is the point of mirroring the schema field for field: content
 * arriving from a CMS is no more trustworthy than content arriving from a
 * file, and an editor who empties a required field should be caught here
 * rather than by a template rendering `undefined`.
 */

/** Cache tag for the whole collection, and for one page. */
export const legalTag = (slug?: string) =>
  slug ? `legal:${slug}` : "legal";

/**
 * GROQ returns `null` for a field with no value; Zod's `.optional()` means
 * `undefined`. Left alone, every unfilled optional field fails validation —
 * which is exactly what happened the first time this ran, on `seo.keywords`
 * and `sections[].navLabel`.
 *
 * The MDX loader has the same guard, but only at the top level, because
 * frontmatter nulls only ever appear there. Sanity nests them, so this walks
 * the whole tree. Fields declared `.nullable()` are unaffected: stripping
 * them to `undefined` lets their `.default(null)` put the null back.
 */
function stripNullsDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripNullsDeep) as unknown as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, stripNullsDeep(v)]),
    ) as T;
  }
  return value;
}

async function fromSanity(slug: string): Promise<LegalPage | null> {
  "use cache";
  // Tagged so the publish webhook can invalidate exactly this page rather
  // than the whole site.
  cacheTag(legalTag(slug), legalTag());

  const raw = await client.fetch(legalBySlugQuery, { slug });
  if (!raw) return null;

  const parsed = legalSchema.safeParse(stripNullsDeep(raw));
  if (!parsed.success) {
    // Loud, and non-fatal: the .mdx fallback still answers. A schema failure
    // here means an editor saved something the templates cannot render, and
    // silently serving a broken page would hide that.
    console.error(
      `[legal] Sanity document "${slug}" failed validation:`,
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
    return null;
  }
  return parsed.data;
}

/** Every slug the route should build, from both sources, de-duplicated. */
export async function legalSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(legalTag());

  const fromCms = await client.fetch<string[]>(legalSlugsQuery).catch(() => []);
  return [...new Set([...getAllSlugs("legal"), ...fromCms])];
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  const cms = await fromSanity(slug).catch(() => null);
  if (cms) return cms;

  try {
    return getFrontmatter("legal", slug);
  } catch {
    return null;
  }
}

import { cacheTag } from "next/cache";
import { client } from "../../sanity/client";
import { skuBySlugQuery, skuSlugsQuery } from "../../sanity/queries";
import { getAllSlugs, getContent } from "@/lib/content";
import { validateSkuDocument } from "@/lib/cms-validate";
import { type Sku } from "@/content/schemas";

/**
 * WHERE A CATALOGUE PART COMES FROM
 *
 * Sanity if the document exists there; the .mdx file otherwise. The fourth
 * page type on the same seam.
 *
 * Simpler than the other two, because a SKU has no block list — the page is
 * fixed structure and every field is flat. There is nothing to reorder, so
 * there is nothing to validate per block, and the whole document is checked in
 * one pass.
 */

export const skuTag = (slug?: string) => (slug ? `sku:${slug}` : "sku");

export type SkuPage = {
  frontmatter: Sku;
  source: "sanity" | "mdx";
};

async function fromSanity(slug: string): Promise<SkuPage | null> {
  "use cache";
  cacheTag(skuTag(slug), skuTag());

  const raw = await client.fetch(skuBySlugQuery, { slug });
  if (!raw) return null;

  const result = validateSkuDocument(raw, slug);
  if (!result.ok) {
    // A fallback renders identically, so this log is the only runtime signal.
    // `npm run check:cms` is what actually asserts the source.
    console.error(`[sku] Sanity document "${slug}" failed validation:`, result.issues);
    return null;
  }

  return { frontmatter: result.frontmatter, source: "sanity" };
}

async function fromMdx(slug: string): Promise<SkuPage | null> {
  try {
    const { frontmatter } = await getContent("skus", slug);
    return { frontmatter, source: "mdx" };
  } catch {
    return null;
  }
}

export async function getSkuPage(slug: string): Promise<SkuPage | null> {
  const cms = await fromSanity(slug).catch(() => null);
  if (cms) return cms;
  return fromMdx(slug);
}

export async function skuSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(skuTag());

  const fromCms = await client.fetch<string[]>(skuSlugsQuery).catch(() => []);
  return [...new Set([...getAllSlugs("skus"), ...fromCms])];
}

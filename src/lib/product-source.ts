import { cacheTag } from "next/cache";
import { client } from "../../sanity/client";
import {
  productCategoryBySlugQuery,
  productCategorySlugsQuery,
} from "../../sanity/queries";
import { getAllSlugs, getContent } from "@/lib/content";
import { toBlocks } from "@/lib/product-blocks";
import { type Block } from "@/content/blocks";
import { validateCategoryDocument } from "@/lib/cms-validate";
import { type ProductCategory } from "@/content/schemas";

/**
 * WHERE A PRODUCT CATEGORY PAGE COMES FROM
 *
 * Sanity if the document exists there; the .mdx file otherwise. The same seam
 * as legal-source.ts, and for the same reason: the migration happens a page at
 * a time rather than as one cutover, and the two sources cannot disagree
 * because only one of them answers for any given slug.
 *
 * What is different here, and what this page type was built first to prove:
 * both sources return an ORDERED BLOCK LIST. The .mdx file does not contain
 * one — it has fifteen named fields — so it is converted on read by
 * `toBlocks`. The renderer therefore has a single input shape and no knowledge
 * of where a page came from.
 */

export type CategoryPage = {
  frontmatter: ProductCategory;
  blocks: Block[];
  /** The compiled .mdx body, for pages not yet migrated. Absent for CMS pages. */
  Content?: React.ComponentType;
  hasBody: boolean;
  source: "sanity" | "mdx";
};

export const productTag = (slug?: string) =>
  slug ? `product:${slug}` : "product";

async function fromSanity(slug: string): Promise<CategoryPage | null> {
  "use cache";
  cacheTag(productTag(slug), productTag());

  const raw = await client.fetch(productCategoryBySlugQuery, { slug });
  if (!raw) return null;

  const result = validateCategoryDocument(raw, slug);
  if (!result.ok) {
    // Loud and non-fatal: the .mdx fallback still answers. A fallback renders
    // identically, so this log is the only signal — `npm run check:cms`
    // asserts the source directly for that reason.
    console.error(
      `[product] Sanity document "${slug}" failed validation:`,
      result.issues,
    );
    return null;
  }

  return {
    frontmatter: result.frontmatter,
    blocks: result.blocks,
    hasBody: false,
    source: "sanity",
  };
}

async function fromMdx(slug: string): Promise<CategoryPage | null> {
  try {
    const { frontmatter, Content, hasBody } = await getContent("products", slug);
    return {
      frontmatter,
      blocks: toBlocks(frontmatter, slug),
      Content,
      hasBody,
      source: "mdx",
    };
  } catch {
    return null;
  }
}

export async function getCategoryPage(slug: string): Promise<CategoryPage | null> {
  const cms = await fromSanity(slug).catch(() => null);
  if (cms) return cms;
  return fromMdx(slug);
}

/** Every slug the route should build, from both sources, de-duplicated. */
export async function categorySlugs(): Promise<string[]> {
  "use cache";
  cacheTag(productTag());

  const fromCms = await client
    .fetch<string[]>(productCategorySlugsQuery)
    .catch(() => []);
  return [...new Set([...getAllSlugs("products"), ...fromCms])];
}

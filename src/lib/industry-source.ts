import { cacheTag } from "next/cache";
import { client } from "../../sanity/client";
import { industryBySlugQuery, industrySlugsQuery } from "../../sanity/queries";
import { getAllSlugs, getContent } from "@/lib/content";
import { toIndustryBlocks } from "@/lib/industry-blocks";
import { type Block } from "@/content/blocks";
import { validateIndustryDocument } from "@/lib/cms-validate";
import { type Industry } from "@/content/schemas";

/**
 * WHERE AN INDUSTRY PAGE COMES FROM
 *
 * Sanity if the document exists there; the .mdx file otherwise. Identical seam
 * to legal-source.ts and product-source.ts — three page types now share the
 * pattern, which is the point at which it is worth trusting.
 */

export const industryTag = (slug?: string) =>
  slug ? `industry:${slug}` : "industry";

export type IndustryPage = {
  frontmatter: Industry;
  blocks: Block[];
  source: "sanity" | "mdx";
};

async function fromSanity(slug: string): Promise<IndustryPage | null> {
  "use cache";
  cacheTag(industryTag(slug), industryTag());

  const raw = await client.fetch(industryBySlugQuery, { slug });
  if (!raw) return null;

  const result = validateIndustryDocument(raw, slug);
  if (!result.ok) {
    // Loud and non-fatal: the .mdx fallback still answers. But note that a
    // fallback renders IDENTICALLY, so this log is the only signal — which is
    // why `npm run check:cms` asserts the source rather than the output.
    console.error(
      `[industry] Sanity document "${slug}" failed validation:`,
      result.issues,
    );
    return null;
  }

  return { frontmatter: result.frontmatter, blocks: result.blocks, source: "sanity" };
}

async function fromMdx(slug: string): Promise<IndustryPage | null> {
  try {
    const { frontmatter } = await getContent("industries", slug);
    return {
      frontmatter,
      blocks: toIndustryBlocks(frontmatter),
      source: "mdx",
    };
  } catch {
    return null;
  }
}

export async function getIndustryPage(slug: string): Promise<IndustryPage | null> {
  const cms = await fromSanity(slug).catch(() => null);
  if (cms) return cms;
  return fromMdx(slug);
}

export async function industrySlugs(): Promise<string[]> {
  "use cache";
  cacheTag(industryTag());

  const fromCms = await client.fetch<string[]>(industrySlugsQuery).catch(() => []);
  return [...new Set([...getAllSlugs("industries"), ...fromCms])];
}

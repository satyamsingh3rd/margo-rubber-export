import { notFound } from "next/navigation";
import { getAllSlugs, getContent, getFrontmatter } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import {
  SkuCompounds,
  SkuCta,
  SkuHero,
  SkuSpecs,
} from "@/components/sections/SkuBlocks";

/**
 * ONE file → every SKU page.
 *
 * Strategy D3 / Scenario 1 from §4.5: the blueprint states four separate times
 * that SKUs are sections rather than pages, so these ship `noindex` until real
 * per-part spec content exists. Structure complete, no thin-page penalty, and
 * the category page keeps the ranking intent.
 *
 * SKU files are named `<category>--<slug>.mdx` because anchor ids are unique
 * per category, not globally: "epdm" is a real part in both gaskets and
 * oil-seals, and a flat filename would have silently dropped one.
 */

// Separator is "--", not "_": baseSchema validates slug against ^[a-z0-9-]+$
// and an underscore fails it, which made every SKU throw and prerender as a
// 404 page. Kebab slugs never contain a double hyphen, so the split is safe.
const fileFor = (category: string, product: string) => `${category}--${product}`;

export function generateStaticParams() {
  return getAllSlugs("skus").map((file) => {
    const i = file.indexOf("--");
    return { category: file.slice(0, i), product: file.slice(i + 2) };
  });
}

export async function generateMetadata(
  props: PageProps<"/products/[category]/[product]">,
) {
  const { category, product } = await props.params;
  try {
    const { frontmatter } = await getContent("skus", fileFor(category, product));
    return buildMetadata(frontmatter, `/products/${category}/${product}`);
  } catch {
    return {};
  }
}

export default async function SkuPage(
  props: PageProps<"/products/[category]/[product]">,
) {
  const { category, product } = await props.params;

  let data;
  try {
    data = await getContent("skus", fileFor(category, product));
  } catch {
    notFound();
  }

  const fm = data.frontmatter;

  // A SKU whose file says it belongs elsewhere must not resolve here, or the
  // same part would be reachable under every category.
  if (fm.category !== category) notFound();

  // Category display name comes from the category file, so the breadcrumb and
  // the nav label can never drift apart.
  let categoryLabel = category.replace(/-/g, " ");
  try {
    categoryLabel = getFrontmatter("products", category).navLabel;
  } catch {
    // Category file missing is a content error, not a reason to 500.
  }

  return (
    <>
      <SkuHero
        categorySlug={category}
        categoryLabel={categoryLabel}
        productCode={fm.productCode}
        h1={fm.h1}
        intro={fm.intro}
      />

      <SkuSpecs
        productCode={fm.productCode}
        specs={fm.specs}
        categoryLabel={categoryLabel}
      />

      <SkuCompounds codes={fm.compounds} />

      <SkuCta
        h1={fm.h1}
        categorySlug={category}
        categoryLabel={categoryLabel}
      />
    </>
  );
}

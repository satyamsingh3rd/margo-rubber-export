import { notFound } from "next/navigation";
import { getAllSlugs, getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { productCategoryGraph, shouldEmitSchema } from "@/lib/schema";
import { Section } from "@/components/ui/Section";
import { SpecTable } from "@/components/sections/SpecTable";
import { MaterialCards } from "@/components/sections/MaterialCards";
import {
  AnswerBlock,
  CategoryHero,
  CommercialTable,
  CTABand,
  NarrowBlock,
  StandardsGrid,
} from "@/components/sections/Blocks";

/**
 * ONE file → nine product category pages.
 *
 * Adding a category is adding one .mdx file to src/content/products/.
 * This route is never edited for it.
 */

export async function generateStaticParams() {
  return getAllSlugs("products").map((category) => ({ category }));
}

export async function generateMetadata(
  props: PageProps<"/products/[category]">,
) {
  const { category } = await props.params;
  try {
    const { frontmatter } = await getContent("products", category);
    return buildMetadata(frontmatter, `/products/${category}`);
  } catch {
    return {};
  }
}

export default async function ProductCategoryPage(
  props: PageProps<"/products/[category]">,
) {
  const { category } = await props.params;

  let data;
  try {
    data = await getContent("products", category);
  } catch {
    notFound();
  }

  const { frontmatter: fm, Content, hasBody } = data;
  const path = `/products/${category}`;

  // Heading splits across two lines, second line in accent — "Precision" /
  // "O-Rings". `h1Accent` sets the split explicitly; otherwise the last word
  // is used, which is correct for most headings but not ones ending "& X".
  const accentFromFm =
    fm.h1Accent && fm.h1.endsWith(fm.h1Accent) ? fm.h1Accent : null;
  const headingAccent = accentFromFm ?? fm.h1.split(" ").slice(-1)[0];
  const headingLead = fm.h1.slice(0, fm.h1.length - headingAccent.length).trim();

  return (
    <>
      {shouldEmitSchema(fm.status) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productCategoryGraph(fm, path)),
          }}
        />
      )}

      <CategoryHero
        badge="ISO 9001:2015 Certified · Nashik, India"
        headingLead={headingLead}
        headingAccent={headingAccent}
        intro={fm.intro}
        link={{ label: "View O-Ring Size Chart", href: "/resources/o-ring-size-chart" }}
        stats={fm.heroStats}
        image={fm.hero?.image}
      />

      {fm.specSection && (
        <Section
          id="specifications"
          eyebrow={fm.specSection.eyebrow}
          heading={fm.specSection.heading}
          body={fm.specSection.body}
        >
          <SpecTable
            columns={fm.specSection.columns}
            rows={fm.specSection.rows}
            footnote={fm.specSection.footnote}
          />
        </Section>
      )}

      {fm.materialSection && (
        <Section
          id="materials"
          eyebrow={fm.materialSection.eyebrow}
          heading={fm.materialSection.heading}
          body={fm.materialSection.body}
          className="bg-band"
        >
          <MaterialCards items={fm.materialSection.items} />
        </Section>
      )}

      {fm.standardsSection && (
        <Section
          id="standards"
          eyebrow={fm.standardsSection.eyebrow}
          heading={fm.standardsSection.heading}
        >
          <NarrowBlock>
            <AnswerBlock>{fm.standardsSection.answer}</AnswerBlock>
            <div className="mt-[38px]">
              <StandardsGrid items={fm.standardsSection.items} />
            </div>
          </NarrowBlock>
        </Section>
      )}

      {fm.commercialSection && (
        <Section
          id="commercial"
          eyebrow={fm.commercialSection.eyebrow}
          heading={fm.commercialSection.heading}
          body={fm.commercialSection.body}
          className="bg-band"
        >
          <CommercialTable rows={fm.commercialSection.rows} />
        </Section>
      )}

      {/* Free-form prose — rendered only when the MDX body actually has any,
          so a structured page doesn't ship an empty padded band. */}
      {hasBody && (
        <Section>
          <Content />
        </Section>
      )}

      {fm.cta && (
        <CTABand
          eyebrow={fm.cta.eyebrow}
          heading={fm.cta.heading}
          body={fm.cta.body}
          primary={fm.cta.primary}
          secondary={fm.cta.secondary}
        />
      )}
    </>
  );
}

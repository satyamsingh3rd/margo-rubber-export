import { notFound } from "next/navigation";
import { getAllSlugs, getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { productCategoryGraph, shouldEmitSchema } from "@/lib/schema";
import { Section } from "@/components/ui/Section";
import { SpecTable } from "@/components/sections/SpecTable";
import { MaterialCards } from "@/components/sections/MaterialCards";
import { PartsGrid } from "@/components/sections/PartsGrid";
import {
  CardGrid,
  ProcessSteps,
  SpecifyGrid,
} from "@/components/sections/CategoryBlocks";
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
        link={fm.heroLink}
        stats={fm.heroStats}
        image={fm.hero?.image}
      />

      {/* The catalogue of sections comes before the compound table: you pick
          the shape you need, then the compound it is made in. That is the
          order the comp draws and the order a buyer actually decides in. */}
      {fm.profileSection && (
        <Section
          id="profiles"
          eyebrow={fm.profileSection.eyebrow}
          heading={fm.profileSection.heading}
          body={fm.profileSection.body}
        >
          <CardGrid items={fm.profileSection.items} />
        </Section>
      )}

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

      {/* Parts in this category.
          Renders the `anchors:` data every category file already carries, and
          gives the 301 map real fragment targets to land on. Eyebrow and
          heading are set here rather than in content because this section is
          an experiment on a branch; if it is kept, move them into the MDX like
          every other section. */}
      {fm.anchors.length > 0 && (
        <Section
          id="parts"
          eyebrow="IN THIS CATEGORY"
          heading={`${fm.anchors.length} parts we make to order`}
          body="Each part below is manufactured to customer drawing or to our standard tooling. Full dimensional and compound data is issued with quotation."
        >
          <PartsGrid
            parts={fm.anchors}
            categoryLabel={fm.navLabel}
            categorySlug={category}
          />
        </Section>
      )}

      {fm.processSection && (
        <Section
          id="process"
          eyebrow={fm.processSection.eyebrow}
          heading={fm.processSection.heading}
          body={fm.processSection.body}
          className="bg-band"
        >
          <ProcessSteps steps={fm.processSection.steps} />
        </Section>
      )}

      {fm.specifySection && (
        <Section
          id="specify"
          eyebrow={fm.specifySection.eyebrow}
          heading={fm.specifySection.heading}
          body={fm.specifySection.body}
        >
          <NarrowBlock>
            <SpecifyGrid items={fm.specifySection.items} />
          </NarrowBlock>
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

      {fm.sectorsSection && (
        <Section
          id="sectors"
          eyebrow={fm.sectorsSection.eyebrow}
          heading={fm.sectorsSection.heading}
          body={fm.sectorsSection.body}
        >
          <CardGrid items={fm.sectorsSection.items} />
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
          chips={fm.cta.chips}
        />
      )}
    </>
  );
}

import { notFound } from "next/navigation";
import { getAllSlugs, getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { productCategoryGraph, shouldEmitSchema } from "@/lib/schema";
import { Section } from "@/components/ui/Section";
import { SpecTable } from "@/components/sections/SpecTable";
import { MaterialCards } from "@/components/sections/MaterialCards";
import { PartsGrid } from "@/components/sections/PartsGrid";
import {
  CtaPanel,
  ProcessTimeline,
  ProfileGrid,
  QualityPanel,
  SectorCards,
  SpecifyCards,
} from "@/components/sections/CategoryBlocks";
import {
  ApplicationCards,
  ComparePanels,
  DensityBlock,
  SubCategoryBlock,
} from "@/components/sections/FoamBlocks";
import { CompoundGuide } from "@/components/sections/CompoundGuide";
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

  /**
   * The UI-changes2 comps alternate a near-black band with a lighter one and
   * bloom the accent at each change. `bg-band` is #030303 against a #000000
   * canvas — invisible — so those pages use `bg-surface-2` instead.
   *
   * Sections are conditional, so alternation is counted as they render rather
   * than hard-coded: JSX evaluates top to bottom, so calling `band()` in each
   * section's className alternates over whichever sections this page actually
   * has. The nine older pages keep their existing flat treatment.
   */
  const comp2 = fm.heroActions.length > 0;
  let bandIndex = 0;
  const band = () => {
    if (!comp2) return "";
    return bandIndex++ % 2 === 1 ? "bg-surface-2" : "";
  };

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
        actions={fm.heroActions}
        eyebrowVariant={fm.heroActions.length > 0 ? "rule" : "badge"}
        statsAlign={fm.heroStatsAlign}
        breadcrumb={
          fm.heroBreadcrumb
            ? [
                { label: "Products", href: "/products" },
                { label: fm.navLabel, href: path },
              ]
            : undefined
        }
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
          align="center"
          eyebrowVariant="rule"
          className={band()}
          glow
        >
          <ProfileGrid items={fm.profileSection.items} />
        </Section>
      )}

      {fm.compareSection && (
        <Section
          id="cell-structure"
          eyebrow={fm.compareSection.eyebrow}
          heading={fm.compareSection.heading}
          body={fm.compareSection.body}
          align="center"
          eyebrowVariant="rule"
          className={band()}
          glow
        >
          <ComparePanels panels={fm.compareSection.panels} />
        </Section>
      )}

      {fm.compoundSection && (
        <Section
          id="compounds"
          eyebrow={fm.compoundSection.eyebrow}
          heading={fm.compoundSection.heading}
          body={fm.compoundSection.body}
          className={band()}
          glow
          align="center"
          eyebrowVariant="rule"
        >
          <CompoundGuide items={fm.compoundSection.items} />
        </Section>
      )}

      {fm.specSection && (
        <Section
          id="specifications"
          eyebrow={fm.specSection.eyebrow}
          heading={fm.specSection.heading}
          body={fm.specSection.body}
          align={comp2 ? "center" : "left"}
          eyebrowVariant={comp2 ? "rule" : "plain"}
          className={band()}
          glow={comp2}
        >
          <SpecTable
            columns={fm.specSection.columns}
            rows={fm.specSection.rows}
            footnote={fm.specSection.footnote}
            controls={fm.specSection.controls}
          />
        </Section>
      )}

      {fm.densitySection && (
        <Section
          id="density"
          eyebrow={fm.densitySection.eyebrow}
          heading={fm.densitySection.heading}
          body={fm.densitySection.body}
          eyebrowVariant="rule"
          className={band()}
          glow
        >
          <DensityBlock
            scale={fm.densitySection.scale}
            quote={fm.densitySection.quote}
            bands={fm.densitySection.bands}
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
          className={band()}
          glow
          align="center"
          eyebrowVariant="rule"
        >
          <ProcessTimeline steps={fm.processSection.steps} />
        </Section>
      )}

      {fm.subCategorySection && (
        <SubCategoryBlock
          id={fm.subCategorySection.id}
          eyebrow={fm.subCategorySection.eyebrow}
          heading={fm.subCategorySection.heading}
          body={fm.subCategorySection.body}
          dividerLabel={fm.subCategorySection.dividerLabel}
          buildUp={fm.subCategorySection.buildUp}
          comparisons={fm.subCategorySection.comparisons}
          note={fm.subCategorySection.note}
          className={band()}
        />
      )}

      {fm.applicationsSection && (
        <Section
          id="applications"
          eyebrow={fm.applicationsSection.eyebrow}
          heading={fm.applicationsSection.heading}
          body={fm.applicationsSection.body}
          className={band()}
          glow
          align="center"
          eyebrowVariant="rule"
        >
          <ApplicationCards items={fm.applicationsSection.items} />
        </Section>
      )}

      {fm.specifySection && (
        <Section
          id="specify"
          eyebrow={fm.specifySection.eyebrow}
          heading={fm.specifySection.heading}
          body={fm.specifySection.body}
          align="center"
          eyebrowVariant="rule"
          className={band()}
          glow
        >
          <SpecifyCards items={fm.specifySection.items} />
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

      {fm.qualitySection && (
        <QualityPanel
          eyebrow={fm.qualitySection.eyebrow}
          heading={fm.qualitySection.heading}
          body={fm.qualitySection.body}
          quote={fm.qualitySection.quote}
          badges={fm.qualitySection.badges}
          standards={fm.qualitySection.standards}
          docPackage={fm.qualitySection.docPackage}
          className={band()}
        />
      )}

      {fm.sectorsSection && (
        <Section
          id="sectors"
          eyebrow={fm.sectorsSection.eyebrow}
          heading={fm.sectorsSection.heading}
          body={fm.sectorsSection.body}
          align="center"
          eyebrowVariant="rule"
          className={band()}
          glow
        >
          <SectorCards items={fm.sectorsSection.items} />
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

      {/* Two closing bands. The nine older pages use the left-aligned
          CTABand; the new comps use a centred panel with corner brackets and
          a row of fact chips. Chips are what distinguishes them, so their
          presence selects the layout rather than a separate flag. */}
      {fm.cta &&
        (fm.cta.chips.length > 0 ? (
          <CtaPanel
            eyebrow={fm.cta.eyebrow}
            heading={fm.cta.heading}
            body={fm.cta.body}
            chips={fm.cta.chips}
            primary={fm.cta.primary}
            secondary={fm.cta.secondary}
            className={band()}
          />
        ) : (
          <CTABand
            eyebrow={fm.cta.eyebrow}
            heading={fm.cta.heading}
            body={fm.cta.body}
            primary={fm.cta.primary}
            secondary={fm.cta.secondary}
          />
        ))}
    </>
  );
}

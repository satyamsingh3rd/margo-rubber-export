import { notFound } from "next/navigation";
import { getAllSlugs, getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbNode, faqNode, organizationNode, shouldEmitSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { Section } from "@/components/ui/Section";
import {
  ApplicationCards,
  ClosingBand,
  ComponentTabs,
  ConditionGrid,
  ExportLane,
  IndustryFAQ,
  IndustryHero,
  QualityCards,
} from "@/components/sections/IndustryDetail";
import { Button } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { Container, Eyebrow } from "@/components/ui/Section";

/** ONE file → all nine industry pages. */
export async function generateStaticParams() {
  return getAllSlugs("industries").map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/industries/[slug]">) {
  const { slug } = await props.params;
  try {
    const { frontmatter } = await getContent("industries", slug);
    return buildMetadata(frontmatter, `/industries/${slug}`);
  } catch {
    return {};
  }
}

export default async function IndustryPage(props: PageProps<"/industries/[slug]">) {
  const { slug } = await props.params;

  let data;
  try {
    data = await getContent("industries", slug);
  } catch {
    notFound();
  }

  const fm = data.frontmatter;
  const path = `/industries/${slug}`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      breadcrumbNode([
        { name: "Home", path: "/" },
        { name: "Industries", path: "/industries" },
        { name: fm.navLabel, path },
      ]),
      ...(faqNode(fm.faqs) ? [faqNode(fm.faqs)!] : []),
    ],
  };

  return (
    <>
      {shouldEmitSchema(fm.status) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      )}

      <IndustryHero
        badge={fm.badge}
        lines={fm.h1Lines}
        accentLines={fm.h1AccentLines}
        intro={fm.intro}
        actions={fm.actions}
        image={fm.hero?.image}
        boost={fm.heroBoost}
      />

      {fm.components && (
        <Section
          eyebrow={fm.components.eyebrow}
          eyebrowVariant="rule"
          heading={fm.components.heading}
          body={fm.components.body}
        >
          <ComponentTabs items={fm.components.items} />
        </Section>
      )}

      {fm.applications && (
        <Section
          className="bg-[#050505]"
          eyebrow={fm.applications.eyebrow}
          eyebrowVariant="rule"
          heading={fm.applications.heading}
          body={fm.applications.body}
        >
          <ApplicationCards items={fm.applications.items} />
        </Section>
      )}

      {fm.conditions && (
        <Section
          eyebrow={fm.conditions.eyebrow}
          eyebrowVariant="rule"
          heading={fm.conditions.heading}
          body={fm.conditions.body}
        >
          <ConditionGrid items={fm.conditions.items} />
        </Section>
      )}

      {fm.custom && (
        <Section className="bg-[#050505]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow variant="rule">{fm.custom.eyebrow}</Eyebrow>
              <h2 className="text-h1 mt-4 max-w-[18ch]">{fm.custom.heading}</h2>
              {fm.custom.body && (
                <p className="text-ink-4 mt-5 max-w-[52ch] text-sm leading-relaxed">
                  {fm.custom.body}
                </p>
              )}
              <ul className="mt-6 space-y-2.5">
                {fm.custom.bullets.map((b) => (
                  <li key={b} className="text-ink-2 flex items-start gap-2.5 text-sm">
                    <span aria-hidden className="bg-accent-400 mt-1.5 size-1.5 shrink-0 rounded-full" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button href={fm.custom.cta.href} className="mt-8">
                {fm.custom.cta.label} <span aria-hidden>→</span>
              </Button>
            </div>

            {fm.custom.image && (
              <div className="rounded-card relative aspect-[4/3] overflow-hidden">
                <Img k={fm.custom.image} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                {fm.custom.imageCaption && (
                  <div className="from-canvas absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-5">
                    <p className="text-ink text-sm font-semibold">
                      {fm.custom.imageCaption.title}
                    </p>
                    <p className="text-ink-4 mt-1 text-xs">
                      {fm.custom.imageCaption.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      {fm.quality && (
        <Section
          eyebrow={fm.quality.eyebrow}
          eyebrowVariant="rule"
          heading={fm.quality.heading}
          body={fm.quality.body}
        >
          <QualityCards items={fm.quality.items} links={fm.quality.links} />
        </Section>
      )}

      {fm.exportLane && (
        <Section
          className="bg-[#050505]"
          eyebrow={fm.exportLane.eyebrow}
          eyebrowVariant="rule"
          heading={fm.exportLane.heading}
        >
          <ExportLane
            paragraphs={fm.exportLane.paragraphs}
            rows={fm.exportLane.rows}
            card={fm.exportLane.card}
          />
        </Section>
      )}

      {fm.faqs.length > 0 && (
        <Section>
          <Container className="!px-0">
            <Eyebrow variant="rule">
              {fm.faqSection?.eyebrow ?? "FREQUENTLY ASKED QUESTIONS"}
            </Eyebrow>
            <h2 className="text-h2 mt-4 mb-10">
              {fm.faqSection?.heading ?? "Common questions."}
            </h2>
          </Container>
          <IndustryFAQ items={fm.faqs} />
        </Section>
      )}

      {fm.closing && (
        <ClosingBand
          eyebrow={fm.closing.eyebrow}
          lines={fm.closing.lines}
          accentLines={fm.closing.accentLines}
          body={fm.closing.body}
          actions={fm.closing.actions}
          contacts={fm.closing.contacts}
        />
      )}

      {/* Mandatory verbatim non-claim sentences, e.g. NORSOK/API on oil-gas. */}
      {fm.nonClaims.length > 0 && (
        <Section>
          <div className="border-line rounded-card border bg-[#0A0A0A] p-6">
            {fm.nonClaims.map((n) => (
              <p key={n.slice(0, 24)} className="text-ink-4 text-sm leading-relaxed">
                {n}
              </p>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

import { getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { contactPageSchema } from "@/content/schemas";
import {
  ContactHero,
  QuoteSection,
} from "@/components/sections/ContactBlocks";

export async function generateMetadata() {
  const fm = await getPage("contact", contactPageSchema);
  return buildMetadata(fm, "/contact");
}

/**
 * /contact — the primary conversion of the site.
 *
 * Deliberately form-led, not copy-led, and carries NO competing CTA: this is
 * the one page whose goal is submission rather than exploration. The sticky
 * RFQ bar is also suppressed here, since it would point at the form it sits on.
 */
export default async function ContactPage() {
  const fm = await getPage("contact", contactPageSchema);

  return (
    <>
      <ContactHero
        badge={fm.badge}
        lines={fm.h1Lines}
        accentLines={fm.h1AccentLines}
        intro={fm.intro}
        proof={fm.proof}
        image={fm.hero?.image}
      />

      <QuoteSection
        eyebrow={fm.quote.eyebrow}
        heading={fm.quote.heading}
        note={fm.quote.note}
        facility={fm.quote.facility}
        directHeading={fm.quote.directHeading}
        contacts={fm.quote.contacts}
        footnote={fm.quote.footnote}
        steps={[...fm.quote.steps]}
        step1={fm.quote.step1}
        step2={fm.quote.step2}
        continueLabel={fm.quote.continueLabel}
        backLabel={fm.quote.backLabel}
        submitLabel={fm.quote.submitLabel}
        responsePromise={fm.quote.responsePromise}
      />
    </>
  );
}

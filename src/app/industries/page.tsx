import { getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { industriesHubSchema } from "@/content/schemas";
import {
  EnquiryPanel,
  IndustriesHero,
  IndustryGrid,
  SectorCards,
} from "@/components/sections/IndustryBlocks";

export async function generateMetadata() {
  const fm = await getPage("industries", industriesHubSchema);
  return buildMetadata(fm, "/industries");
}

export default async function IndustriesHubPage() {
  const fm = await getPage("industries", industriesHubSchema);

  return (
    <>
      <IndustriesHero
        badge={fm.badge}
        lines={fm.h1Lines}
        accentLines={fm.h1AccentLines}
        intro={fm.intro}
        facts={fm.heroFacts}
        image={fm.hero?.image}
      />

      <IndustryGrid
        placeholder={fm.filter.placeholder}
        chips={fm.filter.chips}
        eyebrow={fm.primary.eyebrow}
        heading={fm.primary.heading}
        items={fm.primary.items}
      />

      <SectorCards
        eyebrow={fm.additional.eyebrow}
        heading={fm.additional.heading}
        note={fm.additional.note}
        items={fm.additional.items}
      />

      <EnquiryPanel
        heading={fm.enquiry.heading}
        body={fm.enquiry.body}
        points={fm.enquiry.points}
        fields={fm.enquiry.fields}
        submitLabel={fm.enquiry.submitLabel}
        footnote={fm.enquiry.footnote}
      />
    </>
  );
}

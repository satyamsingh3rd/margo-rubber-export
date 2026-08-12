import { getPage } from "@/lib/content";
import { utilityPageSchema } from "@/content/schemas";
import { UtilityPage } from "@/components/sections/UtilityPage";

/**
 * 404.
 *
 * No metadata export: Next serves this with a 404 status, which is the correct
 * and sufficient signal to crawlers. A robots meta tag would be redundant.
 *
 * Content lives in pages/not-found.mdx so the copy is editable in the same
 * place as every other page rather than hardcoded in a component.
 *
 * This is the fallback for unknown URLs. It is NOT a substitute for the 301
 * map: the legacy pages with real indexed equity (Scorpio Footrest Mat,
 * C-Pillar Garnish) must be redirected at the server, not land here.
 */
export default async function NotFound() {
  const fm = await getPage("not-found", utilityPageSchema);

  return (
    <UtilityPage
      eyebrow={fm.eyebrow}
      h1Lines={fm.h1Lines}
      intro={fm.intro}
      steps={fm.steps}
      note={fm.note}
      linksHeading={fm.linksHeading}
      links={fm.links}
      actions={fm.actions}
    />
  );
}

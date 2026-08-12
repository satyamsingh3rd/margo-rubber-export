import Link from "next/link";
import { getAllFrontmatter } from "@/lib/content";
import { getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { resourcesHubSchema } from "@/content/schemas";
import { Container } from "@/components/ui/Section";
import {
  ResourceCta,
  ResourceLibrary,
  type Guide,
} from "@/components/sections/ResourceBlocks";

export async function generateMetadata() {
  const fm = await getPage("resources", resourcesHubSchema);
  return buildMetadata(fm, "/resources");
}

/**
 * /resources — brief C3.
 *
 * The guide cards are NOT listed in resources.mdx. They are read from the
 * resources collection at build time, so adding a guide is one MDX file and it
 * appears in the right category group with the counts updated. That is the same
 * one-route-N-files pattern as /products and /industries.
 */
export default async function ResourcesPage() {
  const fm = await getPage("resources", resourcesHubSchema);

  const guides: Guide[] = getAllFrontmatter("resources")
    .map((g) => ({
      slug: g.slug,
      h1: g.h1,
      intro: g.intro,
      category: g.category,
      icon: g.icon,
      readingMinutes: g.readingMinutes,
      featured: g.featured,
    }))
    // Longest reads last within a group: the quick reference guides are the
    // ones a specifying engineer wants first.
    .sort((a, b) => a.readingMinutes - b.readingMinutes);

  const categoryCount = new Set(guides.map((g) => g.category)).size;

  return (
    <>
      <header className="bg-canvas relative isolate overflow-hidden pt-36 pb-12 md:pt-48">
        <span
          aria-hidden
          className="bg-accent-400/10 pointer-events-none absolute -top-20 -left-32 -z-10 size-[32rem] rounded-full blur-3xl"
        />
        <Container>
          <nav aria-label="Breadcrumb">
            <ol className="text-eyebrow text-ink-4 flex flex-wrap items-center gap-2 font-mono uppercase">
              {fm.breadcrumb.map((b, i) => (
                <li key={b.label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>/</span>}
                  {b.href ? (
                    <Link href={b.href} className="hover:text-ink transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-ink-2">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="text-display mt-6">
            {fm.h1Lines.map((line) => (
              <span key={line} className="block">
                {line.split("*").map((part, i) =>
                  i % 2 === 1 ? (
                    <span key={part} className="text-accent-400">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </span>
            ))}
          </h1>

          <p className="text-ink-3 mt-6 max-w-[52ch] leading-relaxed">
            {fm.intro}
          </p>

          {/* Counts are derived, so they cannot drift from the library. */}
          <dl className="text-ink-4 mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <dt className="text-accent-400 font-semibold">{guides.length}</dt>
              <dd>Guides</dd>
            </div>
            <span aria-hidden>·</span>
            <div className="flex items-center gap-1.5">
              <dt className="text-accent-400 font-semibold">{categoryCount}</dt>
              <dd>Categories</dd>
            </div>
            <span aria-hidden>·</span>
            <div className="flex items-center gap-1.5">
              <dt className="text-accent-400 font-semibold">
                {fm.lastUpdated}
              </dt>
              <dd>Last Updated</dd>
            </div>
          </dl>
        </Container>
      </header>

      <ResourceLibrary
        guides={guides}
        categories={fm.categories}
        searchPlaceholder={fm.searchPlaceholder}
        allLabel={fm.allLabel}
        featuredLabel={fm.featuredLabel}
      />

      <ResourceCta
        icon={fm.cta.icon}
        headingLines={fm.cta.headingLines}
        body={fm.cta.body}
        actions={fm.cta.actions}
      />
    </>
  );
}

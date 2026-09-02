import { groq } from "next-sanity";

/**
 * GROQ queries.
 *
 * Each projects exactly the shape the existing templates already expect, so
 * the page components do not change when their content moves. The migration
 * swaps where the data comes from, not what it looks like.
 */

/** One legal page by slug. */
export const legalBySlugQuery = groq`
  *[_type == "legal" && slug.current == $slug][0]{
    "slug": slug.current,
    status,
    "h1": title,
    badge,
    intro,
    lastUpdated,
    seo{
      title,
      description,
      "keywords": select(defined(primaryKeyword) => { "primary": primaryKeyword })
    },
    sections[]{
      "id": id.current,
      title,
      navLabel,
      "icon": coalesce(icon, "doc"),
      // The union the templates expect: { p } | { h } | { ul } | { note }.
      // Rebuilt here rather than in the component, so the renderer stays
      // unaware that the shape ever came from anywhere else.
      "blocks": blocks[]{
        kind == "ul" => { "ul": items },
        kind == "p"  => { "p": text },
        kind == "h"  => { "h": text },
        kind == "note" => { "note": text }
      }
    }
  }
`;

/** Slugs for generateStaticParams, and for the sitemap once migrated. */
export const legalSlugsQuery = groq`
  *[_type == "legal" && defined(slug.current)].slug.current
`;

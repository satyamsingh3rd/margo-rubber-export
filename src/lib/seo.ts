import type { Metadata } from "next";

/** B3 — domain decision pending. Change here only. */
export const SITE_URL = "https://margorubber.in";

type SeoInput = {
  seo: { title: string; description: string };
  status: "placeholder" | "draft" | "published";
};

/**
 * Builds page metadata from frontmatter.
 *
 * Anything not `published` ships `noindex, nofollow` — this is what lets the
 * whole site structure exist before the content does, without repeating the
 * old site's 43-URLs/3-indexed thin-content failure.
 */
export function buildMetadata(fm: SeoInput, path: string): Metadata {
  const url = `${SITE_URL}${path}`;
  const indexable = fm.status === "published";

  return {
    metadataBase: new URL(SITE_URL),
    title: fm.seo.title,
    description: fm.seo.description,
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      url,
      title: fm.seo.title,
      description: fm.seo.description,
      siteName: "Margo Rubber Products",
    },
    twitter: {
      card: "summary_large_image",
      title: fm.seo.title,
      description: fm.seo.description,
    },
  };
}

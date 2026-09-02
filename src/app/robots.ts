import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt
 *
 * Deliberately permissive on content and closed on everything that is not
 * content. There is nothing here that needs to change when copy does, which
 * is why this can be built before Margo's real content arrives.
 *
 * NOTE ON INDEXING. This file does not decide what gets indexed — every page
 * carries its own `noindex` until its content is marked `published`, and the
 * sitemap is filtered the same way. `Allow: /` here means "you may crawl",
 * and each page then says whether it may be indexed. A blanket `Disallow`
 * would be worse: a page Google cannot crawl is a page whose `noindex` it
 * cannot read either, so it can end up indexed from third-party links with no
 * description at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // The enquiries desk. Behind a password, but a crawler should not
          // be knocking on it at all.
          "/margo-desk",
          "/margo-desk/",
          // Endpoints, not pages. Nothing here renders.
          "/api/",
          // Query-string variants of listing pages are the same content
          // reachable at many URLs, which splits ranking signals across them.
          "/*?q=",
          "/*?status=",
          "/*?source=",
          "/*?page=",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

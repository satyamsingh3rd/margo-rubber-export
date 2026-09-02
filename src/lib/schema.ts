import { SITE, type ContentStatus } from "@/content/site";
import { SITE_URL } from "./seo";
import type { ProductCategory } from "@/content/schemas";

/**
 * JSON-LD @graph builders.
 *
 * Only fields we can actually stand behind are emitted. Blocked values in
 * site.ts are `null` and are omitted rather than guessed — a schema field with
 * an invented value is worse than a missing one for AI entity resolution.
 *
 * NEVER emit aggregateRating/review. That is the Asian Sealing / ARPL pattern
 * the research explicitly bans.
 */

type Node = Record<string, unknown>;

export function organizationNode(): Node {
  const node: Node = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.legalName,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      ...(SITE.streetAddress ? { streetAddress: SITE.streetAddress } : {}),
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "ISO 9001:2015",
    },
    makesOffer: {
      "@type": "Offer",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: SITE.moq.value,
        unitText: `${SITE.moq.unit} (MOQ)`,
      },
    },
  };
  if (SITE.foundingYear) node.foundingDate = String(SITE.foundingYear);
  if (SITE.email) node.email = SITE.email;
  if (SITE.phone) node.telephone = SITE.phone;
  return node;
}

export function breadcrumbNode(
  crumbs: { name: string; path: string }[],
): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function faqNode(faqs: { q: string; a: string }[]): Node | null {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function productNode(fm: ProductCategory, path: string): Node {
  const materials = fm.materialSection?.items.map((m) => m.name) ?? [];

  return {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: fm.h1,
    description: fm.seo.description,
    ...(materials.length ? { material: materials } : {}),
    brand: { "@id": `${SITE_URL}/#organization` },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Minimum Order Quantity",
        value: `${SITE.moq.value} ${SITE.moq.unit}`,
      },
      {
        "@type": "PropertyValue",
        name: "Monthly Capacity",
        value: `${SITE.capacity.monthly.toLocaleString("en-GB")} pieces`,
      },
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      areaServed: [...SITE.exportMarkets],
    },
  };
}

/** The site itself. One node, emitted once, on the homepage only. */
export function webSiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE.legalName,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    // No SearchAction: there is no site search, and declaring one that does
    // not exist is a broken promise Google can act on.
  };
}

/**
 * A single named part. Narrower than the category Product above — a SKU is a
 * specific item, so it gets `isSimilarTo` back to its category rather than
 * duplicating the category's claims.
 */
export function skuNode(
  fm: { h1: string; seo: { description: string }; productCode?: string },
  path: string,
  categoryPath: string,
): Node {
  return {
    "@type": "Product",
    "@id": `${SITE_URL}${path}#product`,
    name: fm.h1,
    description: fm.seo.description,
    ...(fm.productCode ? { sku: fm.productCode, mpn: fm.productCode } : {}),
    brand: { "@id": `${SITE_URL}/#organization` },
    isSimilarTo: { "@id": `${SITE_URL}${categoryPath}#product` },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      areaServed: [...SITE.exportMarkets],
    },
  };
}

/** A guide or article. Author is the organisation — these are not bylined. */
export function articleNode(
  fm: { h1: string; seo: { description: string } },
  path: string,
): Node {
  return {
    "@type": "TechArticle",
    "@id": `${SITE_URL}${path}#article`,
    headline: fm.h1,
    description: fm.seo.description,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    // No datePublished: nothing in the content records one, and a date that
    // is really "when the build ran" is worse than none.
  };
}

/** A hub listing its children, in the order the page shows them. */
export function itemListNode(
  items: { name: string; path: string }[],
  path: string,
): Node | null {
  if (!items.length) return null;
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}${path}#list`,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}${it.path}`,
    })),
  };
}

/**
 * The general page graph.
 *
 * Every route composes from this rather than hand-assembling nodes, so the
 * Organization node is identical everywhere and the @id references between
 * nodes actually resolve. `type` picks the page-level node; everything else
 * is opt-in.
 */
export function pageGraph(opts: {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  path: string;
  name: string;
  description: string;
  crumbs?: { name: string; path: string }[];
  faqs?: { q: string; a: string }[];
  extra?: (Node | null)[];
  /** The homepage, and only the homepage, declares the WebSite node. */
  isHome?: boolean;
}) {
  const nodes: Node[] = [organizationNode()];
  if (opts.isHome) nodes.push(webSiteNode());

  nodes.push({
    "@type": opts.type ?? "WebPage",
    "@id": `${SITE_URL}${opts.path}#page`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  });

  if (opts.crumbs?.length) nodes.push(breadcrumbNode(opts.crumbs));
  if (opts.faqs?.length) {
    const faq = faqNode(opts.faqs);
    if (faq) nodes.push(faq);
  }
  for (const n of opts.extra ?? []) if (n) nodes.push(n);

  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Assembles the full @graph for a product category page. */
export function productCategoryGraph(fm: ProductCategory, path: string) {
  const nodes: Node[] = [organizationNode()];

  if (fm.schemaTypes.includes("BreadcrumbList")) {
    nodes.push(
      breadcrumbNode([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: fm.navLabel, path },
      ]),
    );
  }
  if (fm.schemaTypes.includes("Product")) nodes.push(productNode(fm, path));
  if (fm.schemaTypes.includes("FAQPage")) {
    const faq = faqNode(fm.faqs);
    if (faq) nodes.push(faq);
  }

  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Placeholder pages must not emit schema — it would assert fake data. */
export function shouldEmitSchema(status: ContentStatus) {
  return status === "published";
}

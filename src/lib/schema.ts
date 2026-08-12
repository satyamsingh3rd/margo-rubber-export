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
        value: `${SITE.capacity.monthly.toLocaleString("en-IN")} pieces`,
      },
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      areaServed: [...SITE.exportMarkets],
    },
  };
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

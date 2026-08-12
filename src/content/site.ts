/**
 * FACTS REGISTRY — the single source of truth for every hard number,
 * name and claim on the site.
 *
 * RULES
 *  1. No page, component or MDX file may hardcode any value that lives here.
 *  2. `null` means BLOCKED — awaiting a written answer from Margo. Templates
 *     must render nothing (or a build warning) rather than guess.
 *  3. Anything in FORBIDDEN_CLAIMS fails the build if found in content.
 *
 * Blocker IDs (B4, B5…) map to §11 of 16_Development_Implementation_Plan.md.
 */

export const SITE = {
  legalName: "Margo Rubber Products",
  shortName: "Margo",

  /** B4 — 1997 (old site) / 2005 (IndiaMART) / 2008 (LinkedIn).
   *  Working answer is 2005 (stated in Margo's own catalogue AND business
   *  proposal). Needs one line of written confirmation before it ships. */
  foundingYear: null as number | null,

  /** B5 — catalogue says "B-12, MIDC, Ambad, Nashik-422010";
   *  business proposal says "SRNO.4494/10, Vilholi, Nashik-422010".
   *  Old plant vs new? Pick ONE before anything NAP-facing ships. */
  streetAddress: null as string | null,
  locality: "Nashik",
  region: "Maharashtra",
  postalCode: "422010", // confirmed in both catalogue and proposal
  country: "IN",

  /** B6 — three exist across Margo's docs: admin@ / rediffmail / info@.
   *  Recommendation: info@margorubber.in, retire rediffmail from public
   *  surfaces. Note the Figma contact page shows rfq@margorubber.COM — wrong TLD. */
  email: null as string | null,

  /** B7 — Mehboob Shaikh (Proprietor) vs Ayyaz Shaikh (Development Head).
   *  Proposal names Ayyaz as leading customer relations — default to Ayyaz. */
  rfqCatcher: null as string | null,

  phone: null as string | null,
  whatsapp: null as string | null,

  /** No competitor in the 11-site teardown states its hours next to its
   *  number. Stating them is a free differentiator. */
  hours: "Mon–Sat, 9:30–18:30 IST",

  /** ONLY this. Margo does NOT hold IATF 16949 — see FORBIDDEN_CLAIMS. */
  certifications: ["ISO 9001:2015"] as const,

  /** Usable verbatim as a roadmap statement (Margo's own words in the
   *  business proposal). Never as a certification claim. */
  iatfRoadmapStatement: "actively progressing toward IATF 16949:2016",

  /** Zero of 11 competitors state MOQ on-page. This is the single biggest
   *  unclaimed differentiator in the entire teardown. */
  moq: { value: 500, unit: "pieces per SKU" },
  sampleDevQty: { value: 50, unit: "pieces" },

  /** B10 — the proposal front page says "60M+/yr", but 5 lakh/month = 6M/yr
   *  and its own expansion section says 200K→500K/mo. Almost certainly a
   *  typo. NEVER publish 60M. */
  capacity: { monthly: 500_000, annual: 6_000_000 },

  /** Never promise faster. Margo has no dedicated inside-sales desk, and an
   *  unkeepable promise damages the brand more than no promise. */
  responsePromise: "1 business day (IST)",
  quoteTurnaround: "48 hours",
  sampleTurnaround: "2 weeks",

  /** 9 active markets. The Figma screens variously claim 25+/27+/30+/40+/
   *  50+/60+ countries — all placeholder drift. */
  exportMarkets: ["AU", "GB", "AE", "SA", "MY", "US", "SG", "KE", "TZ"] as const,
  incoterms: "FOB Mumbai / Nhava Sheva standard; CIF and DDP on request",

  /** Dimensional/measurement claims, published by Margo in the proposal. */
  tolerance: { measurement: "±0.01 mm" },

  /** Footer copyright. A literal, not `new Date()` — Next 16's cacheComponents
   *  rejects non-deterministic values during prerender, and a static site
   *  should not be re-rendering to tick a year over. Bump it each January. */
  copyrightYear: 2026,

  testStandards: [
    "ASTM D2240",
    "ASTM D412",
    "ASTM D395",
    "ASTM D297",
    "ASTM D573",
    "ISO 6502",
  ] as const,
} as const;

/**
 * B8 — the real client portfolio, from Margo's own business proposal.
 * PENDING USAGE PERMISSION — do not render until granted.
 * Victor Reinz and Samsonite are uncorroborated and have been dropped.
 * The Figma homepage logo strip (Bosch, Kirloskar, Atlas Copco, Grundfos,
 * KSB, Alfa Laval, Sulzer, Bonfiglioli, L&T, Thermax, Forbes) is NOT sourced
 * anywhere in the research and must not ship.
 */
export const CLIENTS_PENDING_PERMISSION = [
  "Mahindra & Mahindra",
  "IDEX Corporation",
  "Abhijeet Group",
  "Ukay Industries",
  "Satish Injecto Plast",
  "Mutual Industry",
  "Talco India",
] as const;

/**
 * B9 — Margo's own published 8-compound table (business proposal).
 * NOTE: FKM is +250 °C, superseding the 200 °C placeholder that still
 * appears on the Figma O-Rings material card.
 */
export const COMPOUNDS = [
  { code: "AEM", name: "Ethylene Acrylic", tempC: [-40, 175], note: "Signature compound, Mahindra-supplied" },
  { code: "FKM", name: "Fluoroelastomer (Viton)", tempC: [-20, 250], note: "Aggressive chemical environments" },
  { code: "Silicone", name: "Silicone (VMQ)", tempC: [-60, 220], note: "Widest service range" },
  { code: "EPDM", name: "Ethylene Propylene Diene", tempC: [-40, 140], note: "Weather & ozone resistant" },
  { code: "NBR", name: "Nitrile Butadiene", tempC: [-30, 120], note: "Oil & fuel resistant" },
  { code: "Neoprene", name: "Chloroprene (CR)", tempC: [-40, 120], note: "General purpose" },
  { code: "SBR", name: "Styrene Butadiene", tempC: [-30, 100], note: "Abrasion resistant" },
  { code: "NR", name: "Natural Rubber", tempC: [-20, 90], note: "High resilience" },
] as const;

/**
 * Strings that must never appear in shipped content. Enforced by
 * tests/forbidden-claims.test.ts — a match fails the build.
 */
export const FORBIDDEN_CLAIMS: { pattern: RegExp; why: string }[] = [
  { pattern: /IATF\s*16949(?!\s*:?\s*2016["']?\s*(roadmap)?)/i, why: "Margo holds ISO 9001:2015 only. Roadmap phrasing is allowed, a certification claim is not." },
  // The /why-margo design splits the standard across two YAML keys
  // (code: IATF / suffix: "16949"), so the joined pattern above walked past it.
  // Match the bare token too; there is no legitimate use of "IATF" on its own.
  { pattern: /\bIATF\b(?!\s*16949)/i, why: "Bare IATF token. Margo holds ISO 9001:2015 only; /certifications states plainly that IATF 16949 is NOT held." },
  { pattern: /\bCE\s*Mark(ed|ing)?\b/i, why: "CE marking is not held. The /why-margo design invents it." },
  { pattern: /RoHS\s*2\.0|REACH\s*SVHC/i, why: "Not certified to either. Compliance statements need Margo's written confirmation first." },
  { pattern: /NORSOK|API\s*6A/i, why: "Not certified. Only the mandatory non-claim sentence on /industries/oil-gas may mention these." },
  { pattern: /aggregateRating|ratingValue|verified orders/i, why: "Fabricated ratings — the Asian Sealing / ARPL pattern, explicitly banned." },
  { pattern: /Victor\s*Reinz|Samsonite/i, why: "Uncorroborated client logos — dropped." },
  { pattern: /\b60\s*(M|million)\s*\+?\s*(pcs|pieces)?\s*(\/|per)?\s*(yr|year)/i, why: "Capacity typo. Real figure is 6 million/year." },
  { pattern: /MOQ\s*:?\s*(?!500)\d+/i, why: "MOQ is 500 pieces per SKU. The Figma homepage/consultation panel shows 100." },
  { pattern: /\b(19\d{2}|20[0-4]\d)\b(?=[^\n]{0,40}(founded|established|since))/i, why: "Founding year is BLOCKED (B4) until confirmed in writing." },
  { pattern: /within\s+(24\s*hours|the\s+hour|minutes)|instant\s+(quote|response)/i, why: "Response promise is '1 business day (IST)'. Nothing faster." },
  { pattern: /NABL|AS9100|CEMILAC|ISO\s*13485|ISO\s*14001|ISO\s*45001|FDA[- ]approved/i, why: "Certifications Margo does not hold. The Figma about/why-choose-us screens invent several." },
  { pattern: /cutting[- ]edge|world[- ]class|industry[- ]leading/i, why: "Banned marketing register. Voice is factual-engineer." },
];

/** Placeholder-status helper — drives noindex + sitemap exclusion. */
export type ContentStatus = "placeholder" | "draft" | "published";

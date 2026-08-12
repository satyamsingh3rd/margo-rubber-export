/**
 * Site navigation and footer structure.
 *
 * Header nav is the blueprint spec (§5.6) plus Export, which the spec omitted.
 *
 * Footer labels come from the Figma design, but every href is checked against
 * a route that actually exists. `npm run check:links` fails the build if any
 * of them stops resolving. Two destinations are still unbuilt and expected:
 * /resources and /legal/*. "Careers" was dropped: no careers page is planned,
 * and aliasing it to /about misleads a job seeker.
 */

export const HEADER_NAV = [
  { label: "Products", href: "/products" },
  { label: "Industries", href: "/industries" },
  // Added on request. /export was previously reachable only from the footer
  // and one homepage card, which orphaned the site's largest content asset
  // (brief A18, 1,800-2,400 words, 8 anchored markets). The homepage Figma
  // header also carries an Export item, so this matches the design intent
  // even though the blueprint spec in §5.6 lists only six.
  { label: "Export", href: "/export" },
  { label: "Why Margo", href: "/why-margo" },
  // Same problem as /export: /case-studies had zero inbound links anywhere on
  // the site. The homepage Figma header carries a Case Studies item, so this
  // matches design intent.
  { label: "Case Studies", href: "/case-studies" },
  { label: "Resources", href: "/resources" },
  { label: "Certifications", href: "/certifications" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "PRODUCTS",
    links: [
      { label: "O-Rings & Seals", href: "/products/o-rings" },
      { label: "Rubber Gaskets", href: "/products/gaskets" },
      { label: "Molded Components", href: "/products" },
      { label: "Leak Test Rubber", href: "/products/leak-test-rubber" },
      { label: "Custom Solutions", href: "/products" },
    ],
  },
  {
    heading: "INDUSTRIES",
    links: [
      { label: "Automotive", href: "/industries/automotive" },
      { label: "Medical", href: "/industries/medical-devices" },
      { label: "Electrical", href: "/industries/electrical-electronics" },
      { label: "Pumping Systems", href: "/industries/pumps-valves" },
      { label: "Mining & Resources", href: "/industries/mining" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "About Margo", href: "/about" },
      { label: "Manufacturing", href: "/certifications#manufacturing" },
      { label: "Quality & Certs", href: "/certifications" },
      { label: "Export Markets", href: "/export" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  {
    heading: "SUPPORT",
    links: [
      { label: "Request Quote", href: "/contact" },
      { label: "Technical Specs", href: "/resources" },
      { label: "MSDS Sheets", href: "/resources" },
      { label: "Contact Us", href: "/contact" },
      { label: "Locate Us", href: "/contact" },
    ],
  },
] as const;

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Export Compliance", href: "/legal/export-compliance" },
] as const;

/**
 * Footer identity block. Copy is verbatim from the Figma design and
 * contradicts the research pack on three counts, all logged as blockers:
 *   · "since 1997"      → founding year is BLOCKED (B4), working answer 2005
 *   · "27+ countries"   → 9 active markets
 *   · admin@ email      → B6 recommends info@margorubber.in
 */
export const FOOTER_IDENTITY = {
  blurb:
    "Precision rubber manufacturing since 1997. ISO 9001:2015 certified. Exporting to 27+ countries.",
  address: "B-12, MIDC Ambad, Nashik, Maharashtra – 422010",
  phone: "+91 96655 79276",
  email: "admin@margorubber.in",
} as const;

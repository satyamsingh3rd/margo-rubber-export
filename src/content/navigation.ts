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

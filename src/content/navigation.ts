/**
 * Site navigation and footer structure.
 *
 * The header bar follows UI-changes2/header.pdf, which is the first comp to
 * draw the mega-dropdown. That comp also reshapes the bar itself: it adds Home
 * and Contact, and drops Why Margo, Resources and Certifications. Those three
 * pages are still built and still reachable — the footer's COMPANY column
 * carries all three — but nothing in the header points at them any more.
 *
 * Footer labels come from the Figma design, but every href is checked against
 * a route that actually exists. `npm run check:links` fails the build if any
 * of them stops resolving.
 */

/** Which mega-panel a nav item opens, if any. */
export type MenuKey = "products" | "industries";

export const HEADER_NAV = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products", menu: "products" as MenuKey },
  { label: "Industries", href: "/industries", menu: "industries" as MenuKey },
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Export", href: "/export" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * The Products mega-panel.
 *
 * Two shapes, because the comp draws two. The nine categories on the left are
 * leaves — they open their own page and have no children in the menu. The two
 * on the right are groups: they have a page of their own AND a named set of
 * sections beneath them.
 *
 * Group children point at anchors on the parent page rather than at routes of
 * their own. That matches the comps, where every profile and the foam tape
 * section are blocks on the category page, not separate pages. The link
 * checker strips the fragment before resolving, so these resolve to the
 * category route.
 */
export const PRODUCT_MENU = {
  categories: [
    { label: "O-Rings", href: "/products/o-rings" },
    { label: "Oil Seals", href: "/products/oil-seals" },
    { label: "Gaskets", href: "/products/gaskets" },
    { label: "Bellows", href: "/products/bellows" },
    { label: "Anti-Vibration Mounts", href: "/products/anti-vibration-mounts" },
    { label: "Grommets", href: "/products/grommets" },
    { label: "Bushes", href: "/products/bushes" },
    { label: "Pads, Stoppers & Caps", href: "/products/pads-stoppers-caps" },
    { label: "Leak Test Rubber", href: "/products/leak-test-rubber" },
  ],

  groups: [
    {
      label: "Extrusion Profiles",
      href: "/products/extrusion",
      // Ordered to fill a two-column grid row-wise, exactly as the comp reads:
      // D-section | P-seal, then T-profile | U-channel round, and so on.
      items: [
        { label: "D-section", href: "/products/extrusion#d-section" },
        { label: "P-seal", href: "/products/extrusion#p-seal" },
        { label: "T-profile", href: "/products/extrusion#t-profile" },
        { label: "U-channel round", href: "/products/extrusion#u-channel-round" },
        { label: "U-channel square", href: "/products/extrusion#u-channel-square" },
        { label: "Solid cord", href: "/products/extrusion#solid-cord" },
        { label: "Tubing", href: "/products/extrusion#tubing" },
        { label: "L/angle", href: "/products/extrusion#l-angle" },
      ],
    },
    {
      label: "Sponge & Foam Rubber",
      href: "/products/sponge-foam-rubber",
      items: [
        {
          label: "Self-Adhesive Foam Tape",
          href: "/products/sponge-foam-rubber#self-adhesive-foam-tape",
        },
      ],
    },
  ],
} as const;

/** The Industries mega-panel. One column, the nine sectors the site serves. */
export const INDUSTRY_MENU = [
  { label: "Mining", href: "/industries/mining" },
  { label: "Oil & Gas", href: "/industries/oil-gas" },
  { label: "Automotive", href: "/industries/automotive" },
  { label: "Pumps & Valves", href: "/industries/pumps-valves" },
  { label: "HVAC", href: "/industries/hvac" },
  { label: "Electrical & Electronics", href: "/industries/electrical-electronics" },
  { label: "Agriculture", href: "/industries/agriculture" },
  { label: "Medical Devices", href: "/industries/medical-devices" },
  { label: "Water & Fluid Management", href: "/industries/water-fluid-management" },
] as const;

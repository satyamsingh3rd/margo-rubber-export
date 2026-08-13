/**
 * IMAGE REGISTRY — the ONLY place an image file path appears.
 *
 * Content files and components reference a KEY. Swapping an image later is a
 * one-line change here; no page, component or MDX file is touched.
 *
 *  - `w`/`h` are required → CLS is structurally impossible.
 *  - `alt` is required    → the alt-text SEO/a11y gate is satisfied by the type
 *                           system, not by remembering.
 *  - `status` tracks what is still stock placeholder vs. real Margo photography.
 *
 * Current images are DECORATIVE STOCK from the Figma file — several depict
 * nothing to do with rubber components. Real photography is a pending SHOOT
 * category in 15_Preproduction_Checklist.html, organised by subject, which
 * maps almost 1:1 onto these keys.
 */

export type ImageEntry = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** 'svg' bypasses next/image and imports as a component. */
  kind?: "raster" | "svg";
  status: "placeholder" | "final";
};

/**
 * ── MISSING ASSETS ────────────────────────────────────────────────────
 * None currently. Add the file to public/images/<page>/, then add its key
 * below. Keep this block up to date — it is the running list of what the
 * design needs that we do not yet have.
 * ──────────────────────────────────────────────────────────────────────
 */

export const IMAGES = {
  /* --- Brand -----------------------------------------------------------
     Sourced from the 295x276 lockup in Images/about us/, which is far cleaner
     than the 48px header crop used earlier: the mark comes through WITHOUT the
     white box frame, matching the supplied logo. Still raster, so an SVG is
     preferred. Blocker B11 still applies for light backgrounds: the mark's
     white strokes vanish on white. */
  "brand.mark": {
    src: "/images/brand/margo-mark.png",
    w: 528,
    h: 528,
    alt: "",
    status: "placeholder",
  },
  "brand.logo": {
    src: "/images/brand/margo-logo.png",
    w: 303,
    h: 265,
    alt: "Margo Rubber Products",
    status: "placeholder",
  },

  /* --- Products: O-Rings category ------------------------------------ */
  "products.o-rings.hero": {
    src: "/images/products-category/b5055d3713fe47c212af01797a415dd08bf49102.jpg",
    w: 1800,
    h: 1200,
    alt: "Sweeping folds of dark moulded rubber",
    status: "placeholder",
  },
  "products.material.fkm": {
    src: "/images/products-category/e7261bcef11d425da03cc396a9380a40a734352d.png",
    w: 600,
    h: 400,
    alt: "FKM (Viton) sealing components in an assembled mechanical drive",
    status: "placeholder",
  },
  "products.material.nbr": {
    src: "/images/products-category/2f17f6aa8aaabf127e5bb87058dc7e63b345a62a.png",
    w: 600,
    h: 400,
    alt: "Coiled black nitrile rubber profile",
    status: "placeholder",
  },
  "products.material.epdm": {
    src: "/images/products-category/d7bde97b0771dcfebef40dd17fb85dd96347efea.png",
    w: 600,
    h: 400,
    alt: "Production line assembling moulded rubber components",
    status: "placeholder",
  },
  "products.material.silicone": {
    src: "/images/products-category/ff30392082191f2d632b4ed7a40a4fedf596a14e.png",
    w: 600,
    h: 400,
    alt: "Industrial rubber manufacturing floor during production",
    status: "placeholder",
  },

  /* --- Products hub: the nine category cards (800×900) ---------------- */
  "products.card.o-rings": {
    src: "/images/products/02c119a1180fdfe14c8f924ae98fb0884999f496.png",
    w: 800,
    h: 900,
    alt: "Custom O-rings in FKM, NBR, EPDM and silicone",
    status: "placeholder",
  },
  "products.card.oil-seals": {
    src: "/images/products/446414d85bfd92e3fcd4ae2b640c6d81e9629b91.png",
    w: 800,
    h: 900,
    alt: "Rotary oil seals for gearboxes and pumps",
    status: "placeholder",
  },
  "products.card.gaskets": {
    src: "/images/products/4c6677128b58b94c724e7539dd343714f110a975.png",
    w: 800,
    h: 900,
    alt: "Moulded and die-cut rubber gaskets for flanged joints",
    status: "placeholder",
  },
  "products.card.bellows": {
    src: "/images/products/4fb48cf2a43d61bec568791c2d5dbea12013f92b.png",
    w: 800,
    h: 900,
    alt: "Rubber bellows and protective boots",
    status: "placeholder",
  },
  "products.card.anti-vibration-mounts": {
    src: "/images/products/75ab01fa5d31999b511f4e67578971b96eddcb11.png",
    w: 800,
    h: 900,
    alt: "Rubber-to-metal bonded anti-vibration mounts",
    status: "placeholder",
  },
  "products.card.grommets": {
    src: "/images/products/93f522e98c504f8c1e2d5f6a4de1b41ea32d6a8c.png",
    w: 800,
    h: 900,
    alt: "Rubber grommets for cable and panel pass-throughs",
    status: "placeholder",
  },
  "products.card.bushes": {
    src: "/images/products/9f2968d4dfd6f2ed9996b7fd692ccf32360ae269.png",
    w: 800,
    h: 900,
    alt: "Rubber bushes and bushings for suspension and mounting",
    status: "placeholder",
  },
  "products.card.pads-stoppers-caps": {
    src: "/images/products/aea163e6d5b7af55e715b43d25d1f381505ab88a.png",
    w: 800,
    h: 900,
    alt: "Rubber pads, stoppers and protective caps",
    status: "placeholder",
  },
  "products.card.leak-test-rubber": {
    src: "/images/products/f0cbf4be4c181a6af58d3d24a36cb41938ac4689.png",
    w: 800,
    h: 900,
    alt: "Leak-test rubber for alloy-wheel pressure testing",
    status: "placeholder",
  },

  "products.hero": {
    src: "/images/products/e0d3b61aaf8e1dc5b62852ca1532a354cdd9ab6d.jpg",
    w: 1800,
    h: 1000,
    alt: "Interior of a heavy industrial manufacturing plant",
    status: "placeholder",
  },
  "products.excellence": {
    src: "/images/products/b14698d80519a6f61c9afed983aee3176ba3e8dd.png",
    w: 800,
    h: 600,
    alt: "Operators working a compression press on the Nashik production floor",
    status: "placeholder",
  },

  "industries.hero": {
    src: "/images/industries/industries-hero.jpg",
    w: 2000,
    h: 1200,
    alt: "Interior of a large manufacturing hall with rows of machinery",
    status: "placeholder",
  },

  /* --- Industry / sector photography (800×560) ------------------------ */
  "industries.automotive": {
    src: "/images/industries/ef9b0fcea22b06954dcd3d147d4e70b3a4ee7463.png",
    w: 800, h: 560,
    alt: "Robotic automotive body assembly line",
    status: "placeholder",
  },
  "industries.oil-gas": {
    src: "/images/industries/585674e23c667606a0041e38d48fbbc07ca83204.png",
    w: 800, h: 560,
    alt: "Offshore oil and gas platform at sunset",
    status: "placeholder",
  },
  "industries.mining": {
    src: "/images/industries/815cceecbc7e146feb8e36383209151c6a7b31f6.png",
    w: 800, h: 560,
    alt: "Haul trucks and excavators in an open-pit mine",
    status: "placeholder",
  },
  "industries.pumps-valves": {
    src: "/images/industries/421c154cfdc2c9aa18ab2918ef9efb1184cb60bc.png",
    w: 800, h: 560,
    alt: "Industrial pump housings in a process plant",
    status: "placeholder",
  },
  "industries.hvac": {
    src: "/images/industries/43b1dcb1e3e1692fc39a3a141bd8d408ee28b984.png",
    w: 800, h: 560,
    alt: "Rooftop HVAC condenser units and pipework",
    status: "placeholder",
  },
  "industries.electrical-electronics": {
    src: "/images/industries/3a827cca46f2ae89cdeca92efc05965d64d9520f.png",
    w: 800, h: 560,
    alt: "Printed circuit board detail",
    status: "placeholder",
  },
  "industries.agriculture": {
    src: "/images/industries/8bf6d91e2004803ae4f15901b0ef909853be3e6a.png",
    w: 800, h: 560,
    alt: "Tractor working a field at dusk",
    status: "placeholder",
  },
  "industries.medical-devices": {
    src: "/images/industries/be6a1db6c73766bcc4a639616b812d3b543c02e6.png",
    w: 800, h: 560,
    alt: "Laboratory pipetting into sample vials",
    status: "placeholder",
  },
  "industries.water-fluid-management": {
    src: "/images/industries/a3ebd35d30ff2200c507e4cce2b2826ecf9c91a8.png",
    w: 800, h: 560,
    alt: "Valve manifold and pipework on a treatment skid",
    status: "placeholder",
  },

  /* --- Mining industry detail page ------------------------------------ */
  /* Extracted from industries-mining.png: the design fades the photo to black
     across the top ~310px. It is therefore ALREADY faded in the source, so the
     component brightens it and applies only a light scrim. Replace with the
     full-resolution original when supplied. */
  "industries.mining.hero": {
    src: "/images/industries-mining/mining-hero.jpg",
    w: 1400,
    h: 420,
    alt: "Open-pit mine with conveyor and haul roads",
    status: "placeholder",
  },
  "industries.mining.component": {
    src: "/images/industries-mining/e7261bcef11d425da03cc396a9380a40a734352d.png",
    w: 600, h: 400,
    alt: "Rubber-to-metal bonded mounts on assembled machinery",
    status: "placeholder",
  },
  "industries.mining.use.conveyor": {
    src: "/images/industries-mining/8912e946fb2b7ef398ba66386c814245a973a3ba.png",
    w: 500, h: 320,
    alt: "Conveyor belt carrying ore across a mine site",
    status: "placeholder",
  },
  "industries.mining.use.crushers": {
    src: "/images/industries-mining/f56d36a67e8fd014baa2f82a4e66fedaa4bf66e6.png",
    w: 500, h: 320,
    alt: "Excavator working a terraced open-pit bench",
    status: "placeholder",
  },
  "industries.mining.use.haul": {
    src: "/images/industries-mining/ecd12ac69ab9eaf56d361a625d43fa7e9b3ae82d.png",
    w: 500, h: 320,
    alt: "Haul trucks operating in an open-pit mine",
    status: "placeholder",
  },
  "industries.mining.use.hydraulic": {
    src: "/images/industries-mining/390280bf1b110793813eb924d8642215678aa078.png",
    w: 500, h: 320,
    alt: "Hydraulic lines on an industrial production line",
    status: "placeholder",
  },
  "industries.mining.facility": {
    src: "/images/industries-mining/8f478e737375813fdb3396476d6ace2563de2c9f.png",
    w: 700, h: 520,
    alt: "Margo production line at the Nashik facility",
    status: "placeholder",
  },

  /* --- Contact --------------------------------------------------------- */
  "contact.hero": {
    src: "/images/contact/0d423de901bffb06f69b1e44c1fef77e980a8876.jpg",
    w: 1920,
    h: 1080,
    alt: "Welder working on a component, sparks visible",
    status: "placeholder",
  },

  /* --- Certifications ------------------------------------------------- */
  "certifications.facility.press-wide": {
    src: "/images/certifications/30762e5cda42ef64cdc538710fb78406b1f30d09.png",
    w: 800, h: 600,
    alt: "Operator working a compression press on the Nashik floor",
    status: "placeholder",
  },
  "certifications.facility.press-close": {
    src: "/images/certifications/7fd0302833ac7d23c718ff6ff8e1022aaa40bafa.png",
    w: 800, h: 600,
    alt: "Workers operating heavy machinery on the production floor",
    status: "placeholder",
  },
  "certifications.facility.inspection": {
    src: "/images/certifications/cf68df8beea532026c3f12ce9f20465dd31e9e4f.png",
    w: 800, h: 600,
    alt: "Dimensional inspection at the QC workstation",
    status: "placeholder",
  },
  "certifications.facility.plant": {
    src: "/images/certifications/efbfef5dd384cbe6b7aae6c5ab7d59da5df85737.png",
    w: 800, h: 600,
    alt: "Process pipework and extrusion lines at the Nashik plant",
    status: "placeholder",
  },
  "certifications.iso-badge": {
    src: "/images/certifications/iso-9001-2015-badge.svg",
    w: 240,
    h: 240,
    alt: "ISO 9001:2015 certification badge",
    kind: "svg",
    status: "placeholder",
  },

  /* ── /about ──────────────────────────────────────────────────────────
     Every one of these is stock. The two portraits in particular must be
     replaced before launch: attaching a stock face to a named executive
     is a misrepresentation, so the page ships with role-only captions
     until Margo supplies real photography. See checklist item about-photos. */
  "about.hero": {
    src: "/images/about/3798ac3da876f78b65b2d44688050da2955e8d39.jpg",
    w: 2000, h: 1200,
    alt: "Wide view of the Margo Rubber Products production floor",
    status: "placeholder",
  },
  "about.story.plant": {
    src: "/images/about/200f507621dfa9d10259a1c042a7e0409cfdc5c4.png",
    w: 700, h: 520,
    alt: "Mixing and calendering machinery on the shop floor",
    status: "placeholder",
  },
  "about.story.gauge": {
    src: "/images/about/b8297aadf52f2e62454d88960e09e6c641fdf6e8.png",
    w: 300, h: 260,
    alt: "Operator checking a moulded part with a digital caliper",
    status: "placeholder",
  },
  "about.leadership": {
    src: "/images/about/d6c6dafd5f7e6fc35b02d70a6724d50fcc38e25e.png",
    w: 480, h: 580,
    alt: "Engineer inspecting a mould under work lighting",
    status: "placeholder",
  },
  "about.manufacturing.floor": {
    src: "/images/about/39792f06f998682ea06f21c231551c36f5ef12e7.png",
    w: 900, h: 580,
    alt: "Compression presses lined up across the moulding bay",
    status: "placeholder",
  },
  "about.manufacturing.press": {
    src: "/images/about/3a774ed6e2b6a01e0341ff19e7a48b3573322721.png",
    w: 500, h: 260,
    alt: "Operators loading a compression press",
    status: "placeholder",
  },
  "about.manufacturing.lab": {
    src: "/images/about/5d011e8f1b8e9a2c1ffc9b8873fdbe3792f99cb2.png",
    w: 500, h: 260,
    alt: "Technician examining a sample under a microscope in the test lab",
    status: "placeholder",
  },
  "about.portfolio": {
    src: "/images/about/7e7238ebfa42ca5def47fba863c87eabc6457ae9.png",
    w: 400, h: 340,
    alt: "Batch of finished moulded rubber rings",
    status: "placeholder",
  },
  "about.team.lab": {
    src: "/images/about/fbe22a16b1a0e063f55fac832b04a4fee8d789cb.png",
    w: 480, h: 580,
    alt: "Quality technicians at the test bench",
    status: "placeholder",
  },
  "about.team.portrait-a": {
    src: "/images/about/36dddc9e1436f8079d6dadfde3d4f838e2a0def2.png",
    w: 480, h: 580,
    alt: "Placeholder portrait, to be replaced with the real team photograph",
    status: "placeholder",
  },
  "about.team.portrait-b": {
    src: "/images/about/f673ef5e26cd807812649e1057fe6c3732e20391.png",
    w: 900, h: 800,
    alt: "Placeholder portrait, to be replaced with the real team photograph",
    status: "placeholder",
  },
  "about.presence": {
    src: "/images/about/08ccb1822c58b0e1ccf8b04752ffc0e376945750.png",
    w: 750, h: 520,
    alt: "Aerial view of stacked shipping containers at an export terminal",
    status: "placeholder",
  },
  "about.green": {
    src: "/images/about/3e7bec0c9f3cd5eee760f9d3a4765d4d4960192a.png",
    w: 750, h: 520,
    alt: "Wind turbines above open farmland",
    status: "placeholder",
  },

  /* ── / (homepage) ────────────────────────────────────────────────────
     All stock. The six portfolio cards reuse the design's own crops so the
     card art stays in the order the comp sets. */
  "home.story": {
    src: "/images/home/9bdb88cbf9df2a3ece934ab581cd22671ca697d9.png",
    w: 800, h: 600,
    alt: "The Margo Rubber Products shop floor at MIDC Ambad, Nashik",
    status: "placeholder",
  },
  "home.facility": {
    src: "/images/home/e1c7a11041eaed2b9d0a9649cc84dbe535258a6f.png",
    w: 1200, h: 800,
    alt: "Production bay with compression presses and stock material",
    status: "placeholder",
  },
  "home.contact": {
    src: "/images/home/6c68ee445947ec7f383cd0439109cb62fbc1bb68.png",
    w: 800, h: 1000,
    alt: "Operators packing finished components for export dispatch",
    status: "placeholder",
  },
  "home.product.o-rings": {
    src: "/images/home/45b2f14ecef0d29f3a6668bbcc0e3e0c8814f066.png",
    w: 600, h: 340,
    alt: "Calendered rubber stock on the mill",
    status: "placeholder",
  },
  "home.product.gaskets": {
    src: "/images/home/c55bb2d85780bee06d8bfafcf4f6d0dc5b8be3ff.png",
    w: 600, h: 340,
    alt: "Close view of a moulded rubber component",
    status: "placeholder",
  },
  "home.product.moulded": {
    src: "/images/home/ac21c1e8b9e8321200cf4973c54de95bfcbc5228.png",
    w: 600, h: 340,
    alt: "Overhead gantry above the moulding bay",
    status: "placeholder",
  },
  "home.product.sheets": {
    src: "/images/home/de306a9160ef2bba3abd07c0ac6d77f0d077cecf.png",
    w: 600, h: 340,
    alt: "Rolled rubber sheet stock in the works",
    status: "placeholder",
  },
  "home.product.extruded": {
    src: "/images/home/950e8ff579b84c9c422d54723ce41b49e95e2ee3.png",
    w: 600, h: 340,
    alt: "Extrusion line pipework and ducting",
    status: "placeholder",
  },
  "home.product.custom": {
    src: "/images/home/cd8b948d88912933d9e0c8a7432de78636c70800.png",
    w: 600, h: 340,
    alt: "Assembly and finishing stations under white partitions",
    status: "placeholder",
  },

  /* ── /why-margo ──────────────────────────────────────────────────────
     All stock. The export band reuses about.presence rather than adding a
     seventh near-identical container shot. */
  "why.hero": {
    src: "/images/why-margo/c49f9d96443843ae62a37ed10ac28d0ce7447b9e.jpg",
    w: 1920, h: 1080,
    alt: "Process pipework and machinery across a manufacturing hall",
    status: "placeholder",
  },
  "why.heritage": {
    src: "/images/why-margo/adf959e07936fb5f4bce323db8f26de01a831a3e.png",
    w: 900, h: 600,
    alt: "Long production bay with moulding machinery in service",
    status: "placeholder",
  },
  "why.manufacturing": {
    src: "/images/why-margo/4b0f590fdec50c3db2aacc467c9392873d42376a.png",
    w: 1600, h: 600,
    alt: "Robotic handling arms on an automated production cell",
    status: "placeholder",
  },
  "why.quality": {
    src: "/images/why-margo/16a166a740e41645c5519b72c9d971b3f0d8cb4f.png",
    w: 800, h: 600,
    alt: "Microscope on the quality control laboratory bench",
    status: "placeholder",
  },
  "why.support": {
    src: "/images/why-margo/dc2081305a354358c516cebae6bccdac91133eb2.png",
    w: 800, h: 1000,
    alt: "Engineer in high-visibility gear inspecting an installation",
    status: "placeholder",
  },

  /* ── /export ─────────────────────────────────────────────────────────
     Five plates for eight markets: the comp reuses the ship and pallet
     shots across paired regions, and so do we. */
  "export.containers": {
    src: "/images/export/0a53228982cdb3473b5d4587c251f02f50b71367.png",
    w: 1200, h: 700,
    alt: "Stacked shipping containers seen from below",
    status: "placeholder",
  },
  "export.warehouse": {
    src: "/images/export/1a18e551df947879d77fea8ab401c270f041ebcd.png",
    w: 1200, h: 700,
    alt: "Forklift moving palletised goods in a distribution warehouse",
    status: "placeholder",
  },
  "export.gantry": {
    src: "/images/export/32c40b13bb1c3081339aceb730c7c031e04ad922.png",
    w: 1200, h: 700,
    alt: "Container vessel under quayside gantry cranes",
    status: "placeholder",
  },
  "export.vessel": {
    src: "/images/export/467089438ce4c9529f1e433887979c80af2ed5c5.png",
    w: 1200, h: 700,
    alt: "Loaded container vessel alongside a container terminal",
    status: "placeholder",
  },
  "export.pallets": {
    src: "/images/export/ae164d282b0b3051bd2207ab4b02699c424b9d46.png",
    w: 1200, h: 700,
    alt: "Stack of heat-treated wooden export pallets",
    status: "placeholder",
  },

  /* ── /case-studies ───────────────────────────────────────────────────── */
  "case-studies.hero": {
    src: "/images/case-studies/a28e53ff97d42482aa7288fa2f136df7c4921cbc.png",
    w: 1200, h: 800,
    alt: "Operators working a compression press on the Nashik production floor",
    status: "placeholder",
  },

  /* ── SKU detail pages ────────────────────────────────────────────────
     The three plates supplied with `single category.png`. They stand in for
     per-part photography across every SKU until Margo shoots the real parts,
     which is why they are shared rather than keyed per product. */
  "sku.product": {
    src: "/images/skus/77c79999d2988d3c3a879a7b62dff88f5e778975.png",
    w: 800, h: 600,
    alt: "Moulded rubber components photographed against a neutral backdrop",
    status: "placeholder",
  },
  "sku.machining": {
    src: "/images/skus/c35420853d8134a2dfd995d00337f53a5bab2b21.png",
    w: 500, h: 400,
    alt: "Operator setting up a machining pass on the shop floor",
    status: "placeholder",
  },
  "sku.finishing": {
    src: "/images/skus/d155b80b89739452527187ec53e6ab7c35e952b3.png",
    w: 800, h: 600,
    alt: "Grinding and finishing work throwing sparks in the workshop",
    status: "placeholder",
  },
} as const satisfies Record<string, ImageEntry>;

export type ImageKey = keyof typeof IMAGES;

/** Throws at build time on an unknown key — a typo can never reach production. */
export function getImage(key: string): ImageEntry {
  const entry = (IMAGES as Record<string, ImageEntry>)[key];
  if (!entry) {
    throw new Error(
      `[images] Unknown image key "${key}". Add it to src/content/images.ts.`,
    );
  }
  return entry;
}

/** Used by the build report to count what is still stock photography. */
export function placeholderImageCount(): number {
  return Object.values(IMAGES as Record<string, ImageEntry>).filter(
    (i) => i.status === "placeholder",
  ).length;
}

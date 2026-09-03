import { createClient } from "@sanity/client";
import { getAllSlugs } from "../src/lib/content.ts";
import { COLLECTIONS_FOR_PAGES } from "../src/lib/page-types.ts";
import { stripNullsDeep } from "../src/content/blocks.ts";
import { groq } from "next-sanity";
import fs from "node:fs";
import {
  validateCategoryDocument,
  validateIndustryDocument,
  validateSkuDocument,
  validateResourceDocument,
  validateLegalDocument,
} from "../src/lib/cms-validate.ts";
import {
  productCategoryBySlugQuery,
  industryBySlugQuery,
  skuBySlugQuery,
  resourceBySlugQuery,
  legalBySlugQuery,
} from "../sanity/queries.ts";

/**
 * IS EACH PAGE ACTUALLY BEING SERVED FROM THE CMS?
 *
 * The check that should have existed before the first migration.
 *
 * Comparing rendered HTML against a baseline proves a page is CORRECT. It
 * cannot prove where the page came from, because the whole design of the
 * fallback is that a page served from its .mdx file looks exactly like one
 * served from Sanity. A document that fails validation therefore produces a
 * perfect-looking result and a line in a log nobody reads.
 *
 * That is not hypothetical: the industry document type shipped without `h1`,
 * every one of the nine documents failed validation, all nine pages fell back
 * to their files, and the HTML comparison reported success.
 *
 * So this asserts the SOURCE, using the same validator the server uses:
 *
 *   MIGRATED   — a document exists and validates. The page comes from Sanity.
 *   FALLING BACK — a document exists but does NOT validate. The page still
 *                works, from its .mdx file, and the CMS edit does nothing.
 *                This is the failure that hides.
 *   not migrated — no document. Expected until that page is migrated.
 */

const client = createClient({
  projectId: "jyg2beas",
  dataset: "production",
  apiVersion: "2026-08-01",
  useCdn: false,
  perspective: "published",
});

const COLLECTIONS = [
  {
    name: "products" as const,
    query: productCategoryBySlugQuery,
    validate: validateCategoryDocument,
  },
  {
    name: "industries" as const,
    query: industryBySlugQuery,
    validate: validateIndustryDocument,
  },
  {
    name: "skus" as const,
    query: skuBySlugQuery,
    validate: validateSkuDocument,
  },
  {
    name: "resources" as const,
    query: resourceBySlugQuery,
    validate: validateResourceDocument,
  },
  /**
   * Legal was the spike that proved this whole pattern and was then left out
   * of this check for the rest of the migration. It reported "0 falling back"
   * while all four legal pages were doing exactly that — a check with a hole
   * in it is worse than no check, because it is believed.
   */
  {
    name: "legal" as const,
    query: legalBySlugQuery,
    validate: validateLegalDocument,
  },
];

let migrated = 0;
let fallingBack = 0;
let notMigrated = 0;

for (const c of COLLECTIONS) {
  console.log(`\n${c.name}`);

  for (const slug of getAllSlugs(c.name)) {
    const raw = await client.fetch(c.query, { slug });

    if (!raw) {
      notMigrated++;
      console.log(`  ·  ${slug} — not migrated (serving .mdx, as expected)`);
      continue;
    }

    const result = c.validate(raw, slug);

    if (!result.ok) {
      fallingBack++;
      console.error(`  ✖  ${slug} — FALLING BACK. Document exists but is invalid:`);
      for (const issue of result.issues) console.error(`       ${issue}`);
      continue;
    }

    if (result.blockErrors.length > 0) {
      fallingBack++;
      console.error(`  ✖  ${slug} — document valid but ${result.blockErrors.length} block(s) dropped:`);
      for (const e of result.blockErrors) console.error(`       ${e}`);
      continue;
    }

    migrated++;
    console.log(
      result.blocks.length > 0
        ? `  ✓  ${slug} — from Sanity, ${result.blocks.length} blocks`
        : result.written === undefined
          ? `  ✓  ${slug} — from Sanity (fixed structure)`
          : `  ✓  ${slug} — from Sanity (${result.written ? "written" : "body not written yet"})`,
    );
  }
}

/**
 * The one-off marketing pages, checked the same way.
 *
 * They have no shared schema, so the slug → schema map is imported rather than
 * repeated — the same map the migration writer uses, so a page cannot be
 * written against one schema and checked against another.
 */
const pageQuery = groq`*[_type == $type && slug.current == $slug][0]{..., "slug": slug.current}`;

console.log("\nmarketing pages");

for (const [slug, entry] of Object.entries(COLLECTIONS_FOR_PAGES)) {
  const raw = await client.fetch(pageQuery, { type: entry.type, slug });

  if (!raw) {
    notMigrated++;
    console.log(`  ·  ${slug} — not migrated (serving .mdx, as expected)`);
    continue;
  }

  const parsed = entry.schema.safeParse(stripNullsDeep(raw));
  if (!parsed.success) {
    fallingBack++;
    console.error(`  ✖  ${slug} — FALLING BACK. Document exists but is invalid:`);
    for (const i of parsed.error.issues) {
      console.error(`       ${i.path.join(".") || "(root)"}: ${i.message}`);
    }
    continue;
  }

  migrated++;
  console.log(`  ✓  ${slug} — from Sanity (fixed structure)`);
}

/**
 * IS THE ROUTE ACTUALLY USING THE SEAM?
 *
 * The gap everything above is blind to. A document can exist and validate —
 * reported here as "from Sanity" — while the route that renders the page still
 * calls `getPage` or `getContent` and reads the .mdx file. Every check passes
 * and the CMS does nothing.
 *
 * That happened on the products hub: the document migrated and validated, but
 * the route loaded its content through `getContent("pages", "products")` and
 * never touched Sanity. Nothing caught it except reading the file.
 *
 * So for each migrated marketing page, confirm its route imports the seam.
 */
const ROUTE_FOR: Record<string, string> = {
  resources: "src/app/(site)/resources/page.tsx",
  industries: "src/app/(site)/industries/page.tsx",
  contact: "src/app/(site)/contact/page.tsx",
  "thank-you": "src/app/(site)/thank-you/page.tsx",
  "not-found": "src/app/(site)/not-found.tsx",
  certifications: "src/app/(site)/certifications/page.tsx",
  "case-studies": "src/app/(site)/case-studies/page.tsx",
  export: "src/app/(site)/export/page.tsx",
  products: "src/app/(site)/products/page.tsx",
  about: "src/app/(site)/about/page.tsx",
  "why-margo": "src/app/(site)/why-margo/page.tsx",
  home: "src/app/(site)/page.tsx",
  footer: "src/components/nav/SiteFooter.tsx",
};

console.log("\nroutes wired to the seam");

let unwired = 0;
for (const [slug, route] of Object.entries(ROUTE_FOR)) {
  const migratedHere = slug in COLLECTIONS_FOR_PAGES;
  let src = "";
  try {
    src = fs.readFileSync(route, "utf8");
  } catch {
    console.log(`  ·  ${slug} — no route file at ${route}`);
    continue;
  }

  const wired = src.includes("getSitePage");

  if (wired) {
    console.log(`  ✓  ${slug}`);
  } else if (migratedHere) {
    unwired++;
    console.error(
      `  ✖  ${slug} — MIGRATED BUT NOT WIRED. ${route} still reads its .mdx file,\n` +
        `       so the Sanity document is ignored and every other check still passes.`,
    );
  } else {
    console.log(`  ·  ${slug} — not migrated yet, .mdx is correct`);
  }
}

console.log(
  `\n${migrated} from Sanity · ${notMigrated} still on .mdx · ${fallingBack} silently falling back` +
    (unwired > 0 ? ` · ${unwired} migrated but not wired` : ""),
);

if (fallingBack > 0) {
  console.error(
    "\nA page that falls back looks perfect and ignores every CMS edit. Fix the\n" +
      "validation errors above, then re-run the migration for those slugs.",
  );
}

process.exit(fallingBack === 0 && unwired === 0 ? 0 : 1);

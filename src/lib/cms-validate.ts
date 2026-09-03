import { parseBlocks, stripNullsDeep, type Block } from "../content/blocks.ts";
import {
  industrySchema,
  productCategorySchema,
  skuSchema,
  resourceSchema,
  legalSchema,
  type Industry,
  type ProductCategory,
  type Sku,
  type Resource,
  type Legal,
} from "../content/schemas/index.ts";

/**
 * VALIDATING A DOCUMENT THAT CAME OUT OF SANITY
 *
 * Pulled out of the source files so that a script can run exactly what the
 * server runs. That is the entire point of this module, and it exists because
 * of a bug that hid behind a passing test.
 *
 * WHAT HAPPENED. The industry document type was built without `h1` — the flat
 * heading the structured data uses, as distinct from the `h1Lines` the hero
 * draws. Every industry document therefore failed validation, `fromSanity`
 * returned null, and the seam fell back to the .mdx file. The pages rendered
 * byte-identically to their baseline, so the check said they were fine. They
 * were fine; they just weren't coming from the CMS.
 *
 * The lesson is about the test, not the schema: comparing OUTPUT cannot
 * distinguish "the CMS works" from "the CMS failed and the fallback saved us",
 * because a correct fallback produces identical output by design. The source
 * has to be asserted directly, so `npm run check:cms` does that — and it can
 * only be trusted if it runs the same code the server does, hence this file.
 *
 * Nothing here touches the network or `next/cache`, so it is importable from a
 * plain node script.
 */

/**
 * Section fields that have become blocks.
 *
 * Omitted before validating the document, because they are validated per
 * block instead — which yields "block 3 (block.specTable): rows…" rather than
 * one opaque failure for the whole page.
 */
const CATEGORY_SECTION_FIELDS = {
  specSection: true,
  materialSection: true,
  standardsSection: true,
  qualitySection: true,
  commercialSection: true,
  profileSection: true,
  processSection: true,
  specifySection: true,
  sectorsSection: true,
  compareSection: true,
  compoundSection: true,
  densitySection: true,
  subCategorySection: true,
  applicationsSection: true,
  cta: true,
} as const;

const INDUSTRY_SECTION_FIELDS = {
  components: true,
  applications: true,
  conditions: true,
  custom: true,
  quality: true,
  exportLane: true,
  closing: true,
  faqSection: true,
} as const;

export type Validated<T> =
  | {
      ok: true;
      frontmatter: T;
      blocks: Block[];
      blockErrors: string[];
      /** Guides only: whether the article body has actually been written. */
      written?: boolean;
    }
  | { ok: false; issues: string[] };

function validate<T>(
  raw: unknown,
  schema: { omit: (f: object) => { safeParse: (v: unknown) => never } },
  omitFields: object,
  label: string,
): Validated<T> {
  const clean = stripNullsDeep(raw) as Record<string, unknown>;
  const { sections, ...rest } = clean;

  const parsed = schema.omit(omitFields).safeParse(rest) as unknown as {
    success: boolean;
    data?: unknown;
    error?: { issues: Array<{ path: (string | number)[]; message: string }> };
  };

  if (!parsed.success) {
    return {
      ok: false,
      issues: (parsed.error?.issues ?? []).map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
      ),
    };
  }

  const { blocks, errors } = parseBlocks(sections, label);
  return { ok: true, frontmatter: parsed.data as T, blocks, blockErrors: errors };
}

export function validateCategoryDocument(
  raw: unknown,
  slug: string,
): Validated<ProductCategory> {
  return validate<ProductCategory>(
    raw,
    productCategorySchema as never,
    CATEGORY_SECTION_FIELDS,
    `productCategory "${slug}"`,
  );
}

export function validateIndustryDocument(
  raw: unknown,
  slug: string,
): Validated<Industry> {
  return validate<Industry>(
    raw,
    industrySchema as never,
    INDUSTRY_SECTION_FIELDS,
    `industry "${slug}"`,
  );
}


/**
 * A SKU is fixed structure, so there are no sections to omit and no blocks to
 * validate — the whole document goes through the schema in one pass.
 *
 * The one reshaping: `compoundProperties` is a MAP in the content files
 * (compound code → list of properties) and a LIST of code/values pairs in
 * Sanity, because Sanity has no map type. Rebuilt here, once, so no component
 * ever learns the two storage shapes differ. Same arrangement as the spec
 * table's rows, and this is the second and last place it happens.
 */
export function validateSkuDocument(raw: unknown, slug: string): Validated<Sku> {
  const clean = stripNullsDeep(raw) as Record<string, unknown>;

  const pairs = clean.compoundProperties;
  if (Array.isArray(pairs)) {
    clean.compoundProperties = Object.fromEntries(
      (pairs as Array<{ code?: string; values?: string[] }>)
        .filter((p) => typeof p?.code === "string")
        .map((p) => [p.code as string, p.values ?? []]),
    );
  }

  const parsed = skuSchema.safeParse(clean);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
      ),
    };
  }

  void slug;
  return { ok: true, frontmatter: parsed.data as Sku, blocks: [], blockErrors: [] };
}


/**
 * A guide, like a SKU, is fixed structure — but its `body` is portable text
 * and has no counterpart in the .mdx schema, so it is held aside before the
 * frontmatter is validated. `blocks` reports whether the article has actually
 * been written, which is the one thing worth knowing about these eight.
 */
export function validateResourceDocument(
  raw: unknown,
  slug: string,
): Validated<Resource> {
  const clean = stripNullsDeep(raw) as Record<string, unknown>;
  const { body, ...rest } = clean;

  const parsed = resourceSchema.safeParse(rest);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
      ),
    };
  }

  void slug;
  return {
    ok: true,
    frontmatter: parsed.data as Resource,
    blocks: [],
    blockErrors: [],
    written: Array.isArray(body) && body.length > 0,
  };
}


/**
 * A legal page. Fixed structure, and its sections are validated as part of the
 * document rather than as blocks — they are not reorderable page furniture,
 * they are the document's own numbered clauses.
 */
export function validateLegalDocument(raw: unknown, slug: string): Validated<Legal> {
  const parsed = legalSchema.safeParse(stripNullsDeep(raw));
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
      ),
    };
  }
  void slug;
  return { ok: true, frontmatter: parsed.data as Legal, blocks: [], blockErrors: [] };
}

import type { SchemaTypeDefinition } from "sanity";
import { legal } from "./legal";
import { legalBlock, legalSection, seo } from "./objects";

/**
 * The content model.
 *
 * Spike scope: `legal` only. The remaining 16 document types and the block
 * library follow once the publish-to-live loop is proven.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  legal,
  // Shared objects
  seo,
  legalSection,
  legalBlock,
];

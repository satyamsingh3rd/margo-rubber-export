import { shouldEmitSchema } from "@/lib/schema";
import type { ContentStatus } from "@/content/site";

/**
 * Structured data for one page.
 *
 * Gated on the page's own content status, in one place, so no route can
 * forget. A `placeholder` page emits nothing at all — asserting a founding
 * year, an address or a product claim that has not been confirmed is worse
 * than asserting nothing, because Google will believe it and a competitor
 * can report it.
 *
 * `JSON.stringify` is the whole of the escaping story here: the payload is
 * built from typed objects rather than concatenated strings, and stringify
 * escapes the closing-brace and quote characters that could otherwise break
 * out of the script element.
 */
export function JsonLd({
  graph,
  status,
}: {
  graph: unknown;
  status: ContentStatus;
}) {
  if (!shouldEmitSchema(status)) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

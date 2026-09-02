import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * The read client.
 *
 * `useCdn: true` serves from Sanity's edge cache, which is stale by up to a
 * minute. That is the right trade here because freshness does not come from
 * polling — a publish fires a webhook that invalidates the Next cache, so the
 * page rebuilds on demand rather than waiting for a CDN window to pass.
 *
 * `perspective: "published"` means drafts are never served to the public site
 * even though the dataset is public. Preview uses a separate client with a
 * token; this one cannot see unpublished work at all.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

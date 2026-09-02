import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env.ts";

/**
 * The read client.
 *
 * `useCdn` IS ON IN PRODUCTION AND OFF IN DEVELOPMENT, and the difference is
 * deliberate rather than an oversight.
 *
 * In production the edge cache is the right trade: it is stale by up to a
 * minute, but freshness there does not come from polling — a publish fires a
 * webhook that invalidates the Next cache and the page rebuilds on demand.
 *
 * In development no webhook can reach localhost, so the two caches compound:
 * a change published in Studio is invisible until BOTH the CDN window passes
 * and the Next cache is invalidated by hand. That made an ordinary edit look
 * broken twice while wiring this up. Off in development leaves one cache to
 * think about instead of two, and `npm run revalidate <slug>` clears it.
 *
 * `perspective: "published"` means drafts are never served to the public site
 * even though the dataset is public. Preview uses a separate client with a
 * token; this one cannot see unpublished work at all.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
});

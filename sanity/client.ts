import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env.ts";

/**
 * The read client.
 *
 * `useCdn` IS OFF EVERYWHERE, and in production that is a correction.
 *
 * It was on in production, on the reasoning that the CDN is stale by at most a
 * minute while a publish fires a webhook that rebuilds the page on demand. That
 * is exactly backwards: the webhook fires IMMEDIATELY, so the rebuild lands
 * INSIDE the CDN's staleness window and reads the pre-publish data. The stale
 * read is then frozen into the Next cache for the full revalidate window, so a
 * one-minute CDN lag becomes a fifteen-minute wrong page. Observed doing it:
 * published at 04:35:22, page re-rendered at 04:35:35 with the old heading.
 *
 * The CDN was never buying anything here. Next already caches these pages, so
 * Sanity is queried once per revalidation, not once per visitor — the edge
 * cache sits in front of a request that happens a handful of times an hour.
 *
 * Off in development additionally means one cache to reason about instead of
 * two, since no webhook can reach localhost; `npm run revalidate <slug>`
 * clears that one.
 *
 * `perspective: "published"` means drafts are never served to the public site
 * even though the dataset is public. Preview uses a separate client with a
 * token; this one cannot see unpublished work at all.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

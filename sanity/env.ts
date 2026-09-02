/**
 * Sanity connection details.
 *
 * Project ID and dataset are public by design — they ship in the browser
 * bundle and identify which content lake to read. The API version is pinned
 * to a date: Sanity's API is versioned by date, and leaving it floating means
 * a query that works today can behave differently after an upstream release.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "jyg2beas";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/** Pinned. Bump deliberately, never automatically. */
export const apiVersion = "2026-08-01";

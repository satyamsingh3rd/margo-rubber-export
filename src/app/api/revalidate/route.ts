import { revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { legalTag } from "@/lib/legal-source";

/**
 * POST /api/revalidate
 *
 * Sanity calls this the moment anything is published. It invalidates the
 * cache entry for the affected document and nothing else, so one edit
 * rebuilds one page rather than the whole site.
 *
 * SIGNATURE, NOT A SECRET IN THE URL. Sanity signs the body with a shared
 * secret and sends the signature in a header; we verify it against the raw
 * body. A token in a query string ends up in logs, referrer headers and
 * browser history — a signature does not, and it also proves the body was
 * not altered in transit.
 *
 * Unconfigured fails closed: with no secret set there is no way to tell a
 * real webhook from anyone who found the URL, and an open invalidation
 * endpoint is a free way to make a site rebuild every page on demand.
 */

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return json({ ok: false, message: "Revalidation is not configured." }, 503);
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) return json({ ok: false, message: "Unsigned." }, 401);

  // Read once, as text: the signature is over the exact bytes sent, so the
  // body cannot be parsed first and re-serialised.
  const body = await request.text();
  if (!(await isValidSignature(body, signature, secret))) {
    return json({ ok: false, message: "Bad signature." }, 401);
  }

  let payload: { _type?: string; slug?: { current?: string } | string };
  try {
    payload = JSON.parse(body);
  } catch {
    return json({ ok: false, message: "Expected a JSON body." }, 400);
  }

  const slug =
    typeof payload.slug === "string" ? payload.slug : payload.slug?.current;

  const tags: string[] = [];
  if (payload._type === "legal") {
    // The collection tag covers generateStaticParams and any list of legal
    // pages; the per-slug tag covers the page itself.
    tags.push(legalTag());
    if (slug) tags.push(legalTag(slug));
  }

  if (!tags.length) {
    // A document type this route does not know about yet. Not an error —
    // more types arrive as the migration proceeds.
    return json({ ok: true, revalidated: [], type: payload._type ?? null }, 200);
  }

  for (const tag of tags) revalidateTag(tag, "max");

  return json({ ok: true, revalidated: tags }, 200);
}

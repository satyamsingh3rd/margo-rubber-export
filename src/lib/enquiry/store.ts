import { neon } from "@neondatabase/serverless";
import type { MappedEnquiry } from "./sources";

/**
 * PERSISTENCE
 *
 * Writes the enquiry to Postgres. Uses Neon's serverless driver, which talks
 * SQL over HTTP rather than holding a TCP connection, because the deploy
 * target is Cloudflare Workers where a normal Postgres pool is not available.
 *
 * The driver is used rather than calling Neon's HTTP endpoint directly. An
 * earlier draft did the latter from memory, which is the kind of guess that
 * works until the provider changes a header and then fails silently in
 * production.
 *
 * DEGRADATION. With `DATABASE_URL` unset this returns `{ stored: false,
 * reason: "unconfigured" }` rather than throwing, so the endpoint runs end to
 * end in local development before any account exists. In production the caller
 * treats a failure here as fatal: this table is the system of record, and the
 * whole point of it is that lead history does not depend on a third party
 * staying connected.
 */

export type StoreResult =
  | { stored: true; id: string }
  | { stored: false; reason: "unconfigured" }
  | { stored: false; reason: "error"; message: string };

export function isStoreConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function storeEnquiry(
  enquiry: MappedEnquiry,
  extra: { userAgent?: string; fileUrl?: string },
): Promise<StoreResult> {
  const url = process.env.DATABASE_URL;
  if (!url) return { stored: false, reason: "unconfigured" };

  try {
    const sql = neon(url);

    // Parameterised throughout. `raw` is passed as a JS object and serialised
    // by the driver, so a message containing quotes or braces cannot break the
    // statement.
    const rows = await sql`
      INSERT INTO enquiries
        (source, page, referrer, user_agent,
         name, company, email, phone, country, product, quantity, message,
         file_url, raw)
      VALUES
        (${enquiry.source}, ${enquiry.page}, ${enquiry.referrer ?? null},
         ${extra.userAgent ?? null},
         ${enquiry.name ?? null}, ${enquiry.company ?? null}, ${enquiry.email},
         ${enquiry.phone ?? null}, ${enquiry.country ?? null},
         ${enquiry.product ?? null}, ${enquiry.quantity ?? null},
         ${enquiry.message ?? null},
         ${extra.fileUrl ?? null}, ${JSON.stringify(enquiry.raw)}::jsonb)
      RETURNING id
    `;

    const id = (rows as Array<{ id: string }>)[0]?.id;
    if (!id) {
      return { stored: false, reason: "error", message: "insert returned no id" };
    }
    return { stored: true, id };
  } catch (err) {
    return {
      stored: false,
      reason: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

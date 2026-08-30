import { isSignedIn } from "@/lib/admin/session";
import { listEnquiries, STATUSES, type Status } from "@/lib/enquiry/store";

/**
 * GET /api/enquiries
 *
 * Reads leads back out. Two callers, two ways in:
 *
 *  · the dashboard, via the admin session cookie — this is what the Export
 *    CSV link uses, so the browser needs nothing but the session it already
 *    has;
 *  · scheduled automations (Make, a nightly export), via a bearer token in
 *    `ENQUIRIES_READ_TOKEN`.
 *
 * If neither secret is configured the route 503s rather than serving. An
 * endpoint that returns every customer's contact details must fail closed.
 */

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function authorised(request: Request): Promise<boolean> {
  if (await isSignedIn()) return true;

  const token = process.env.ENQUIRIES_READ_TOKEN;
  if (!token) return false;

  const header = request.headers.get("authorization") ?? "";
  const offered = header.startsWith("Bearer ") ? header.slice(7) : "";
  // Length-checked before compare so this cannot be probed byte by byte.
  if (offered.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= offered.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

/** RFC 4180: double the quotes, wrap anything containing a delimiter. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS = [
  "id",
  "created_at",
  "status",
  "source",
  "name",
  "company",
  "email",
  "phone",
  "country",
  "product",
  "quantity",
  "message",
  "page",
  "referrer",
] as const;

export async function GET(request: Request) {
  if (!process.env.ENQUIRIES_READ_TOKEN && !process.env.ADMIN_SESSION_SECRET) {
    return json(
      { ok: false, message: "Enquiry read access is not configured." },
      503,
    );
  }

  if (!(await authorised(request))) {
    return json({ ok: false, message: "Unauthorised." }, 401);
  }

  const url = new URL(request.url);
  const p = url.searchParams;
  const status = STATUSES.includes(p.get("status") as Status)
    ? (p.get("status") as Status)
    : undefined;

  const { rows, total } = await listEnquiries({
    status,
    source: p.get("source") ?? undefined,
    q: p.get("q") ?? undefined,
    // A CSV export is a whole-dataset operation, so it is not held to the
    // JSON page size. Still capped: an unbounded query is a way to take the
    // database down by accident.
    limit: Math.min(Number(p.get("limit")) || (p.get("format") === "csv" ? 5000 : 100), 5000),
    offset: Number(p.get("offset")) || 0,
  });

  if (p.get("format") === "csv") {
    const body = [
      COLUMNS.join(","),
      ...rows.map((r) =>
        COLUMNS.map((c) => csvCell(r[c as keyof typeof r])).join(","),
      ),
    ].join("\r\n");

    // BOM so Excel opens UTF-8 correctly — without it, an accented company
    // name arrives mangled, which is exactly the sort of thing nobody
    // notices until a customer points it out.
    return new Response("﻿" + body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="margo-enquiries.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return json({ ok: true, total, count: rows.length, rows }, 200);
}

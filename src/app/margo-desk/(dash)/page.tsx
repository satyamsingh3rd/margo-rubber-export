import Link from "next/link";
import {
  countByStatus,
  isStoreConfigured,
  listEnquiries,
  STATUSES,
  type Status,
} from "@/lib/enquiry/store";
import { SOURCES } from "@/lib/enquiry/sources";
import { StatusPill } from "@/components/admin/StatusPill";

const PAGE_SIZE = 50;

export default async function AdminEnquiriesPage(props: PageProps<"/margo-desk">) {
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) || undefined;

  const status = STATUSES.includes(one(sp.status) as Status)
    ? (one(sp.status) as Status)
    : undefined;
  const source = one(sp.source);
  const q = one(sp.q);
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1);

  const [{ rows, total }, counts] = await Promise.all([
    listEnquiries({
      status,
      source,
      q,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    countByStatus(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { status, source, q, page: String(page), ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    return `/margo-desk?${next.toString()}`;
  };

  return (
    <>
      {!isStoreConfigured() && (
        <p className="border-warn/40 bg-warn/10 text-ink-2 mb-8 rounded-lg border px-4 py-3 text-sm">
          <strong className="text-ink">DATABASE_URL is not set.</strong> These
          rows come from the local development file, not Postgres. Nothing here
          is a real enquiry, and nothing submitted in production would be saved.
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-semibold">Enquiries</h1>
          <p className="text-ink-3 mt-1 text-sm">
            {total} {total === 1 ? "enquiry" : "enquiries"}
            {status || source || q ? " matching" : " in total"}
          </p>
        </div>

        {/* Counts are of everything, not of the filtered set — they are the
            reason to change the filter, so they must not move with it. */}
        <ul className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <li key={s}>
              <Link
                href={qs({ status: status === s ? undefined : s, page: "1" })}
                className={`border-line flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  status === s ? "bg-accent-400/10 border-accent-400/40" : ""
                }`}
              >
                <StatusPill status={s} />
                <span className="text-ink-3 tabular-nums">{counts[s]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <form method="get" className="mt-7 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, company, email or message…"
          className="border-line bg-surface-3 text-ink placeholder:text-ink-4 focus:border-accent-400 min-w-64 flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
        />
        <select
          name="source"
          defaultValue={source ?? ""}
          className="border-line bg-surface-3 text-ink rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {status && <input type="hidden" name="status" value={status} />}
        <button
          type="submit"
          className="border-line text-ink rounded-lg border px-4 py-2 text-sm"
        >
          Filter
        </button>
        {(q || source || status) && (
          <Link
            href="/margo-desk"
            className="text-ink-3 hover:text-ink self-center text-sm"
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p className="text-ink-3 border-line mt-8 rounded-lg border border-dashed py-16 text-center text-sm">
          No enquiries match.
        </p>
      ) : (
        <div className="border-line mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-line bg-surface-2 border-b">
                {["Received", "Name", "Company", "Email", "Source", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-ink-4 px-4 py-3 text-left text-xs font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-line hover:bg-surface-2/60 border-b last:border-b-0"
                >
                  <td className="text-ink-4 px-4 py-3 whitespace-nowrap tabular-nums">
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/margo-desk/enquiry/${r.id}`}
                      className="text-ink hover:text-accent-400 font-medium"
                    >
                      {r.name || "—"}
                    </Link>
                  </td>
                  <td className="text-ink-2 px-4 py-3">{r.company || "—"}</td>
                  <td className="text-ink-2 px-4 py-3">
                    <a href={`mailto:${r.email}`} className="hover:text-ink">
                      {r.email}
                    </a>
                  </td>
                  <td className="text-ink-4 px-4 py-3 font-mono text-xs">
                    {r.source}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="text-ink-3 mt-6 flex items-center justify-between text-sm">
          <span>
            Page {page} of {pages}
          </span>
          <span className="flex gap-4">
            {page > 1 && (
              <Link href={qs({ page: String(page - 1) })} className="hover:text-ink">
                ← Previous
              </Link>
            )}
            {page < pages && (
              <Link href={qs({ page: String(page + 1) })} className="hover:text-ink">
                Next →
              </Link>
            )}
          </span>
        </nav>
      )}
    </>
  );
}

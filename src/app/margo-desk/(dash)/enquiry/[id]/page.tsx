import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnquiry, STATUSES } from "@/lib/enquiry/store";
import { StatusPill } from "@/components/admin/StatusPill";
import { setStatusAction } from "../../../actions";

/** Fields the table gives a column of its own. Everything else lives in `raw`. */
const CANONICAL_FIELDS = [
  "name",
  "company",
  "email",
  "phone",
  "country",
  "product",
  "quantity",
  "message",
] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-line grid grid-cols-[9rem_1fr] gap-4 border-b py-3 last:border-b-0">
      <dt className="text-ink-4 text-xs">{label}</dt>
      <dd className="text-ink-2 text-sm break-words">{children}</dd>
    </div>
  );
}

export default async function EnquiryDetailPage(
  props: PageProps<"/margo-desk/enquiry/[id]">,
) {
  const { id } = await props.params;
  const row = await getEnquiry(id);
  if (!row) notFound();

  // Anything submitted that did not earn a column. This is the reason `raw`
  // exists: a field added to a form later is captured from its first
  // submission, without a migration.
  const extras = Object.entries(row.raw).filter(
    ([k]) => !CANONICAL_FIELDS.includes(k as (typeof CANONICAL_FIELDS)[number]),
  );

  return (
    <>
      <Link href="/margo-desk" className="text-ink-3 hover:text-ink text-sm">
        ← All enquiries
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-ink text-2xl font-semibold">
            {row.name || row.company || row.email}
          </h1>
          <p className="text-ink-3 mt-1 text-sm">
            {new Date(row.created_at).toLocaleString("en-GB", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>

        <form action={setStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={row.id} />
          <label className="sr-only" htmlFor="status">
            Status
          </label>
          {/* Keyed on the value. `defaultValue` is only read when the element
              mounts, so after an update React reuses the same <select> and it
              keeps showing the old status while the pill beside it shows the
              new one. Changing the key remounts it. */}
          <select
            key={row.status}
            id="status"
            name="status"
            defaultValue={row.status}
            className="border-line bg-surface-3 text-ink rounded-lg border px-3 py-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-accent-400 text-ink rounded-cta px-4 py-2 text-sm font-semibold"
          >
            Update
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="border-line bg-surface-3 rounded-lg border px-6 py-2">
          <dl>
            <Row label="Status">
              <StatusPill status={row.status} />
            </Row>
            <Row label="Name">{row.name || "—"}</Row>
            <Row label="Company">{row.company || "—"}</Row>
            <Row label="Email">
              <a href={`mailto:${row.email}`} className="hover:text-ink">
                {row.email}
              </a>
            </Row>
            <Row label="Phone">
              {row.phone ? (
                <a href={`tel:${row.phone}`} className="hover:text-ink">
                  {row.phone}
                </a>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Country">{row.country || "—"}</Row>
            <Row label="Product">{row.product || "—"}</Row>
            <Row label="Quantity">{row.quantity || "—"}</Row>
            <Row label="Message">
              {row.message ? (
                <span className="whitespace-pre-wrap">{row.message}</span>
              ) : (
                "—"
              )}
            </Row>
            {row.file_url && (
              <Row label="Attachment">
                <a href={row.file_url} className="text-accent-400">
                  Download
                </a>
              </Row>
            )}
          </dl>
        </section>

        <aside className="space-y-6">
          <section className="border-line bg-surface-3 rounded-lg border px-6 py-2">
            <dl>
              <Row label="Source form">
                <span className="font-mono text-xs">{row.source}</span>
              </Row>
              <Row label="Submitted from">
                <Link href={row.page} className="text-accent-400 font-mono text-xs">
                  {row.page}
                </Link>
              </Row>
              <Row label="Referrer">
                <span className="font-mono text-xs break-all">
                  {row.referrer || "direct"}
                </span>
              </Row>
              <Row label="CRM">
                {row.crm_synced_at
                  ? `Synced ${new Date(row.crm_synced_at).toLocaleDateString("en-GB")}`
                  : "Not synced"}
              </Row>
            </dl>
          </section>

          {extras.length > 0 && (
            <section className="border-line bg-surface-3 rounded-lg border px-6 py-2">
              <p className="text-ink-4 border-line border-b py-3 text-xs">
                Also submitted
              </p>
              <dl>
                {extras.map(([k, v]) => (
                  <Row key={k} label={k}>
                    {v}
                  </Row>
                ))}
              </dl>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

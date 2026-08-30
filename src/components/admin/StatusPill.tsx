import type { Status } from "@/lib/enquiry/store";

/**
 * Status as a coloured chip.
 *
 * Semantic colour, deliberately separate from the brand accent: these encode
 * state, and if `new` were brand blue it would read as decoration rather than
 * as "this one needs attention".
 */
const TONE: Record<Status, string> = {
  new: "bg-warn/15 text-warn border-warn/30",
  contacted: "bg-ink-4/15 text-ink-2 border-line-2",
  quoted: "bg-accent-400/12 text-accent-400 border-accent-400/30",
  won: "bg-ok/15 text-ok border-ok/30",
  lost: "bg-danger/12 text-danger border-danger/30",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${TONE[status]}`}
    >
      {status}
    </span>
  );
}

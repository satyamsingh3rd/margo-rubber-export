"use client";

import { useState } from "react";

export type Material = {
  code: string;
  name: string;
  temp: string;
  hardness: string;
  chemical: string;
  industries: string;
  applications: string;
};

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
      aria-hidden
    >
      <path d="m9.5 5.5 7 6.5-7 6.5" />
    </svg>
  );
}

/**
 * Compound selector.
 *
 * Every compound's full spec stays mounted (the inactive panels are hidden with
 * `hidden`, not unmounted), so the whole material table is in the HTML for
 * crawlers and in-page search rather than appearing only on click.
 */
export function MaterialSelector({
  items,
  customNote,
}: {
  items: readonly Material[];
  customNote: string;
}) {
  const [i, setI] = useState(0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <ul role="tablist" aria-label="Compounds" className="flex flex-col gap-2">
        {items.map((m, n) => (
          <li key={m.code}>
            <button
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-controls={`compound-${m.code}`}
              onClick={() => setI(n)}
              className={`rounded-card flex w-full items-center gap-4 border px-5 py-4 text-left transition-colors ${
                n === i
                  ? "border-accent-400/50 bg-accent-400/8"
                  : "border-line hover:border-line-2 bg-[#0D0D0D]"
              }`}
            >
              <span
                className={`text-eyebrow w-14 shrink-0 font-mono ${
                  n === i ? "text-accent-400" : "text-ink-4"
                }`}
              >
                {m.code}
              </span>
              <span
                className={`flex-1 text-sm ${n === i ? "text-ink" : "text-ink-2"}`}
              >
                {m.name}
              </span>
              <span className={n === i ? "text-accent-400" : "text-ink-4"}>
                <Chevron />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-card border-line border bg-[#0D0D0D] p-7 md:p-8">
        {items.map((m, n) => (
          <div
            key={m.code}
            id={`compound-${m.code}`}
            role="tabpanel"
            hidden={n !== i}
            className="panel-in"
          >
            <p className="flex items-baseline gap-3">
              <span className="text-accent-400 font-mono text-lg font-semibold">
                {m.code}
              </span>
              <span className="text-ink text-xl font-semibold">{m.name}</span>
            </p>

            <dl className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {[
                ["TEMPERATURE RANGE", m.temp],
                ["HARDNESS RANGE", m.hardness],
                ["CHEMICAL RESISTANCE", m.chemical],
                ["KEY INDUSTRIES", m.industries],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-eyebrow text-ink-4 font-mono uppercase">
                    {label}
                  </dt>
                  <dd className="text-ink-2 mt-2 text-sm leading-relaxed">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-line mt-8 border-t pt-6">
              <p className="text-ink-2 text-sm leading-relaxed">
                <span className="text-ink font-semibold">Applications: </span>
                {m.applications}
              </p>
              <p className="text-accent-400 mt-4 text-sm">{customNote}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

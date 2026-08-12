/**
 * INTERNAL LINK INTEGRITY GATE
 *
 * Every internal href in navigation, MDX content and page components is checked
 * against the routes that actually build. This exists because the Figma copy
 * names products and sectors that are not in Margo's 9+9 architecture
 * (moulded-components, extruded-profiles, rubber-sheets, diaphragms,
 * medical-pharma, general-engineering), and those names were being transcribed
 * straight into hrefs, producing links that 404 in production but that nothing
 * in the build complained about.
 *
 *   node scripts/check-links.mts            report only
 *   node scripts/check-links.mts --strict   exit 1 on any unexpected break
 *
 * Routes in PLANNED are unbuilt but are in the route map (§4.0), so they are
 * reported separately rather than failing the gate. Delete an entry from
 * PLANNED the moment its page ships.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";

/** In the route map but not built yet. Not failures. */
const PLANNED = new Set([
  "/resources",
  "/thank-you",
  "/legal/privacy-policy",
  "/legal/terms",
  "/legal/export-compliance",
  // Build item 3 in the plan: the interactive O-ring size chart.
  "/resources/o-ring-size-chart",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(SRC);

/* ── What routes exist? ─────────────────────────────────────────────────── */
const live = new Set<string>();

for (const f of files) {
  if (!f.endsWith("page.tsx")) continue;
  const route = f.slice(SRC.length + 4, -"/page.tsx".length) || "/";
  if (!route.includes("[")) live.add(route);
}

const slugs = (dir: string) =>
  readdirSync(join(SRC, "content", dir))
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.slice(0, -4));

for (const s of slugs("products")) live.add(`/products/${s}`);
for (const s of slugs("industries")) live.add(`/industries/${s}`);

/* ── What is linked? ────────────────────────────────────────────────────── */
type Hit = { href: string; file: string };
const hits: Hit[] = [];

for (const f of files) {
  if (!/\.(mdx|ts|tsx)$/.test(f)) continue;
  if (f.includes("scripts/")) continue;
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/href[:=]\s*["'{]?\s*["']?(\/[a-z0-9/#-]*)/gi)) {
    hits.push({ href: m[1], file: f });
  }
}

/* ── Compare ────────────────────────────────────────────────────────────── */
const broken = new Map<string, Set<string>>();
const planned = new Map<string, Set<string>>();

for (const { href, file } of hits) {
  const path = href.split("#")[0];
  // A bare "#anchor" link has no path component; nothing to resolve.
  if (!path || path === "/") continue;
  if (live.has(path)) continue;
  const bucket = PLANNED.has(path) ? planned : broken;
  if (!bucket.has(path)) bucket.set(path, new Set());
  bucket.get(path)!.add(file.replace(`${SRC}/`, ""));
}

const strict = process.argv.includes("--strict");

console.log(`\n  Internal links checked against ${live.size} live routes\n`);

if (planned.size) {
  console.log(`  ○  ${planned.size} link(s) to PLANNED routes (not failures):`);
  for (const [path, where] of [...planned].sort()) {
    console.log(`     ${path}  ←  ${[...where].sort().join(", ")}`);
  }
  console.log("");
}

if (broken.size === 0) {
  console.log("  ✓  No broken internal links.\n");
  process.exit(0);
}

console.log(`  ✗  ${broken.size} BROKEN internal link target(s):\n`);
for (const [path, where] of [...broken].sort()) {
  console.log(`     ${path}`);
  for (const w of [...where].sort()) console.log(`        ← ${w}`);
}
console.log("");
process.exit(strict ? 1 : 0);

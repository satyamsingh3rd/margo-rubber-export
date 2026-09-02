import { schemaTypes } from "../sanity/schemaTypes/index.ts";

/**
 * WHAT THE EDITOR ACTUALLY READS
 *
 * A field with no `title` is not unlabelled — Sanity title-cases its NAME and
 * shows that. Which is fine for `label` or `heading`, and useless for `href`,
 * which appears as "Href".
 *
 * So this checks two things a schema validator never will:
 *
 *  1. JARGON. A short list of field names that mean nothing to a non-technical
 *     editor. These must carry an explicit title.
 *
 *  2. DRIFT. The same field name labelled differently across types. `legal` was
 *     written first, before the vocabulary settled, and ended up calling the
 *     slug "URL" while every other type called it "Web address" — the same box,
 *     two names, depending which page you opened.
 *
 * Neither is a bug in any normal sense. Both make the CMS harder to use than
 * it needs to be, which for a tool nobody has used yet is the risk that
 * actually matters.
 */

type Node = {
  name?: string;
  title?: string;
  fields?: Node[];
  of?: Node[];
};

/** Names an editor cannot be expected to understand from the name alone. */
const JARGON = new Set([
  "href", "slug", "eyebrow", "cta", "variant", "seo", "lqip", "kicker",
  "footIcon", "lead", "anchorId", "schemaTypes", "navLabel",
]);

/**
 * Names whose meaning is the same wherever they appear, so their label should
 * be too. Deliberately excludes `slug`, `image`, `icon` and `h1`, which mean
 * genuinely different things in different places — a page's own address versus
 * a reference to another page, a photograph versus a logo.
 */
const SHOULD_MATCH = ["status", "seo", "intro", "confirmWithMargo", "faqs"];

const untitledJargon: string[] = [];
const labels = new Map<string, Map<string, Set<string>>>();

function walk(node: Node, root: string, path: string) {
  for (const field of node.fields ?? []) {
    const here = `${path}.${field.name ?? "?"}`;

    if (field.name && !field.title && JARGON.has(field.name)) {
      untitledJargon.push(`${here} — shows as "${titleCase(field.name)}"`);
    }

    if (field.name && field.title) {
      if (!labels.has(field.name)) labels.set(field.name, new Map());
      const byLabel = labels.get(field.name)!;
      if (!byLabel.has(field.title)) byLabel.set(field.title, new Set());
      byLabel.get(field.title)!.add(root);
    }

    walk(field, root, here);
  }
  for (const member of node.of ?? []) walk(member, root, `${path}[]`);
}

const titleCase = (s: string) =>
  s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

for (const type of schemaTypes as Array<Node & { name: string }>) {
  walk(type, type.name, type.name);
}

let problems = 0;

if (untitledJargon.length > 0) {
  problems += untitledJargon.length;
  console.error(`✖ ${untitledJargon.length} jargon field(s) with no label:\n`);
  for (const j of untitledJargon) console.error(`   ${j}`);
  console.error("");
}

const drifted: string[] = [];
for (const name of SHOULD_MATCH) {
  const byLabel = labels.get(name);
  if (!byLabel || byLabel.size <= 1) continue;
  drifted.push(
    `   ${name}\n` +
      [...byLabel]
        .map(([label, types]) => `      "${label}"  ← ${[...types].sort().join(", ")}`)
        .join("\n"),
  );
}

if (drifted.length > 0) {
  problems += drifted.length;
  console.error(`✖ ${drifted.length} shared field(s) labelled inconsistently:\n`);
  for (const d of drifted) console.error(d);
  console.error("");
}

const total = [...labels.values()].reduce(
  (n, m) => n + [...m.values()].reduce((k, s) => k + s.size, 0),
  0,
);

if (problems === 0) {
  console.log(
    `✓ labels — ${total} labelled fields, no jargon unlabelled, shared fields consistent`,
  );
  process.exit(0);
}

console.error(
  "A field with no title shows its NAME, title-cased. That is fine for\n" +
    '"heading" and useless for "href".',
);
process.exit(1);

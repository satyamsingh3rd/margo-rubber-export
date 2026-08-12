/**
 * FORBIDDEN-CLAIMS REPORT
 *
 * Scans every content file for claims Margo cannot make. Sourced from the
 * research pack's global forbidden-claims list (§8.3 of the implementation
 * plan) and the Master Blocker Register.
 *
 * MODE
 *   npm run check:claims             → report only, exit 0 (development default)
 *   npm run check:claims -- --strict → exit 1 on any hit (Phase-2 QA gate)
 *
 * IMPORTANT — what is NOT a violation:
 *   Some pages are REQUIRED to name a credential in order to deny it. The
 *   oil & gas page must carry a verbatim NORSOK/API non-claim sentence, and
 *   the medical page an explicit no-FDA/ISO-13485 sentence. Naming a standard
 *   while denying it is the correct behaviour, so this script skips:
 *     · the `nonClaims:` block      (mandatory denial sentences)
 *     · the `confirmWithMargo:` block (our own notes about the claims)
 *     · any line carrying an explicit negation near the term
 */

import fs from "node:fs";
import path from "node:path";
import { FORBIDDEN_CLAIMS } from "../src/content/site.ts";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const strict = process.argv.includes("--strict");

/** Frontmatter keys whose entire block is exempt. */
const EXEMPT_BLOCKS = ["nonClaims", "confirmWithMargo"];

/** A term named in order to deny it is not a claim. */
const NEGATION =
  /\b(do(es)?\s+not|don't|never|no\b|not\s+(hold|certified|the\s+right)|is\s+not|are\s+not|without|banned|forbidden|must\s+not|roadmap|progressing\s+toward|MANDATORY|non-claim)\b/i;

type Hit = { file: string; line: number; text: string; why: string };

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.name.endsWith(".mdx") ? [full] : [];
  });
}

const hits: Hit[] = [];
const exempted: Hit[] = [];
const files = walk(CONTENT_ROOT);

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  let inExempt = false;

  lines.forEach((line, i) => {
    // Track exempt frontmatter blocks: a top-level key ends the previous block.
    const topKey = line.match(/^([A-Za-z][\w-]*):/);
    if (topKey) inExempt = EXEMPT_BLOCKS.includes(topKey[1]);
    if (/^\s*#/.test(line)) return; // comments

    for (const { pattern, why } of FORBIDDEN_CLAIMS) {
      if (!pattern.test(line)) continue;
      const hit = {
        file: path.relative(process.cwd(), file),
        line: i + 1,
        text: line.trim().slice(0, 110),
        why,
      };
      // YAML folds long strings across lines, and an FAQ question is answered
      // two lines below, so look at a small window rather than one line.
      const window = lines.slice(Math.max(0, i - 2), i + 4).join(" ");
      if (inExempt || NEGATION.test(window)) exempted.push(hit);
      else hits.push(hit);
    }
  });
}

/** Everything explicitly flagged for Margo sign-off. */
const pending: { file: string; item: string }[] = [];
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const block = raw.match(/confirmWithMargo:\n((?:\s+- .*\n)+)/);
  if (block) {
    for (const l of block[1].split("\n").filter(Boolean)) {
      pending.push({
        file: path.relative(process.cwd(), file),
        item: l.replace(/^\s*- /, "").replace(/^["']|["']$/g, ""),
      });
    }
  }
}

console.log(`\n  Scanned ${files.length} content file(s)\n`);

if (hits.length) {
  console.log(`  ⚠  ${hits.length} forbidden-claim match(es)\n`);
  for (const h of hits) {
    console.log(`     ${h.file}:${h.line}`);
    console.log(`       ${h.text}`);
    console.log(`       → ${h.why}\n`);
  }
} else {
  console.log("  ✓  No forbidden claims found\n");
}

if (exempted.length) {
  console.log(
    `  ⓘ  ${exempted.length} mention(s) allowed: inside a non-claim/annotation block, or explicitly negated\n`,
  );
}

if (pending.length) {
  console.log(`  ◐  ${pending.length} value(s) awaiting Margo sign-off\n`);
  for (const p of pending) console.log(`     ${p.file}\n       • ${p.item}`);
  console.log("");
}

if (strict && hits.length) {
  console.error("  ✗  Failing: --strict mode and forbidden claims present.\n");
  process.exit(1);
}

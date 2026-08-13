/**
 * BLUR PLACEHOLDER GENERATOR
 *
 * Reads every raster entry in the image registry, renders a 12px-wide blurred
 * JPEG, and writes it back into images.ts as `blur: "data:image/jpeg;base64,…"`.
 *
 * Run manually after adding or replacing an image:
 *     npm run gen:blur
 *
 * WHY THIS EXISTS RATHER THAN next/image DOING IT
 * `placeholder="blur"` generates its own blur data only for STATICALLY IMPORTED
 * images. This project deliberately stores `src` as a string path so the
 * registry stays the single source of truth and swapping a file is a one-line
 * change, which means Next cannot see the bytes at build time and requires an
 * explicit `blurDataURL`.
 *
 * `sharp` is a devDependency and runs only here. Nothing from it reaches the
 * browser; the output is ~400 bytes of base64 per image, inlined by next/image
 * into the markup of pages that actually render that image.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const REGISTRY = join("src", "content", "images.ts");
const PUBLIC = "public";

/** 12px wide is enough to read as "the shape of the photo" and stays tiny. */
const WIDTH = 12;
const QUALITY = 45;

async function blurFor(src: string): Promise<string | null> {
  const file = join(PUBLIC, src);
  if (!existsSync(file)) {
    console.warn(`  ⚠ missing on disk: ${src}`);
    return null;
  }
  const buf = await sharp(file)
    .resize(WIDTH, null, { fit: "inside" })
    .jpeg({ quality: QUALITY })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// Strip any blur lines from a previous run BEFORE matching, so re-running is
// idempotent. Removing them afterwards means matching against a moving target.
const source = readFileSync(REGISTRY, "utf8").replace(
  /^\s*blur: "data:image\/jpeg;base64,[^"]*",\n/gm,
  "",
);

// Match each entry's `src:` line so the blur can be inserted directly beneath
// it. Entries already carrying a `blur:` are regenerated, not duplicated.
const SRC_LINE = /^(\s*)src: "([^"]+)",$/gm;

const jobs: { indent: string; src: string; index: number; length: number }[] = [];
for (const m of source.matchAll(SRC_LINE)) {
  jobs.push({ indent: m[1], src: m[2], index: m.index!, length: m[0].length });
}

console.log(`Found ${jobs.length} image entries.`);

let out = "";
let cursor = 0;
let written = 0;

for (const job of jobs) {
  out += source.slice(cursor, job.index + job.length);
  cursor = job.index + job.length;

  // SVGs bypass next/image entirely, so a blur placeholder would never be used.
  if (job.src.endsWith(".svg")) continue;

  const data = await blurFor(job.src);
  if (!data) continue;

  out += `\n${job.indent}blur: "${data}",`;
  written++;
}
out += source.slice(cursor);

writeFileSync(REGISTRY, out);
console.log(`Wrote ${written} blur placeholders into ${REGISTRY}.`);

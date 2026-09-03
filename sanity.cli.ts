import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

/**
 * CLI config, separate from sanity.config.ts.
 *
 * sanity.config.ts describes the Studio that runs inside the Next.js app.
 * This file is what the `sanity` command-line tool reads, and it is needed for
 * three things the Studio cannot do:
 *
 *  · `sanity schema extract` — dumps the resolved schema as JSON, which is how
 *    the block library gets counted and diffed rather than eyeballed.
 *  · `sanity typegen generate` — turns GROQ queries into TypeScript types, so
 *    a query and its consumer cannot drift.
 *  · `sanity documents create` — the migration phase, which writes 62 files
 *    into the dataset from a script.
 *
 * Project id and dataset are imported rather than repeated so there is one
 * place they are wrong if they are wrong.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  // The Studio is served by Next.js at /studio, not by `sanity dev`.
  studioHost: undefined,
});

"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

/**
 * Sanity Studio, mounted inside this app at /studio.
 *
 * Embedded rather than standalone so the editor lives on Margo's own domain
 * and there is one deployment rather than two. Sanity's own setup flow
 * recommends standalone, which is right when the app sits inside a larger
 * repo — here the app IS the repo root, so a sibling folder would fall
 * outside version control.
 *
 * The desk is organised the way Margo's business is, not the way the schema
 * is. That distinction matters more as the model grows: a flat alphabetical
 * list of 17 document types is a database browser, not a place to work.
 */
export default defineConfig({
  name: "margo",
  title: "Margo Rubber",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Legal pages")
              .child(S.documentTypeList("legal").title("Legal pages")),
          ]),
    }),
    // Query playground. Useful while building, and harmless in production —
    // it can only read what the dataset already exposes publicly.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/**
 * /studio — the editor.
 *
 * A catch-all segment because Studio does its own client-side routing; every
 * path beneath /studio has to resolve to this one page and let Studio decide
 * what to render.
 *
 * `instant = false` because Studio is authenticated and entirely dynamic.
 * Under cacheComponents it must never be prerendered — a cached shell of a
 * content editor would show one editor's session to the next visitor.
 */
export const instant = false;

export const metadata = {
  title: "Studio · Margo Rubber",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}

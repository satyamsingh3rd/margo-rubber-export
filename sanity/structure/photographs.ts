import type { StructureBuilder } from "sanity/structure";
import { IMAGE_SLOTS } from "../../src/content/image-slots.ts";

/**
 * THE PHOTOGRAPHS SCREEN
 *
 * Built from the SLOT LIST, not from the documents.
 *
 * That distinction is the whole point, and getting it wrong the first time
 * made the screen useless: a plain document list shows photographs that have
 * been uploaded, so it reads "No documents of this type" until somebody has
 * already done the thing the screen exists to help them do. The 85 slots were
 * discoverable only by pressing + and opening a dropdown.
 *
 * Here every slot is a row, always, whether or not it has a photograph yet.
 * Opening one opens the editor for that slot's document, which is created on
 * first save — so nothing exists until a real photograph is uploaded, and the
 * list is still complete.
 *
 * Consequences worth having:
 *
 *  · The screen is a to-do list of the photography Margo still owes.
 *  · The document id is derived from the slot, so one slot cannot end up with
 *    two competing photographs — it is impossible rather than merely validated.
 *  · The slot is the id, so there is no slot field to pick, mistype, or leave
 *    disagreeing with the document it sits on.
 */

/**
 * Deterministic: one document per slot, by construction.
 *
 * Dots are ENCODED, not passed through. Sanity reserves the dot for
 * namespacing document ids — `drafts.`, `versions.<release>.` — and an id
 * containing one is invisible to the published perspective. It still saves,
 * still reads back by id, and simply never appears in a published query: a
 * document that exists and cannot be found.
 */
export const overrideId = (slot: string) =>
  `imageOverride-${slot.replace(/\./g, "__")}`;

/** Page areas, in the order they appear on the site rather than alphabetically. */
const AREA_TITLES: Record<string, string> = {
  home: "Home",
  products: "Products",
  industries: "Industries",
  about: "About",
  why: "Why Margo",
  export: "Export",
  certifications: "Certifications",
  "case-studies": "Case Studies",
  contact: "Contact",
  sku: "Parts",
  brand: "Brand",
};

const AREA_ORDER = Object.keys(AREA_TITLES);

export function photographsMenu(S: StructureBuilder) {
  const byArea = new Map<string, typeof IMAGE_SLOTS>();
  for (const slot of IMAGE_SLOTS) {
    const area = slot.key.split(".")[0];
    if (!byArea.has(area)) byArea.set(area, []);
    byArea.get(area)!.push(slot);
  }

  const areas = [...byArea.keys()].sort(
    (a, b) =>
      (AREA_ORDER.indexOf(a) + 1 || 99) - (AREA_ORDER.indexOf(b) + 1 || 99) ||
      a.localeCompare(b),
  );

  return S.list()
    .title("Photographs")
    .items(
      areas.map((area) => {
        const slots = byArea.get(area)!;
        const pending = slots.filter((s) => s.status === "placeholder").length;

        return S.listItem()
          .id(area)
          .title(
            `${AREA_TITLES[area] ?? area}  —  ${
              pending === 0
                ? `${slots.length} done`
                : pending === 1 && slots.length === 1
                  ? "still a stand-in"
                  : `${pending} of ${slots.length} still stand-ins`
            }`,
          )
          .child(
            S.list()
              .title(AREA_TITLES[area] ?? area)
              .items(
                slots.map((slot) =>
                  S.listItem()
                    .id(slot.key.replace(/\./g, "_"))
                    // The alt text is the only human-readable description of
                    // what belongs in this slot, so it is the row's subtitle in
                    // everything but name.
                    .title(
                      `${slot.status === "placeholder" ? "○" : "●"}  ${slot.key}  —  ${slot.alt}`,
                    )
                    .child(
                      S.editor()
                        .id(slot.key.replace(/\./g, "_"))
                        .schemaType("imageOverride")
                        .documentId(overrideId(slot.key))
                        .title(slot.key),
                    ),
                ),
              ),
          );
      }),
    );
}

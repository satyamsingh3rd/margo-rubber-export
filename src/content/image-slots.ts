import { IMAGES } from "./images.ts";

/**
 * THE 85 IMAGE SLOTS, as a plain list.
 *
 * Derived from the registry rather than typed out beside it: a slot list that
 * can drift from the registry is a dropdown offering an editor a choice that
 * renders nothing. The Studio dropdown and the site read the same object.
 *
 * `status` comes straight from the registry, where it already records which
 * images are stock stand-ins and which are real Margo photography. Surfacing
 * it in the Studio turns the list into what Margo actually needs — a to-do
 * list of the photographs still owed.
 */
export type ImageSlot = {
  key: string;
  alt: string;
  status: string;
};

export const IMAGE_SLOTS: ImageSlot[] = Object.entries(IMAGES)
  .map(([key, v]) => ({
    key,
    alt: (v as { alt: string }).alt,
    status: (v as { status?: string }).status ?? "placeholder",
  }))
  .sort((a, b) => a.key.localeCompare(b.key));

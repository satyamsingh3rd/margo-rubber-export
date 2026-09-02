import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * LEGAL PAGE
 *
 * The spike's subject: four pages, the simplest shape on the site, and the
 * only content type whose text an editor is genuinely likely to replace
 * wholesale once counsel supplies it.
 *
 * Mirrors legalSchema in src/content/schemas — same fields, same names, same
 * constraints — so the migration is a transcription rather than a redesign,
 * and so a document coming out of Sanity satisfies the Zod schema the
 * templates already validate against.
 */
export const legal = defineType({
  name: "legal",
  title: "Legal page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page heading",
      type: "string",
      description: "The H1. Shown at the top of the page.",
      validation: (r) => r.required().min(8),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      description: "The address, after /legal/. Changing it breaks old links.",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Visible to Google",
      type: "string",
      description:
        "Draft and Ready are both hidden from search engines. Only Published is indexed, listed in the sitemap and given structured data.",
      options: {
        list: [
          { title: "Draft — not finished", value: "placeholder" },
          { title: "Ready — reviewed, not yet public", value: "draft" },
          { title: "Published — visible to Google", value: "published" },
        ],
        layout: "radio",
      },
      initialValue: "placeholder",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "badge",
      title: "Label above the heading",
      type: "string",
      initialValue: "Legal & Compliance",
      validation: (r) => r.required().min(3),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 4,
      validation: (r) => r.required().min(40),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last reviewed",
      type: "string",
      description:
        "When counsel last reviewed this document — e.g. 15 January 2026. Leave empty until that is a fact; the site omits the date rather than inventing one.",
    }),
    defineField({
      name: "seo",
      title: "Search appearance",
      type: "seo",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [defineArrayMember({ type: "legalSection" })],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", status: "status", subtitle: "seo.title" },
    prepare: ({ title, status, subtitle }) => ({
      title,
      // Status in the list, so an editor sees at a glance what is public.
      subtitle: `${status === "published" ? "● Published" : "○ Not public"} · ${subtitle ?? ""}`,
    }),
  },
});

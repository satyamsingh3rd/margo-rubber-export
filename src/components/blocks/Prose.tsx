import { PortableText, type PortableTextComponents } from "next-sanity";
import Link from "next/link";
import { Img } from "@/components/ui/Img";

/**
 * LONG-FORM PROSE WRITTEN IN THE CMS
 *
 * The resource guides are the one place on this site with genuine article
 * content — 1,200 to 2,200 words of material engineering each. None of it is
 * written yet: all eight .mdx files carry a comment explaining that inventing
 * compound behaviour is the one thing this build will not do.
 *
 * That makes the guides the clearest case for the CMS on the whole site. The
 * prose has to be written by someone at Margo or a technical writer, and
 * asking that person to edit a Markdown file in a git repository is how a
 * guide never gets written. Here it is a text editor with headings and lists.
 *
 * The mapping below is deliberately narrow, and every omission is a decision:
 *
 *  · No H1 or H2. The page owns its H1 and a second one is an SEO fault an
 *    author should not be able to commit by choosing a dropdown value.
 *  · Links go through next/link so internal navigation stays client-side, and
 *    anything leaving the site gets rel="noopener".
 *  · Images come from the registry by key, like every other image on the site,
 *    so alt text and intrinsic dimensions travel with them.
 *
 * Styling is inherited from `.prose-guide`, the same wrapper the compiled MDX
 * body used, so a guide written in Sanity and a guide written in MDX are
 * indistinguishable once rendered.
 */

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },

  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },

  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = String(value?.href ?? "");
      // Internal links use next/link; anything else is external and gets the
      // rel that stops the opened page reaching back into this one.
      if (href.startsWith("/") || href.startsWith("#")) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      );
    },
  },

  types: {
    // An image inside the prose. Still a registry key, never an upload — the
    // same contract as the rest of the site.
    guideImage: ({ value }) => {
      const key = String(value?.key ?? "");
      if (!key) return null;
      return (
        <figure>
          <Img k={key} sizes="(max-width: 768px) 100vw, 68ch" />
          {value?.caption ? <figcaption>{String(value.caption)}</figcaption> : null}
        </figure>
      );
    },
  },
};

export type ProseValue = Parameters<typeof PortableText>[0]["value"];

/** True when there is at least one block with actual text in it. */
export function hasProse(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.some((block) => {
    const b = block as { _type?: string; children?: Array<{ text?: string }> };
    if (b._type !== "block") return true; // an image or other object counts
    return (b.children ?? []).some((c) => (c.text ?? "").trim().length > 0);
  });
}

export function Prose({ value }: { value: ProseValue }) {
  return <PortableText value={value} components={components} />;
}

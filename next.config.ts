import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // NOTE: `mdx` is deliberately NOT in pageExtensions. Content files live in
  // src/content/ and are loaded by slug — they are data, not routes. Adding
  // mdx here would turn every content file into an accidental URL.
  pageExtensions: ["ts", "tsx"],

  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Next 16: top-level, no longer experimental.
  cacheComponents: true,

  // Sanity Studio pulls in packages that ship raw .ts inside node_modules,
  // which Turbopack refuses with "Unknown module type". Naming them here
  // hands them to the compiler instead of the bundler's asset pipeline.
  transpilePackages: ["sanity", "@sanity/sdk-react", "@sanity/workbench"],

  async redirects() {
    // 301 map for the 26 legacy WooCommerce SKU URLs is finalised from a
    // Screaming Frog crawl immediately before cutover (blocker B15).
    return [];
  },
};

const withMDX = createMDX({
  options: {
    // Turbopack requires plugin names as strings — JS functions can't be
    // passed to Rust. Options must be serializable.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);

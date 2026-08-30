import { SiteHeader } from "@/components/nav/SiteHeader";
import { SiteFooter } from "@/components/nav/SiteFooter";

/**
 * The public site's chrome.
 *
 * A route group, so it adds no path segment: every marketing URL is exactly
 * what it was. It exists so the header and footer wrap the marketing pages
 * and nothing else — the enquiries desk sits outside it and renders bare.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

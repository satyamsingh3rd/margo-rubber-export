import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/nav/SiteHeader";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

// Self-hosted via next/font — never a Google Fonts CDN <link>.
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Margo Rubber Products",
    template: "%s",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // No `h-full` on <html>: it clips the document to the viewport and breaks
    // scrolling on long pages. Body owns the min-height instead.
    // `data-scroll-behavior="smooth"` is REQUIRED, not decorative. globals.css
    // sets `scroll-behavior: smooth` on <html> for in-page anchors. As of
    // Next 16 the router no longer neutralises that during route transitions
    // unless this attribute is present, so without it every client-side
    // navigation animates its scroll to top and the new page lands part-way
    // down. See node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${mono.variable} antialiased`}
    >
      {/* Browser extensions (ColorZilla's cz-shortcut-listen, Grammarly, etc.)
          inject attributes onto <body> before React hydrates, which reports as
          a hydration mismatch. This suppresses that on <body> only; it does not
          mask mismatches in our own components. */}
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

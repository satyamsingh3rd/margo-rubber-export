import { redirect } from "next/navigation";
import Link from "next/link";
import { isConfigured, isSignedIn } from "@/lib/admin/session";
import { signOutAction } from "../actions";

/**
 * The gate.
 *
 * `instant = false` because this segment reads the session cookie, which is
 * runtime data by definition. Under `cacheComponents` that would otherwise be
 * reported as a route that cannot prerender — correct, and here intentional:
 * a page listing customer contact details must never ship a static shell.
 *
 * The login page sits outside this route group, so it stays reachable.
 */
export const instant = false;

export const metadata = {
  title: "Enquiries · Margo admin",
  // Belt and braces alongside the session check. If this ever leaks, it
  // should at least not be indexed while it does.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Unconfigured fails closed. An admin with no password set must not be an
  // admin with no password required.
  if (!isConfigured() || !(await isSignedIn())) redirect("/margo-desk/login");

  return (
    <div className="min-h-dvh">
      <header className="border-line bg-surface-2 border-b">
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-4">
          <Link href="/margo-desk" className="text-ink text-sm font-semibold">
            Margo <span className="text-ink-4 font-normal">· enquiries</span>
          </Link>

          <nav className="text-ink-3 ml-auto flex items-center gap-5 text-sm">
            <a href="/api/enquiries?format=csv" className="hover:text-ink">
              Export CSV
            </a>
            <form action={signOutAction}>
              <button type="submit" className="hover:text-ink">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10">{children}</main>
    </div>
  );
}

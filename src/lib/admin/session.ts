import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * ADMIN SESSION
 *
 * A signed cookie, and nothing else.
 *
 * The architecture note originally put /admin behind Cloudflare Access. The
 * deploy target turned out to be Vercel, where that does not exist, so this
 * replaces it: one shared password, an HMAC-signed session cookie, no
 * dependency and no third-party identity provider. For a single administrator
 * checking a lead list, an SSO integration would be more moving parts than
 * the thing it protects.
 *
 * WHAT THIS IS NOT. It is not multi-user, it has no roles, and it has no
 * password reset. If Margo ever needs several named logins with an audit
 * trail, this should be replaced rather than extended — the seam is small on
 * purpose.
 *
 * Both secrets are required. Absent them, `isConfigured()` is false and the
 * route refuses to serve rather than falling open, which is the only safe
 * direction for a page that lists customer contact details.
 */

const COOKIE = "margo_admin";
/** Eight hours: a working day, so a session does not outlive one sitting. */
const MAX_AGE_SECONDS = 8 * 60 * 60;

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

function sign(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Constant-time compare.
 *
 * `===` on a signature leaks how many leading characters were correct through
 * timing, which is enough to forge one byte at a time. Length is checked
 * first because timingSafeEqual throws on a mismatch.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function verifyPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

/** Cookie value is `expiry.signature`, so an expired one cannot be replayed. */
function makeToken(): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;
  if (!safeEqual(signature, sign(expiry))) return false;
  return Number(expiry) > Date.now();
}

export async function startSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    // Secure everywhere except local http, where the browser would drop it.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  return tokenIsValid(jar.get(COOKIE)?.value);
}

"use client";

import { useActionState } from "react";
import { signInAction } from "../actions";

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(signInAction, null);

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <form
        action={formAction}
        className="border-line bg-surface-3 w-full max-w-sm rounded-xl border p-8"
      >
        <h1 className="text-ink text-lg font-semibold">Margo admin</h1>
        <p className="text-ink-3 mt-2 text-sm">Enquiries dashboard.</p>

        <label className="mt-7 block">
          <span className="text-ink-3 text-xs">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            autoFocus
            className="border-line bg-canvas text-ink focus:border-accent-400 mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
          />
        </label>

        {error && (
          <p role="alert" className="text-danger mt-4 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-accent-400 text-ink rounded-cta mt-6 w-full py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

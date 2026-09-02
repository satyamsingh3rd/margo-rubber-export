"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  endSession,
  isConfigured,
  isSignedIn,
  startSession,
  verifyPassword,
} from "@/lib/admin/session";
import { setStatus, STATUSES, type Status } from "@/lib/enquiry/store";

/**
 * Admin server actions.
 *
 * Every one re-checks the session itself. A layout guard stops a page
 * rendering, but it does not stop a POST — an action is its own entry point
 * and has to authorise on its own terms.
 */

export async function signInAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  if (!isConfigured()) {
    return "Admin is not configured. ADMIN_PASSWORD and ADMIN_SESSION_SECRET must be set.";
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    // Deliberately vague, and deliberately not distinguishing "no password
    // given" from "wrong password".
    return "Incorrect password.";
  }

  await startSession();
  redirect("/margo-desk");
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/margo-desk/login");
}

export async function setStatusAction(formData: FormData): Promise<void> {
  if (!(await isSignedIn())) redirect("/margo-desk/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Status;
  if (!id || !STATUSES.includes(status)) return;

  await setStatus(id, status);

  // Both views show status, so both are stale after this.
  revalidatePath("/margo-desk");
  revalidatePath(`/margo-desk/enquiry/${id}`);
}

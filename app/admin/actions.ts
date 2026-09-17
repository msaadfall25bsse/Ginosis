"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth/session";

/**
 * Server Action for admin logout.
 * Clears the session cookie and redirects to /admin/login.
 */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

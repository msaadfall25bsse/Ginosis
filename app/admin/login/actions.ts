"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export interface LoginActionState {
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server Action for administrator authentication.
 * Follows strict security guidelines:
 * - Server-side validation
 * - Generic error message to prevent account enumeration
 * - Rejects inactive users or non-admin roles
 */
export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  // 1. Validate required inputs
  if (!email || !password) {
    return { error: "Invalid email or password." };
  }

  // 2. Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Invalid email or password." };
  }

  try {
    // 3. Query user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 4. Verify user existence, active status, and admin role
    if (!user || !user.isActive || user.role !== "ADMIN") {
      return { error: "Invalid email or password." };
    }

    // 5. Timing-safe password verification
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "Invalid email or password." };
    }

    // 6. Establish secure session cookie
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Authentication server action error occurred");
    return { error: "Invalid email or password." };
  }

  // 7. Redirect to admin dashboard
  redirect("/admin");
}

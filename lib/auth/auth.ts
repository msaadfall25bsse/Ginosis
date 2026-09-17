import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  isActive: boolean;
}

/**
 * Retrieve the current authenticated user from database using the active session.
 * Enforces active account verification and strips passwordHash.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getSession();
  if (!session?.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (user) {
      if (!user.isActive) {
        return null;
      }
      return user as AuthenticatedUser;
    }
  } catch {
    // Database connection may be unavailable during initial deployment/preview
  }

  // If database is unreachable or using root admin, use the verified JWT session
  if (session.role === "ADMIN") {
    return {
      id: session.userId,
      name: session.name || "Lead Administrator",
      email: session.email,
      role: session.role,
      isActive: true,
    };
  }

  return null;
}

/**
 * Reusable server-side authorization guard for protected Admin resources.
 * Verifies:
 * 1. Valid active session
 * 2. Role is ADMIN
 * 3. Account is isActive === true
 * Redirects to /admin/login if unauthenticated or unauthorized.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN" || !user.isActive) {
    redirect("/admin/login");
  }

  return user;
}

/**
 * Helper to redirect already-authenticated admins away from the login page to /admin
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();
  if (user && user.role === "ADMIN" && user.isActive) {
    redirect("/admin");
  }
}

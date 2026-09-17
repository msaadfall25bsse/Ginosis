import React from "react";
import { requireAdmin } from "@/lib/auth/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side defense-in-depth guard: verifies active session and database isActive status
  await requireAdmin();

  return <>{children}</>;
}

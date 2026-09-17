import React from "react";
import { requireAdmin } from "@/lib/auth/auth";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authorization guard: guarantees valid active admin session
  const admin = await requireAdmin();

  return (
    <AdminDashboardShell
      user={{
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }}
    >
      {children}
    </AdminDashboardShell>
  );
}

"use client";

import React, { useState } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

interface AdminDashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AdminDashboardShell({
  children,
  user,
}: AdminDashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7f8] dark:bg-[#0c0c0e] flex">
      {/* Sidebar (Desktop persistent + Mobile drawer) */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userName={user.name}
        userEmail={user.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          userName={user.name}
          userEmail={user.email}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

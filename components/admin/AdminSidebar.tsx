"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(admin)/admin/actions";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

export function AdminSidebar({
  isOpen,
  onClose,
  userName = "Administrator",
  userEmail = "admin@gnosis.news",
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      active: pathname === "/admin",
      disabled: false,
      badge: undefined,
    },
    {
      name: "Articles",
      href: "#",
      active: false,
      disabled: true,
      badge: "Phase 5",
    },
    {
      name: "Media Library",
      href: "/admin/media",
      active: pathname.startsWith("/admin/media"),
      disabled: false,
      badge: undefined,
    },
    {
      name: "Settings",
      href: "#",
      active: false,
      disabled: true,
      badge: "Future",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-zinc-950 text-zinc-100 border-r border-zinc-800 p-5">
      <div>
        {/* Masthead in sidebar */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
          <div>
            <span className="font-editorial text-2xl font-black tracking-wider text-white select-none">
              GNOSIS
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-red-500 font-bold mt-0.5">
              Admin Portal
            </span>
          </div>
          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white focus:outline-none"
            aria-label="Close navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="mt-6 space-y-1.5" aria-label="Admin Sections">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.disabled ? (
                <div
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs uppercase font-bold tracking-wider text-zinc-500 cursor-not-allowed select-none rounded-none"
                  title={`${item.name} - Module scheduled for ${item.badge}`}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-zinc-800/80 text-zinc-400 px-1.5 py-0.5 rounded-none font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-xs uppercase font-bold tracking-wider rounded-none transition-colors ${
                    item.active
                      ? "bg-red-700 text-white font-extrabold"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <div>
          <p className="text-xs font-bold text-white truncate">{userName}</p>
          <p className="text-[11px] text-zinc-400 truncate">{userEmail}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full py-2 px-3 text-xs uppercase font-bold tracking-wider bg-zinc-900 hover:bg-red-950/70 hover:text-red-400 text-zinc-300 border border-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-600 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </form>

        <div className="text-[10px] text-zinc-600 text-center">
          Phase 3 Foundation Shell
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-xs shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

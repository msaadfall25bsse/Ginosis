"use client";

import React from "react";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  userName?: string;
  userEmail?: string;
}

export function AdminHeader({
  onToggleMobileMenu,
  userName = "Administrator",
  userEmail = "admin@gnosis.news",
}: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu hamburger button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          aria-label="Open sidebar navigation"
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
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        {/* Small screen brand indicator */}
        <div className="lg:hidden">
          <span className="font-editorial text-xl font-bold tracking-wider text-zinc-950 dark:text-zinc-50">
            GNOSIS
          </span>
          <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-500 ml-1.5">
            Admin
          </span>
        </div>

        {/* Desktop title */}
        <div className="hidden lg:block text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
          Newsroom Management Console
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Link to view public site in new tab */}
        <Link
          href="/"
          target="_blank"
          className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
        >
          <span>View Site</span>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </Link>

        <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

        {/* User badge */}
        <div className="text-right hidden sm:block">
          <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {userName}
          </span>
          <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            {userEmail}
          </span>
        </div>

        {/* Logout button */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="py-1.5 px-3 bg-zinc-100 hover:bg-red-50 hover:text-red-700 dark:bg-zinc-900 dark:hover:bg-red-950/50 dark:hover:text-red-400 text-zinc-700 dark:text-zinc-300 text-xs font-semibold tracking-wider transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

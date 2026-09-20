"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/config/navigation";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-zinc-950 p-6 shadow-xl flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-editorial text-2xl font-black tracking-wider text-zinc-900 dark:text-zinc-100">
              GNOSIS
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              aria-label="Close navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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

          {/* Quick Mobile Search Form (Phase 7 Section 24 & 57) */}
          <form
            action="/search"
            method="GET"
            onSubmit={onClose}
            role="search"
            className="mt-4"
          >
            <div className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search articles..."
                maxLength={256}
                aria-label="Search articles"
                className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="mt-4 flex flex-col space-y-1.5">
            <Link
              href="/"
              onClick={onClose}
              className={`px-3 py-2.5 text-base font-semibold uppercase tracking-wider rounded-none transition-colors ${
                pathname === "/"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-red-700 dark:text-red-400 font-bold border-l-4 border-red-700"
                  : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              Home
            </Link>

            {CATEGORIES.map((cat) => {
              const href = `/${cat.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  onClick={onClose}
                  className={`px-3 py-2.5 text-base font-semibold uppercase tracking-wider rounded-none transition-colors ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-red-700 dark:text-red-400 font-bold border-l-4 border-red-700"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info in drawer */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">
            GNOSIS International
          </p>
          <p className="mt-1">Independent Digital News & Analysis</p>
        </div>
      </div>
    </div>
  );
}

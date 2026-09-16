"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/config/navigation";
import { Container } from "@/components/ui/Container";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Clean date string for editorial header
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{today}</span>
            <span className="hidden sm:inline" aria-hidden="true">|</span>
            <span className="hidden sm:inline font-medium text-zinc-700 dark:text-zinc-300">
              International Edition
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Visual Search Trigger Placeholder (as requested in Phase 1 specs) */}
            <button
              type="button"
              className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 p-1 rounded"
              title="Search (Feature coming in Phase 7)"
              aria-label="Search articles"
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <span className="hidden md:inline text-[11px] uppercase tracking-wider font-semibold">
                Search
              </span>
            </button>
          </div>
        </Container>
      </div>

      {/* Main Masthead Banner */}
      <Container className="py-4 md:py-6 flex items-center justify-between">
        {/* Mobile menu hamburger button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          aria-label="Open primary menu"
        >
          <svg
            className="w-6 h-6"
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

        {/* Editorial Wordmark */}
        <div className="flex-1 text-center lg:text-left">
          <Link href="/" className="inline-block group focus:outline-none">
            <span className="font-editorial text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-zinc-950 dark:text-zinc-50 uppercase select-none">
              GNOSIS
            </span>
            <span className="block text-[10px] sm:text-xs tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-400 font-sans font-medium mt-0.5">
              Independent Global Journalism
            </span>
          </Link>
        </div>

        {/* Quick Kicker Tagline (Desktop) */}
        <div className="hidden lg:block text-right text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            Unbiased. Structured. Verified.
          </p>
          <p className="text-[11px]">Daily international news & reporting</p>
        </div>
      </Container>

      {/* Primary Category Navigation Bar (Desktop) */}
      <nav
        className="hidden lg:block border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        aria-label="Primary Navigation"
      >
        <Container>
          <ul className="flex items-center space-x-1 py-1">
            <li>
              <Link
                href="/"
                className={`px-3.5 py-2 text-xs uppercase font-bold tracking-wider inline-block transition-colors border-b-2 ${
                  pathname === "/"
                    ? "border-red-700 text-red-700 dark:text-red-400"
                    : "border-transparent text-zinc-800 dark:text-zinc-200 hover:text-red-700 dark:hover:text-red-400"
                }`}
              >
                Home
              </Link>
            </li>

            {CATEGORIES.map((cat) => {
              const href = `/${cat.slug}`;
              const isActive = pathname === href;
              return (
                <li key={cat.slug}>
                  <Link
                    href={href}
                    className={`px-3.5 py-2 text-xs uppercase font-bold tracking-wider inline-block transition-colors border-b-2 ${
                      isActive
                        ? "border-red-700 text-red-700 dark:text-red-400"
                        : "border-transparent text-zinc-800 dark:text-zinc-200 hover:text-red-700 dark:hover:text-red-400"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </nav>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}

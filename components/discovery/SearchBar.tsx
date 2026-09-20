import React from "react";
import { CATEGORIES } from "@/config/navigation";

interface SearchBarProps {
  initialQuery?: string;
  initialCategory?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Editorial Search Bar Component (Phase 7 Sections 5, 8, 10, 61, 62, 114)
 * - Accessible form role="search"
 * - Preserves user search phrase
 * - Supports optional category filter
 * - Accessible keyboard & screen-reader controls
 */
export function SearchBar({
  initialQuery = "",
  initialCategory = "",
  placeholder = "Search articles, topics, analysis...",
  autoFocus = false,
  className = "",
}: SearchBarProps) {
  return (
    <form
      action="/search"
      method="GET"
      role="search"
      className={`w-full ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        {/* Main Search Input Container */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <svg
              className="w-5 h-5"
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
          <input
            type="search"
            name="q"
            defaultValue={initialQuery}
            placeholder={placeholder}
            autoFocus={autoFocus}
            maxLength={256}
            required
            aria-label="Search articles"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
          />
        </div>

        {/* Optional Category Dropdown Filter (Section 61-62) */}
        <div className="sm:w-44 shrink-0">
          <select
            name="category"
            defaultValue={initialCategory}
            aria-label="Filter by category"
            className="w-full px-3 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all shadow-xs"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold uppercase tracking-wider hover:bg-red-700 dark:hover:bg-red-500 hover:text-white dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 shrink-0 select-none cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}

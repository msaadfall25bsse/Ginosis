import React from "react";
import Link from "next/link";
import { SearchResultCard, SearchResultItem } from "@/components/discovery/SearchResultCard";
import { SearchPagination } from "@/components/discovery/SearchPagination";
import { CATEGORIES } from "@/config/navigation";

interface SearchResultsProps {
  articles: SearchResultItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  query: string;
  category?: string;
}

/**
 * Editorial Search Results List Component (Phase 7 Sections 7, 18, 60, 116)
 * Handles both populated results with pagination and Section 18 compliant empty state.
 */
export function SearchResults({
  articles,
  totalCount,
  totalPages,
  currentPage,
  query,
  category,
}: SearchResultsProps) {
  // Empty State with Helpful Editorial Recovery (Section 18)
  if (articles.length === 0) {
    return (
      <div className="py-12 px-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center max-w-2xl mx-auto my-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
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

        <h2 className="text-xl sm:text-2xl font-bold font-editorial text-zinc-900 dark:text-zinc-100">
          No results found for &ldquo;{query}&rdquo;
        </h2>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We couldn&apos;t find any published stories matching your search criteria.
        </p>

        {/* Editorial Recovery Options (Section 18) */}
        <div className="mt-8 text-left border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Suggested Recovery Options:
          </h3>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-red-700 dark:text-red-500 font-bold" aria-hidden="true">&bull;</span>
              <span>Try different, broader, or alternate keywords.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-700 dark:text-red-500 font-bold" aria-hidden="true">&bull;</span>
              <span>
                Browse coverage by news section:{" "}
                <span className="inline-flex flex-wrap gap-1.5 mt-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${cat.slug}`}
                      className="inline-block px-2 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-red-700 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-700 dark:text-red-500 font-bold" aria-hidden="true">&bull;</span>
              <span>
                Return to the{" "}
                <Link
                  href="/"
                  className="font-semibold text-red-700 dark:text-red-400 hover:underline"
                >
                  Homepage
                </Link>{" "}
                to see today&apos;s latest global dispatches.
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Search results" className="space-y-6">
      {/* Result Count and Query Summary (Section 60) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b-2 border-zinc-900 dark:border-zinc-100 gap-1">
        <h2 className="text-lg sm:text-xl font-bold font-editorial text-zinc-900 dark:text-zinc-100">
          Search results for &ldquo;{query}&rdquo;
          {category && (
            <span className="text-sm font-sans font-normal text-zinc-500 dark:text-zinc-400 ml-2">
              in section <span className="font-semibold capitalize">{category}</span>
            </span>
          )}
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
          {totalCount} {totalCount === 1 ? "story" : "stories"} found
        </span>
      </div>

      {/* Semantic Results List (Section 116) */}
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <SearchResultCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination Controls (Section 16 & 17) */}
      <SearchPagination
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        category={category}
      />
    </section>
  );
}

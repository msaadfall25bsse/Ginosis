import React from "react";
import Link from "next/link";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
  category?: string;
}

/**
 * Accessible, touch-friendly Search Pagination Component (Phase 7 Sections 16, 17, 24, 59)
 * Preserves query and category parameters in URLs.
 */
export function SearchPagination({
  currentPage,
  totalPages,
  query,
  category,
}: SearchPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buildPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (pageNumber > 1) params.set("page", pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate visible page numbers (max 5 buttons)
  const pageNumbers: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 sm:gap-2 mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800"
    >
      {/* Previous Button */}
      {hasPrevious ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          aria-label="Previous page"
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          &larr; Prev
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed select-none"
        >
          &larr; Prev
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <Link
              href={buildPageUrl(1)}
              className="w-9 h-9 flex items-center justify-center text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              1
            </Link>
            {startPage > 2 && (
              <span className="px-1 text-zinc-400 dark:text-zinc-600 select-none">
                ...
              </span>
            )}
          </>
        )}

        {pageNumbers.map((num) => {
          const isCurrent = num === currentPage;
          return isCurrent ? (
            <span
              key={num}
              aria-current="page"
              className="w-9 h-9 flex items-center justify-center text-xs sm:text-sm font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 select-none shadow-xs"
            >
              {num}
            </span>
          ) : (
            <Link
              key={num}
              href={buildPageUrl(num)}
              className="w-9 h-9 flex items-center justify-center text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {num}
            </Link>
          );
        })}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 text-zinc-400 dark:text-zinc-600 select-none">
                ...
              </span>
            )}
            <Link
              href={buildPageUrl(totalPages)}
              className="w-9 h-9 flex items-center justify-center text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Next Button */}
      {hasNext ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          aria-label="Next page"
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Next &rarr;
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed select-none"
        >
          Next &rarr;
        </span>
      )}
    </nav>
  );
}

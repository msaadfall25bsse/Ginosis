import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No Articles Found",
  description = "There are currently no published stories available in this section. Please check back shortly.",
  actionText = "Return to Home",
  actionHref = "/",
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 my-8">
      <div className="w-12 h-12 mx-auto mb-4 text-zinc-400">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 font-editorial">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
        {description}
      </p>
      {actionHref && (
        <Link
          href={actionHref}
          className="inline-block text-xs uppercase font-bold tracking-wider bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

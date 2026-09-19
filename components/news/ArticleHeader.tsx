import React from "react";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

interface ArticleHeaderProps {
  title: string;
  category: string;
  categorySlug: string;
  excerpt?: string | null;
}

/**
 * Editorial Article Header Component (Sections 10, 11, 12, 15, 23, 32)
 * Renders the single H1 headline, section breadcrumbs, and standfirst excerpt.
 */
export function ArticleHeader({
  title,
  category,
  categorySlug,
  excerpt,
}: ArticleHeaderProps) {
  return (
    <header className="space-y-6">
      {/* Breadcrumbs & Category Navigation (Section 15 & 32) */}
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500">
        <Link
          href="/"
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Home
        </Link>
        <span className="text-zinc-400" aria-hidden="true">
          /
        </span>
        <CategoryBadge
          category={categorySlug}
          label={category}
          href={`/${categorySlug}`}
          size="sm"
        />
      </nav>

      {/* Primary Article Title - Exactly one H1 per page (Section 11 & 23) */}
      <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.12]">
        {title}
      </h1>

      {/* Standfirst / Excerpt Deck (Section 12) */}
      {excerpt && excerpt.trim() && (
        <p className="font-serif text-lg sm:text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-3 border-red-700 dark:border-red-600 pl-4 py-1">
          {excerpt.trim()}
        </p>
      )}
    </header>
  );
}

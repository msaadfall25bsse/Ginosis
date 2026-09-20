import React from "react";
import Link from "next/link";
import { TrendingCard, TrendingCardItem } from "@/components/discovery/TrendingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface TrendingNewsProps {
  articles: TrendingCardItem[];
  title?: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
  className?: string;
  layout?: "grid" | "list";
}

/**
 * Editorial Trending News Section Component (Phase 7 Sections 32, 38, 39, 70, 71, 115)
 * - Transparently labeled as Trending Now or Trending & Latest
 * - Responsive mobile, tablet, and desktop presentation
 * - Handles empty states gracefully
 */
export function TrendingNews({
  articles,
  title = "Trending Now",
  subtitle,
  href,
  linkText,
  className = "",
  layout = "grid",
}: TrendingNewsProps) {
  if (!articles || articles.length === 0) {
    return null; // Gracefully collapses when no trending items exist (Section 103)
  }

  return (
    <section
      aria-label="Trending Stories"
      className={`bg-zinc-50 dark:bg-zinc-900/60 py-8 px-4 sm:px-6 border-y border-zinc-200 dark:border-zinc-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={title}
          href={href}
          linkText={linkText}
        />

        {subtitle && (
          <p className="-mt-3 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}

        {layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
            {articles.map((article, index) => (
              <TrendingCard
                key={article.id}
                article={article}
                rank={index + 1}
                showRank
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {articles.map((article, index) => (
              <TrendingCard
                key={article.id}
                article={article}
                rank={index + 1}
                showRank
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

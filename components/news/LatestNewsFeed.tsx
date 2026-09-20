import React from "react";
import Link from "next/link";
import { formatEditorialDate } from "@/components/news/EditorialByline";
import { RelatedArticleCardData } from "@/components/news/RelatedArticlesSection";

interface LatestNewsFeedProps {
  articles: RelatedArticleCardData[];
  className?: string;
}

/**
 * Editorial Latest News Feed Component (Sections 30, 68, 69, 77)
 * Displays compact latest published stories sorted by publication date descending.
 */
export function LatestNewsFeed({ articles, className = "" }: LatestNewsFeedProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = articles.slice(0, 4);

  return (
    <section
      aria-labelledby="latest-news-heading"
      className={`pt-10 mt-10 border-t border-zinc-200 dark:border-zinc-800 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="latest-news-heading"
          className="font-editorial text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" aria-hidden="true" />
          Latest News Wire
        </h2>
        <Link
          href="/"
          className="text-xs uppercase font-bold tracking-wider text-red-700 dark:text-red-500 hover:underline"
        >
          View Full Wire →
        </Link>
      </div>

      {/* Compact Responsive Grid / List (Section 30 & 69) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayArticles.map((article, idx) => {
          const categorySlug = article.primaryCategory?.slug || "world";
          const categoryTitle = article.primaryCategory?.name || "News";
          const formattedDate = formatEditorialDate(article.publishedAt);

          return (
            <article
              key={article.id}
              className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-500 mb-1.5">
                  <span>{categoryTitle}</span>
                  {formattedDate && (
                    <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                      {formattedDate}
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 hover:text-red-700 dark:hover:text-red-500 transition-colors leading-snug line-clamp-2">
                  <Link href={`/news/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
              </div>

              {article.author?.name && (
                <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                  By {article.author.name}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

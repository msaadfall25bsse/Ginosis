import React from "react";
import Link from "next/link";
import { formatEditorialDate } from "@/components/news/EditorialByline";

export interface LatestNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: Date | string | null;
  primaryCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id?: string;
    name: string;
    role?: string | null;
  };
}

interface LatestNewsProps {
  articles: LatestNewsItem[];
  title?: string;
  href?: string;
  linkText?: string;
  layout?: "grid" | "compact";
  className?: string;
  excludeId?: string;
}

/**
 * Unified Latest News Discovery Component (Phase 7 Sections 40, 41, 42, 86, 115)
 * Reusable across homepage, article pages, category hubs, and search fallback.
 * Strictly uses publishedAt DESC chronology and canonical /news/[slug] linking.
 */
export function LatestNews({
  articles,
  title = "Latest News Wire",
  href = "/",
  linkText = "View full wire →",
  layout = "grid",
  className = "",
  excludeId,
}: LatestNewsProps) {
  const candidateArticles = excludeId
    ? articles.filter((a) => a.id !== excludeId)
    : articles;

  if (!candidateArticles || candidateArticles.length === 0) {
    return null;
  }

  // Cap display count to reasonable limit (Section 41 & 101)
  const displayArticles = candidateArticles.slice(0, layout === "grid" ? 4 : 6);

  return (
    <section
      aria-label={title}
      className={`pt-8 border-t border-zinc-200 dark:border-zinc-800 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-editorial text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" aria-hidden="true" />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-xs uppercase font-bold tracking-wider text-red-700 dark:text-red-500 hover:underline transition-colors"
          >
            {linkText}
          </Link>
        )}
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayArticles.map((article) => {
            const categorySlug = article.primaryCategory?.slug || "world";
            const categoryTitle = article.primaryCategory?.name || "News";
            const formattedDate = formatEditorialDate(article.publishedAt);

            return (
              <article
                key={article.id}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-500 mb-1.5">
                    <Link href={`/${categorySlug}`} className="hover:underline">
                      {categoryTitle}
                    </Link>
                    {formattedDate && (
                      <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 hover:text-red-700 dark:hover:text-red-500 transition-colors leading-snug line-clamp-2">
                    <Link href={`/news/${article.slug}`}>{article.title}</Link>
                  </h3>
                </div>

                {article.author?.name && (
                  <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    By {article.author.name}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {displayArticles.map((article) => {
            const categorySlug = article.primaryCategory?.slug || "world";
            const categoryTitle = article.primaryCategory?.name || "News";
            const formattedDate = formatEditorialDate(article.publishedAt);

            return (
              <article key={article.id} className="py-3 flex items-baseline justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/${categorySlug}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-500 hover:underline"
                    >
                      {categoryTitle}
                    </Link>
                    {formattedDate && (
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        • {formattedDate}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-red-700 dark:hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/news/${article.slug}`}>{article.title}</Link>
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatEditorialDate } from "@/components/news/EditorialByline";

export interface RelatedArticleCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
  primaryCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    caption?: string | null;
  } | null;
  author?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface RelatedArticlesSectionProps {
  articles: RelatedArticleCardData[];
  categoryName?: string;
  className?: string;
}

/**
 * Editorial Related Articles Section Component (Sections 27, 28, 29, 68, 69, 76)
 * Renders 4–6 related stories in a responsive grid (1 col mobile, 2 cols tablet, 4 cols desktop).
 * Completely collapses if no related stories exist.
 */
export function RelatedArticlesSection({
  articles,
  categoryName,
  className = "",
}: RelatedArticlesSectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  // Strictly cap between 4 and 6 articles (Section 28)
  const displayArticles = articles.slice(0, 6);

  return (
    <section
      aria-labelledby="related-stories-heading"
      className={`pt-10 mt-12 border-t-2 border-zinc-900 dark:border-zinc-100 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          id="related-stories-heading"
          className="font-editorial text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          Related Stories {categoryName ? `in ${categoryName}` : ""}
        </h2>
      </div>

      {/* Responsive Grid Layout (Section 69: 1 col mobile, 2 cols tablet, 4 cols desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayArticles.map((article) => {
          const categorySlug = article.primaryCategory?.slug || "world";
          const categoryTitle = article.primaryCategory?.name || "News";
          const formattedDate = formatEditorialDate(article.publishedAt);
          const imageUrl = article.featuredImage?.url || null;
          const imageAlt = article.featuredImage?.altText || article.title;

          return (
            <article
              key={article.id}
              className="group flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors p-3"
            >
              <div>
                {/* 16:10 / 16:9 Aspect ratio image */}
                {imageUrl && (
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-3">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Category Badge */}
                <div className="mb-2">
                  <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 border-l-2 border-red-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    {categoryTitle}
                  </span>
                </div>

                {/* Article Headline Linking to Canonical URL (Section 4 & 52) */}
                <h3 className="font-editorial font-bold text-base leading-snug text-zinc-950 dark:text-zinc-50 group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors line-clamp-3">
                  <Link href={`/news/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>

                {/* Excerpt where available */}
                {article.excerpt && (
                  <p className="mt-2 text-xs font-serif text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* Byline & Dateline Footer */}
              <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                {article.author?.name && (
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[110px]">
                    {article.author.name}
                  </span>
                )}
                {formattedDate && <time>{formattedDate}</time>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

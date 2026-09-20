import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

export interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date | string | null;
  primaryCategory: {
    id: string;
    name: string;
    slug: string;
  };
  featuredImage: {
    id: string;
    url: string;
    altText: string | null;
    caption?: string | null;
  } | null;
  author: {
    id: string;
    name: string;
    slug?: string;
    avatar?: string | null;
    role?: string | null;
  };
}

interface SearchResultCardProps {
  article: SearchResultItem;
}

/**
 * Editorial Search Result Card (Phase 7 Sections 14, 15, 116, 121, 122)
 * Displays: Image, Category, Title, Excerpt, Date, Author.
 * Links exclusively to canonical /news/[slug].
 */
export function SearchResultCard({ article }: SearchResultCardProps) {
  const canonicalHref = `/news/${article.slug}`;
  const categorySlug = article.primaryCategory?.slug || "world";
  const categoryName = article.primaryCategory?.name || "News";

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const imageUrl =
    article.featuredImage?.url ||
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800";
  const imageAlt = article.featuredImage?.altText || article.title;

  return (
    <article className="group flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Thumbnail Container (16:10 aspect ratio) */}
      <div className="relative aspect-[16/10] sm:w-52 sm:h-36 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link href={canonicalHref} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 208px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Content Metadata */}
      <div className="flex flex-col justify-between flex-1 py-0.5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge
              category={categoryName}
              href={`/${categorySlug}`}
              size="sm"
            />
            {formattedDate && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700 select-none" aria-hidden="true">
                  •
                </span>
                <time
                  dateTime={
                    typeof article.publishedAt === "string"
                      ? article.publishedAt
                      : article.publishedAt?.toISOString()
                  }
                  className="text-xs text-zinc-500 dark:text-zinc-400"
                >
                  {formattedDate}
                </time>
              </>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial leading-snug group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-2">
            <Link href={canonicalHref}>{article.title}</Link>
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Author Byline Footnote */}
        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>By {article.author?.name || "Staff Correspondent"}</span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors font-semibold">
            Read story &rarr;
          </span>
        </div>
      </div>
    </article>
  );
}

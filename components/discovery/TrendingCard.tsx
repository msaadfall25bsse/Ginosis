import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

export interface TrendingCardItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: Date | string | null;
  primaryCategory: {
    id: string;
    name: string;
    slug: string;
  };
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
  } | null;
  author?: {
    id: string;
    name: string;
    avatar?: string | null;
    role?: string | null;
  };
}

interface TrendingCardProps {
  article: TrendingCardItem;
  rank?: number;
  showRank?: boolean;
}

/**
 * Editorial Trending News Card Component (Phase 7 Sections 38, 53, 115)
 * Displays: Rank number (01, 02, 03...), Thumbnail Image, Category Badge, Title, Date, Author.
 * Links strictly to canonical /news/[slug].
 */
export function TrendingCard({
  article,
  rank,
  showRank = true,
}: TrendingCardProps) {
  const canonicalHref = `/news/${article.slug}`;
  const categorySlug = article.primaryCategory?.slug || "world";
  const categoryName = article.primaryCategory?.name || "News";

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const imageUrl =
    article.featuredImage?.url ||
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600";
  const imageAlt = article.featuredImage?.altText || article.title;

  return (
    <article className="group flex items-start gap-3.5 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs">
      {/* Optional Editorial Rank Indicator (Section 38) */}
      {showRank && typeof rank === "number" && (
        <span
          className="text-2xl sm:text-3xl font-black font-editorial text-zinc-300 dark:text-zinc-700 select-none shrink-0 w-7 leading-none pt-0.5 group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors"
          aria-hidden="true"
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}

      {/* Content Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <CategoryBadge
            category={categoryName}
            href={`/${categorySlug}`}
            size="sm"
          />
          {formattedDate && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700 select-none text-xs" aria-hidden="true">
                •
              </span>
              <time
                dateTime={
                  typeof article.publishedAt === "string"
                    ? article.publishedAt
                    : article.publishedAt?.toISOString()
                }
                className="text-[11px] text-zinc-500 dark:text-zinc-400"
              >
                {formattedDate}
              </time>
            </>
          )}
        </div>

        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-editorial leading-snug group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-2">
          <Link href={canonicalHref}>{article.title}</Link>
        </h4>

        {article.author?.name && (
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            By {article.author.name}
          </p>
        )}
      </div>

      {/* Compact Thumbnail (aspect 1:1 or 4:3) */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link href={canonicalHref} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>
      </div>
    </article>
  );
}

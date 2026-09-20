import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsArticlePlaceholder } from "@/types/news";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArticleMeta } from "@/components/ui/ArticleMeta";

interface NewsCardProps {
  article: NewsArticlePlaceholder;
  layout?: "vertical" | "horizontal";
}

export function NewsCard({
  article,
  layout = "vertical",
}: NewsCardProps) {
  if (layout === "horizontal") {
    return (
      <article className="group flex flex-col sm:flex-row gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="relative aspect-[16/10] sm:w-48 sm:h-32 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Link href={article.slug ? `/news/${article.slug}` : `/${article.primaryCategory}`} className="block w-full h-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </Link>
        </div>
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <div className="mb-2">
              <CategoryBadge
                category={article.primaryCategory}
                href={`/${article.primaryCategory}`}
                size="sm"
              />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug font-editorial group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-2">
              <Link href={article.slug ? `/news/${article.slug}` : `/${article.primaryCategory}`}>
                {article.title}
              </Link>
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {article.excerpt}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <ArticleMeta
              author={article.author}
              publishedAt={article.publishedAt}
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Link href={article.slug ? `/news/${article.slug}` : `/${article.primaryCategory}`} className="block w-full h-full">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div>
          <div className="mb-2.5">
            <CategoryBadge
              category={article.primaryCategory}
              href={`/${article.primaryCategory}`}
              size="sm"
            />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug font-editorial group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-3 mb-2">
            <Link href={article.slug ? `/news/${article.slug}` : `/${article.primaryCategory}`}>
              {article.title}
            </Link>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <ArticleMeta
            author={article.author}
            publishedAt={article.publishedAt}
            readTime={article.readTime}
          />
        </div>
      </div>
    </article>
  );
}

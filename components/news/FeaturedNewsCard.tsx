import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsArticlePlaceholder } from "@/types/news";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArticleMeta } from "@/components/ui/ArticleMeta";

interface FeaturedNewsCardProps {
  article: NewsArticlePlaceholder;
  priority?: boolean;
}

export function FeaturedNewsCard({
  article,
  priority = true,
}: FeaturedNewsCardProps) {
  return (
    <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 lg:col-span-7">
        <Link href={article.slug ? `/news/${article.slug}` : `/${article.primaryCategory}`} className="block w-full h-full">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </Link>
        {article.imageCaption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-[11px] text-zinc-300 hidden sm:block pointer-events-none">
            {article.imageCaption}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between lg:col-span-5 py-1">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge
              category={article.primaryCategory}
              href={`/${article.primaryCategory}`}
            />
            {article.isBreaking && (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-red-700 text-white px-2 py-0.5 animate-pulse">
                Breaking
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.2] font-editorial mb-3 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
            <Link href={article.slug ? `/news/${article.slug}` : `/${article.primaryCategory}`}>
              {article.title}
            </Link>
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-4 mb-4">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
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

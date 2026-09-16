import React from "react";
import Link from "next/link";
import { NewsArticlePlaceholder } from "@/types/news";

interface CompactNewsCardProps {
  article: NewsArticlePlaceholder;
  index?: number;
  showIndex?: boolean;
}

export function CompactNewsCard({
  article,
  index,
  showIndex = false,
}: CompactNewsCardProps) {
  return (
    <article className="group flex items-start gap-3 py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
      {showIndex && typeof index === "number" && (
        <span
          className="text-2xl font-bold font-editorial text-zinc-300 dark:text-zinc-700 select-none shrink-0 w-6 leading-none pt-0.5"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-500">
            {article.primaryCategory}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">•</span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {article.readTime}
          </span>
        </div>
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-700 dark:group-hover:text-red-400 leading-snug line-clamp-2 transition-colors">
          <Link href={`/${article.primaryCategory}`}>
            {article.title}
          </Link>
        </h4>
        <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          By {article.author.name}
        </div>
      </div>
    </article>
  );
}

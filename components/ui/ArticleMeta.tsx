import React from "react";
import { AuthorInfo } from "@/types/news";

interface ArticleMetaProps {
  author: AuthorInfo;
  publishedAt: string;
  readTime?: string;
  className?: string;
}

export function ArticleMeta({
  author,
  publishedAt,
  readTime,
  className = "",
}: ArticleMetaProps) {
  // Format date cleanly (e.g. "Sep 15, 2026")
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`flex items-center flex-wrap gap-x-2 text-xs text-zinc-500 dark:text-zinc-400 font-normal ${className}`}
    >
      <span className="font-medium text-zinc-800 dark:text-zinc-200">
        {author.name}
      </span>
      <span aria-hidden="true">•</span>
      <time dateTime={publishedAt}>{formattedDate}</time>
      {readTime && (
        <>
          <span aria-hidden="true">•</span>
          <span>{readTime}</span>
        </>
      )}
    </div>
  );
}

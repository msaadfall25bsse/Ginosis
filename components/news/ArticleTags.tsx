import React from "react";

export interface ArticleTagItem {
  id: string;
  name: string;
  slug: string;
}

interface ArticleTagsProps {
  tags: ArticleTagItem[] | string[];
  className?: string;
}

/**
 * Editorial Article Tags Component (Section 26)
 * Displays topic badges safely as non-link labels to avoid broken URLs
 * until dedicated tag hub pages are established in later phases.
 */
export function ArticleTags({ tags, className = "" }: ArticleTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const normalizedTags = tags.map((tag) =>
    typeof tag === "string" ? { id: tag, name: tag, slug: tag } : tag
  );

  return (
    <footer className={`pt-8 border-t border-zinc-200 dark:border-zinc-800 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-3.5">
        Related Topics
      </span>
      <div className="flex flex-wrap gap-2.5">
        {normalizedTags.map((tag) => (
          <span
            key={tag.id || tag.slug}
            className="text-xs font-semibold px-3 py-1.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 select-none"
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </footer>
  );
}

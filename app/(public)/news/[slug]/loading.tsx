import React from "react";
import { Container } from "@/components/ui/Container";

export default function NewsArticleLoading() {
  return (
    <article className="py-8 sm:py-12 animate-pulse" aria-busy="true" aria-label="Loading article">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-3">
            <div className="h-10 sm:h-12 bg-zinc-200 dark:bg-zinc-800 rounded w-11/12" />
            <div className="h-10 sm:h-12 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          </div>

          {/* Excerpt Skeleton */}
          <div className="space-y-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
          </div>

          {/* Byline / Dateline Skeleton */}
          <div className="flex items-center justify-between py-4 border-y border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-1">
                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          {/* Hero Image Skeleton */}
          <div className="aspect-16/9 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />

          {/* Content Body Paragraphs Skeleton */}
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          </div>
        </div>
      </Container>
    </article>
  );
}

"use client";

import React from "react";
import { MediaCard, MediaCardItem } from "./MediaCard";

interface MediaGridProps {
  media: MediaCardItem[];
  isLoading?: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectMedia?: (media: MediaCardItem) => void;
  selectedId?: string;
  onOpenUploader?: () => void;
}

export function MediaGrid({
  media,
  isLoading,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onSelectMedia,
  selectedId,
  onOpenUploader,
}: MediaGridProps) {
  // 1. Loading Skeleton State (Section 54)
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            >
              <div className="aspect-4/3 bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-none w-3/4" />
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-none w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Empty State (Section 55)
  if (media.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-1">
          No images yet.
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-5">
          Upload your first image to get started.
        </p>
        {onOpenUploader && (
          <button
            type="button"
            onClick={onOpenUploader}
            className="px-4 py-2 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs uppercase font-bold tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Upload Images
          </button>
        )}
      </div>
    );
  }

  // 3. Grid of Media Cards
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onClick={onSelectMedia}
            isSelected={selectedId === item.id}
          />
        ))}
      </div>

      {/* 4. Pagination Controls (Section 31) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} images
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold uppercase tracking-wider text-[11px] transition-colors"
          >
            Previous
          </button>

          <span className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold uppercase tracking-wider text-[11px] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

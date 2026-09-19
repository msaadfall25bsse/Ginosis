"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { MediaGrid } from "./MediaGrid";
import { MediaCardItem } from "./MediaCard";
import { MediaUploader } from "./MediaUploader";
import { MediaDetails } from "./MediaDetails";
import { getMediaListAction } from "@/app/(admin)/admin/media/actions";

interface MediaLibraryProps {
  initialData: {
    media: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function MediaLibrary({ initialData }: MediaLibraryProps) {
  const [mediaList, setMediaList] = useState<MediaCardItem[]>(initialData.media);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [pageSize] = useState(initialData.pageSize);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "filename">("newest");
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaCardItem | null>(null);

  const [isPending, startTransition] = useTransition();

  const fetchMedia = useCallback(
    (targetPage = 1, currentSearch = search, currentMime = mimeType, currentSort = sort) => {
      startTransition(async () => {
        try {
          const result = await getMediaListAction({
            page: targetPage,
            pageSize,
            search: currentSearch || undefined,
            mimeType: currentMime || undefined,
            sort: currentSort,
          });

          setMediaList(result.media);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        } catch (err) {
          console.error("Failed to load media items:", err);
        }
      });
    },
    [pageSize, search, mimeType, sort]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchMedia(1, search, mimeType, sort);
  }

  function handleMimeChange(newMime: string) {
    setMimeType(newMime);
    fetchMedia(1, search, newMime, sort);
  }

  function handleSortChange(newSort: "newest" | "oldest" | "filename") {
    setSort(newSort);
    fetchMedia(1, search, mimeType, newSort);
  }

  function handlePageChange(newPage: number) {
    fetchMedia(newPage, search, mimeType, sort);
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-red-700 dark:text-red-500">
            Editorial Asset Pipeline • Phase 4
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-editorial mt-1">
            Media Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage, upload, and organize news publication images and metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploaderOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs uppercase font-bold tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Upload Images</span>
        </button>
      </div>

      {/* 2. Search, Filter & Sort Controls (Sections 32, 33, 34) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename, caption, or alt text..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            <svg
              className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchMedia(1, "", mimeType, sort);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-1"
            >
              Clear
            </button>
          )}
        </form>

        {/* Filter and Sort Dropdowns */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Format Filter */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="media-format-filter" className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase font-bold">
              Format:
            </label>
            <select
              id="media-format-filter"
              value={mimeType}
              onChange={(e) => handleMimeChange(e.target.value)}
              className="py-1 px-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="">All Formats</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="image/avif">AVIF</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="media-sort-filter" className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase font-bold">
              Sort:
            </label>
            <select
              id="media-sort-filter"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="py-1 px-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="filename">Filename (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Media Grid */}
      <MediaGrid
        media={mediaList}
        isLoading={isPending}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSelectMedia={(media) => setSelectedMedia(media)}
        selectedId={selectedMedia?.id}
        onOpenUploader={() => setIsUploaderOpen(true)}
      />

      {/* 4. Multi-Image Uploader Modal */}
      <MediaUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadComplete={() => fetchMedia(1, search, mimeType, sort)}
      />

      {/* 5. Media Details Drawer (Inspector, Alt Text, Caption, Replace, Delete) */}
      <MediaDetails
        media={selectedMedia}
        isOpen={Boolean(selectedMedia)}
        onClose={() => setSelectedMedia(null)}
        onUpdated={(updated) => {
          setSelectedMedia(updated);
          fetchMedia(page, search, mimeType, sort);
        }}
        onDeleted={() => {
          setSelectedMedia(null);
          fetchMedia(page, search, mimeType, sort);
        }}
      />
    </div>
  );
}

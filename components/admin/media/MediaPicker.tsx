"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { MediaCardItem } from "./MediaCard";
import { getMediaListAction } from "@/app/admin/media/actions";
import { MediaUploader } from "./MediaUploader";

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaCardItem) => void;
  title?: string;
  mode?: "featured" | "inline";
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media Image",
  mode = "featured",
}: MediaPickerProps) {
  const [mediaList, setMediaList] = useState<MediaCardItem[]>([]);
  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaCardItem | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function loadMedia(q = search, mime = mimeType) {
    startTransition(async () => {
      try {
        const res = await getMediaListAction({
          page: 1,
          pageSize: 24,
          search: q || undefined,
          mimeType: mime || undefined,
          sort: "newest",
        });
        setMediaList(res.media);
      } catch (err) {
        console.error("Failed to load picker media:", err);
      }
    });
  }

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedItem(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-500">
              {mode === "featured" ? "Featured Image Selection" : "Inline Image Selection"}
            </span>
            <h2
              id="media-picker-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-editorial"
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploaderOpen(true)}
              className="px-3 py-1.5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload New</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label="Close media picker"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadMedia(e.target.value, mimeType);
            }}
            placeholder="Search images..."
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <select
            value={mimeType}
            onChange={(e) => {
              setMimeType(e.target.value);
              loadMedia(search, e.target.value);
            }}
            className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="">All Formats</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
            <option value="image/avif">AVIF</option>
          </select>
        </div>

        {/* Grid Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isPending ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-4/3 bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No matching images found in media library.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedItem(item);
                  }}
                  className={`relative aspect-4/3 bg-zinc-100 dark:bg-zinc-800 overflow-hidden border cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? "ring-3 ring-zinc-950 dark:ring-zinc-50 border-transparent shadow-md"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {item.url && (
                    <Image
                      src={item.url}
                      alt={item.altText || item.fileName}
                      fill
                      sizes="200px"
                      className="object-cover"
                      unoptimized={item.url.startsWith("/uploads/")}
                    />
                  )}
                  {selectedItem?.id === item.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950/80 to-transparent p-2">
                    <p className="text-[10px] text-white truncate font-medium">
                      {item.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <div className="text-xs text-zinc-500 truncate pr-2">
            {selectedItem ? (
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Selected: {selectedItem.fileName} ({selectedItem.width}×{selectedItem.height})
              </span>
            ) : (
              <span>Click an image to select it</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs uppercase font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => {
                if (selectedItem) {
                  onSelect(selectedItem);
                  onClose();
                }
              }}
              className="px-4 py-1.5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs uppercase font-bold tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Choose Image
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Uploader for quick uploads on the fly */}
      <MediaUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadComplete={() => loadMedia()}
      />
    </div>
  );
}

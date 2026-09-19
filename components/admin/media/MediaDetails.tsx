"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import { MediaCardItem } from "./MediaCard";
import {
  updateMediaMetadataAction,
  deleteMediaAction,
  replaceMediaAction,
} from "@/app/(admin)/admin/media/actions";

interface MediaDetailsProps {
  media: MediaCardItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updated: MediaCardItem) => void;
  onDeleted?: (id: string) => void;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  const kb = bytes / k;
  if (kb < k) return `${Math.round(kb)} KB`;
  return `${(kb / k).toFixed(1)} MB`;
}

export function MediaDetails({
  media,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: MediaDetailsProps) {
  const [altText, setAltText] = useState(media?.altText || "");
  const [caption, setCaption] = useState(media?.caption || "");
  const [fileName, setFileName] = useState(media?.fileName || "");

  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [isPending, startTransition] = useTransition();
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Sync state when active media changes
  useEffect(() => {
    if (media) {
      setAltText(media.altText || "");
      setCaption(media.caption || "");
      setFileName(media.fileName || "");
      setErrorMessage(null);
      setSaveSuccess(false);
      setConfirmDelete(false);
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const usageCount =
    (media._count?.featuredInArticles || 0) + (media._count?.inlineInArticles || 0);

  // Copy Image URL (Section 26)
  async function handleCopyUrl() {
    if (!media) return;
    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("Could not copy URL to clipboard.");
    }
  }

  // Save Metadata Changes (Section 22, 23, 24)
  function handleSaveMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!media) return;

    setErrorMessage(null);
    setSaveSuccess(false);

    startTransition(async () => {
      const res = await updateMediaMetadataAction(media.id, {
        altText,
        caption,
        fileName,
      });

      if (res.success && res.media) {
        setSaveSuccess(true);
        onUpdated?.({
          ...media,
          altText: res.media.altText,
          caption: res.media.caption,
          fileName: res.media.fileName,
        });
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setErrorMessage(res.error || "Failed to update media metadata.");
      }
    });
  }

  // Handle Safe Image Replacement (Section 27)
  function handleReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !media) return;

    setErrorMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await replaceMediaAction(media.id, formData);
      if (res.success && res.media) {
        onUpdated?.({
          ...media,
          url: res.media.url,
          fileName: res.media.fileName,
          mimeType: res.media.mimeType,
          width: res.media.width,
          height: res.media.height,
          fileSize: res.media.fileSize,
        });
        setSaveSuccess(true);
      } else {
        setErrorMessage(res.error || "Failed to replace media asset.");
      }
    });

    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
    }
  }

  // Handle Safe Deletion with Reference Protection (Section 28)
  function handleDeleteMedia() {
    if (!media) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await deleteMediaAction(media.id);
      if (res.success) {
        onDeleted?.(media.id);
        onClose();
      } else {
        setErrorMessage(res.message || "Cannot delete media item.");
        setConfirmDelete(false);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-details-heading"
      className="fixed inset-0 z-50 flex items-center justify-end bg-zinc-950/60 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-500">
              Media Inspector
            </span>
            <h2
              id="media-details-heading"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-editorial truncate max-w-xs"
            >
              {media.fileName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* 1. Large Image Preview (Section 35) */}
          <div className="relative w-full aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {media.url ? (
              <Image
                src={media.url}
                alt={media.altText || media.fileName}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 500px"
                unoptimized={media.url.startsWith("/uploads/")}
              />
            ) : null}
          </div>

          {/* 2. Technical Metadata Grid (Section 25) */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <div>
              <span className="text-[10px] uppercase font-sans font-bold text-zinc-400 block mb-0.5">
                Dimensions
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {media.width && media.height ? `${media.width} × ${media.height} px` : "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans font-bold text-zinc-400 block mb-0.5">
                File Size
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formatBytes(media.fileSize)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans font-bold text-zinc-400 block mb-0.5">
                Format
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">
                {media.mimeType || "image"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans font-bold text-zinc-400 block mb-0.5">
                Article Usage
              </span>
              <span
                className={`font-semibold ${
                  usageCount > 0
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-zinc-500"
                }`}
              >
                {usageCount > 0 ? `In Use (${usageCount} articles)` : "Unused (Safe to delete)"}
              </span>
            </div>
          </div>

          {/* 3. Action Buttons (Copy URL & Replace Image) */}
          <div className="flex items-center gap-2">
            {/* Copy Public URL (Section 26) */}
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex-1 py-2 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{copied ? "Copied to Clipboard!" : "Copy Image URL"}</span>
            </button>

            {/* Replace Asset (Section 27) */}
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              disabled={isPending}
              className="py-2 px-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Replace Image
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleReplaceFile}
              className="hidden"
            />
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-start gap-2"
            >
              <svg className="w-4 h-4 shrink-0 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {saveSuccess && (
            <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ✓ Changes saved successfully.
            </div>
          )}

          {/* 4. Metadata Form (Section 22, 23, 24) */}
          <form onSubmit={handleSaveMetadata} className="space-y-4 pt-2">
            <div>
              <label htmlFor="edit-filename" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                File Name
              </label>
              <input
                id="edit-filename"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="edit-alt-text" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Alt Text (Accessibility)
                </label>
                <span className="text-[10px] text-zinc-400">Section 23</span>
              </div>
              <textarea
                id="edit-alt-text"
                rows={3}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe image content for screen readers and accessibility..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 leading-relaxed"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Distinguished from editorial captions. Avoid keyword stuffing.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="edit-caption" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Caption (Editorial Note)
                </label>
                <span className="text-[10px] text-zinc-400">Section 24</span>
              </div>
              <textarea
                id="edit-caption"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional editorial story caption and photo credit..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs uppercase font-bold tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* 5. Safe Deletion Trigger (Section 28) */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2 px-3 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors text-center"
              >
                Delete This Image
              </button>
            ) : (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-3">
                <p className="text-xs font-bold text-red-800 dark:text-red-300">
                  Are you sure you want to delete this media item?
                </p>
                <p className="text-[11px] text-red-700/80 dark:text-red-400 leading-relaxed">
                  If this image is actively referenced in any article, deletion will be blocked to prevent broken images.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleDeleteMedia}
                    className="flex-1 py-1.5 px-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="py-1.5 px-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

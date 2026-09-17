"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface MediaCardItem {
  id: string;
  url: string;
  fileName: string;
  altText: string | null;
  caption: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  createdAt: string | Date;
  _count?: {
    featuredInArticles: number;
    inlineInArticles: number;
  };
}

interface MediaCardProps {
  media: MediaCardItem;
  onClick?: (media: MediaCardItem) => void;
  isSelected?: boolean;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  const kb = bytes / k;
  if (kb < k) return `${Math.round(kb)} KB`;
  return `${(kb / k).toFixed(1)} MB`;
}

function getFormatLabel(mime?: string | null): string {
  if (!mime) return "IMG";
  if (mime.includes("png")) return "PNG";
  if (mime.includes("webp")) return "WEBP";
  if (mime.includes("avif")) return "AVIF";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
  return "IMG";
}

export function MediaCard({ media, onClick, isSelected }: MediaCardProps) {
  const [imgError, setImgError] = useState(false);

  const usageCount =
    (media._count?.featuredInArticles || 0) + (media._count?.inlineInArticles || 0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(media)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(media);
        }
      }}
      aria-label={`View details for image ${media.fileName}`}
      className={`group relative flex flex-col bg-white dark:bg-zinc-900 border transition-all duration-150 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${
        isSelected
          ? "border-red-600 dark:border-red-500 ring-2 ring-red-600/20 shadow-md"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs"
      }`}
    >
      {/* 1. Thumbnail Preview Container */}
      <div className="relative w-full aspect-4/3 bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden flex items-center justify-center">
        {!imgError && media.url ? (
          <Image
            src={media.url}
            alt={media.altText || media.fileName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-102"
            onError={() => setImgError(true)}
            unoptimized={media.url.startsWith("/uploads/")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-400 p-4 text-center">
            <svg
              className="w-8 h-8 mb-1 text-zinc-300 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] uppercase font-bold tracking-wider">Preview Unavailable</span>
          </div>
        )}

        {/* Format Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-zinc-950/80 text-white backdrop-blur-xs border border-white/10">
            {getFormatLabel(media.mimeType)}
          </span>
          {usageCount > 0 && (
            <span
              title={`Used in ${usageCount} article(s)`}
              className="px-1.5 py-0.5 text-[9px] font-sans font-bold uppercase bg-emerald-600 text-white shadow-xs"
            >
              In Use ({usageCount})
            </span>
          )}
        </div>

        {/* Dimensions overlay on hover */}
        {media.width && media.height && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-950/80 text-zinc-200 backdrop-blur-xs">
            {media.width} × {media.height}
          </div>
        )}
      </div>

      {/* 2. Metadata Footer */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col justify-between flex-1">
        <p
          className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
          title={media.fileName}
        >
          {media.fileName}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-800/50 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          <span>{formatBytes(media.fileSize)}</span>
          {media.width && media.height ? (
            <span>
              {media.width}×{media.height}
            </span>
          ) : (
            <span className="italic text-[10px]">Raster</span>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Image from "next/image";

export interface EditorialAuthor {
  name: string;
  role?: string | null;
  avatar?: string | null;
}

interface EditorialBylineProps {
  author: EditorialAuthor;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  className?: string;
}

/**
 * Formats date into standard international human-readable format: "September 15, 2026" (Section 64 & 65)
 */
export function formatEditorialDate(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Determines whether the article has undergone a meaningful update requiring display (Section 13).
 * Suppresses updated date if updated timestamp is within 48 hours of original publication.
 */
export function shouldDisplayUpdatedDate(
  publishedAt?: Date | string | null,
  updatedAt?: Date | string | null
): boolean {
  if (!publishedAt || !updatedAt) return false;
  const pubTime = new Date(publishedAt).getTime();
  const updTime = new Date(updatedAt).getTime();
  if (isNaN(pubTime) || isNaN(updTime)) return false;

  const diffMs = updTime - pubTime;
  const minimumMeaningfulUpdateMs = 48 * 60 * 60 * 1000; // 48 hours
  return diffMs > minimumMeaningfulUpdateMs;
}

/**
 * Editorial Byline Component (Sections 13, 14, 64, 65, 78)
 * Renders author avatar (with graceful fallback), name, editorial role, and verified dateline.
 */
export function EditorialByline({
  author,
  publishedAt,
  updatedAt,
  className = "",
}: EditorialBylineProps) {
  const formattedPublishDate = formatEditorialDate(publishedAt);
  const showUpdated = shouldDisplayUpdatedDate(publishedAt, updatedAt);
  const formattedUpdateDate = showUpdated ? formatEditorialDate(updatedAt) : null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-sans ${className}`}
    >
      {/* Author Details (Section 14 & 78) */}
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-zinc-300 dark:border-zinc-700">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 shrink-0"
            aria-hidden="true"
          >
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <span className="font-bold text-sm text-zinc-950 dark:text-zinc-50 block leading-tight">
            By {author.name}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs">
            {author.role || "Gnosis Staff Correspondent"}
          </span>
        </div>
      </div>

      {/* Dateline & Timestamp (Section 13, 64, 65) */}
      <div className="text-left sm:text-right">
        {formattedPublishDate && (
          <div className="text-zinc-700 dark:text-zinc-300 font-medium">
            Published <time dateTime={new Date(publishedAt!).toISOString()}>{formattedPublishDate}</time>
          </div>
        )}
        {formattedUpdateDate && (
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
            Updated <time dateTime={new Date(updatedAt!).toISOString()}>{formattedUpdateDate}</time>
          </div>
        )}
      </div>
    </div>
  );
}

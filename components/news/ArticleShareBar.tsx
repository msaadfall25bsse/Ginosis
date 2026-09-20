"use client";

import React, { useState } from "react";

interface ArticleShareBarProps {
  title: string;
  slug: string;
  className?: string;
}

/**
 * Builds standard social share intent URLs using the canonical article route (Sections 33, 34, 52)
 */
export function getSocialShareUrls(title: string, slug: string, baseUrl = "") {
  const canonicalUrl = `${baseUrl}/news/${encodeURIComponent(slug)}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(canonicalUrl);

  return {
    canonicalUrl,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20article:%20${encodedUrl}`,
  };
}

/**
 * Editorial Article Share Bar Component (Sections 33, 34, 42, 70)
 * Lightweight, non-intrusive client component providing 1-click clipboard copy
 * with temporary "Link copied" feedback and standard social sharing intents.
 */
export function ArticleShareBar({
  title,
  slug,
  className = "",
}: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  // Derive origin in browser or fallback to canonical path
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrls = getSocialShareUrls(title, slug, origin);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrls.canonicalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback for browsers with restricted clipboard permissions
    }
  };

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrls.canonicalUrl,
        });
      } catch {
        // User dismissed native share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      role="region"
      aria-label="Share this story"
      className={`flex items-center flex-wrap gap-2.5 py-3 text-xs text-zinc-600 dark:text-zinc-400 font-sans ${className}`}
    >
      <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-500 dark:text-zinc-400 mr-1 select-none">
        Share:
      </span>

      {/* 1-Click Copy Link with Feedback (Section 34) */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 ${
          copied
            ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-600"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
        aria-label="Copy story link to clipboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
          <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
        </svg>
        <span>{copied ? "Link copied" : "Copy Link"}</span>
      </button>

      {/* X / Twitter Intent (Section 33) */}
      <a
        href={shareUrls.x}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Share on X"
      >
        <span>X</span>
      </a>

      {/* Facebook Intent (Section 33) */}
      <a
        href={shareUrls.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <span>Facebook</span>
      </a>

      {/* LinkedIn Intent (Section 33) */}
      <a
        href={shareUrls.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <span>LinkedIn</span>
      </a>

      {/* Email Intent (Section 33) */}
      <a
        href={shareUrls.email}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Share via Email"
      >
        <span>Email</span>
      </a>
    </div>
  );
}

import React from "react";
import Image from "next/image";

export interface FeaturedImageData {
  url: string;
  altText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

interface ArticleFeaturedImageProps {
  image: FeaturedImageData;
  articleTitle: string;
  priority?: boolean;
}

/**
 * Editorial Article Featured Image Component (Sections 16, 17, 20, 61, 62, 78)
 * Renders the hero photograph with 16:9 aspect ratio, Next.js optimization,
 * accessible alt text, and conditional non-empty caption.
 */
export function ArticleFeaturedImage({
  image,
  articleTitle,
  priority = true,
}: ArticleFeaturedImageProps) {
  if (!image || !image.url) {
    return null;
  }

  const effectiveAlt = (image.altText && image.altText.trim()) || articleTitle || "Article image";
  const hasCaption = Boolean(image.caption && image.caption.trim());

  return (
    <figure className="space-y-2.5 my-8">
      {/* 16:9 Hero Image Container (Section 16 & 17) */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Image
          src={image.url}
          alt={effectiveAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 896px"
          className="object-cover"
        />
      </div>

      {/* Image Caption - strictly omitted if empty (Section 20 & 78) */}
      {hasCaption && (
        <figcaption className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-serif italic text-right px-1">
          {image.caption!.trim()}
        </figcaption>
      )}
    </figure>
  );
}

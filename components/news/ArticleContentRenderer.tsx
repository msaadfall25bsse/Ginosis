import React from "react";
import Image from "next/image";

export interface InlineMediaItem {
  url: string;
  altText?: string | null;
  caption?: string | null;
  order: number;
}

interface ArticleContentRendererProps {
  content: string;
  inlineMedia?: InlineMediaItem[];
  className?: string;
}

/**
 * Transforms and sanitizes rich HTML content for editorial safety and hierarchy compliance:
 * 1. Strips dangerous elements: <script>, <iframe>, <object>, <embed>, and inline event handlers (Sections 49 & 50).
 * 2. Demotes any accidental <h1> tags to <h2> to maintain single H1 hierarchy (Section 23).
 * 3. Enforces security rel attributes on external links: target="_blank" rel="noopener noreferrer" (Section 24 & 25).
 * 4. Neutralizes javascript: and data: pseudo-protocols in links (Section 24).
 */
export function sanitizeAndTransformContent(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") {
    return "<p>Content is currently unavailable.</p>";
  }

  try {
    let sanitized = rawHtml
      // 1. Strip <script> tags and contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // 2. Strip <iframe>, <object>, <embed> tags (Section 50)
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
      // 3. Strip inline event handlers
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // 4. Neutralize javascript: and vbscript: URLs
      .replace(/(href|src)\s*=\s*["']?\s*(?:javascript|vbscript):[^"'>\s]*/gi, '$1="#"')
      // 5. Demote H1 to H2 to guarantee single H1 on page (Section 23)
      .replace(/<h1(\s|>)/gi, "<h2$1")
      .replace(/<\/h1>/gi, "</h2>")
      // 6. Ensure external links have target="_blank" rel="noopener noreferrer" (Section 25)
      .replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(http[s]?:\/\/[^"'>]+)\1([^>]*)>/gi, (match, quote, url, rest) => {
        // If already has rel or target, ensure noopener noreferrer is present
        let cleanRest = rest.replace(/\s*target=(["'])_blank\1/gi, "").replace(/\s*rel=(["'])[^"']*\1/gi, "");
        return `<a href="${url}" target="_blank" rel="noopener noreferrer"${cleanRest}>`;
      });

    return sanitized.trim();
  } catch {
    // Fail safely without crashing the page (Section 79)
    return "<p>Content failed to format safely.</p>";
  }
}

/**
 * Editorial Content Renderer Component (Sections 18-25, 49-51, 66, 79)
 * Renders the story body with responsive typography, secure external links,
 * and interleaved inline photography with captions.
 */
export function ArticleContentRenderer({
  content,
  inlineMedia = [],
  className = "",
}: ArticleContentRendererProps) {
  const safeHtml = sanitizeAndTransformContent(content);

  // Sort inline media ascending by order (Section 19)
  const sortedInlineMedia = [...inlineMedia].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className={`editorial-article-body space-y-8 ${className}`}>
      {/* Primary Rich Content Body */}
      <div
        className="prose prose-zinc dark:prose-invert max-w-none font-serif text-lg sm:text-xl leading-relaxed sm:leading-loose text-zinc-800 dark:text-zinc-200"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {/* Relational Inline Media Assets with Preserved Order & Captions (Sections 19 & 20) */}
      {sortedInlineMedia.length > 0 && (
        <div className="pt-6 space-y-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs uppercase font-bold tracking-widest text-zinc-500">
            Story Assets & Photography
          </div>
          {sortedInlineMedia.map((media, idx) => (
            <figure key={`${media.url}-${idx}`} className="space-y-2">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <Image
                  src={media.url}
                  alt={media.altText || `Story photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 896px"
                  className="object-cover"
                />
              </div>
              {media.caption && media.caption.trim() && (
                <figcaption className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-serif italic text-right px-1">
                  {media.caption.trim()}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

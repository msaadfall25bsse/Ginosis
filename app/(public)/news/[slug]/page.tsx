import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
  getLatestPublishedArticles,
} from "@/lib/repositories/article.repository";
import { PLACEHOLDER_ARTICLES } from "@/lib/placeholder-data";
import { isValidPublicSlug } from "@/lib/articles/slug";

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for canonical public article route
 */
export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidPublicSlug(slug)) {
    return {
      title: "Story Not Found | GNOSIS",
    };
  }

  try {
    const article = await getPublishedArticleBySlug(slug);
    if (article) {
      const metaTitle = article.seo?.seoTitle || article.title;
      const metaDesc = article.seo?.metaDescription || article.excerpt;
      return {
        title: `${metaTitle} | GNOSIS`,
        description: metaDesc,
      };
    }
  } catch {
    // Database connection fallback
  }

  // Fallback to placeholder if match
  const placeholder = PLACEHOLDER_ARTICLES.find((a) => a.slug === slug);
  if (placeholder) {
    return {
      title: `${placeholder.title} | GNOSIS`,
      description: placeholder.excerpt,
    };
  }

  return {
    title: "Story Not Found | GNOSIS",
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;

  // 1. Safety validation: immediately 404 on malformed/invalid slugs (Section 74)
  if (!isValidPublicSlug(slug)) {
    notFound();
  }

  // 2. Fetch published article via secure repository layer (Sections 4-9, 43, 73)
  let dbArticle = null;
  try {
    dbArticle = await getPublishedArticleBySlug(slug);
  } catch {
    // Database offline or query issue
  }

  // 3. Fallback to placeholder data if not in DB (for Phase 1 static mock compatibility)
  const placeholder = !dbArticle
    ? PLACEHOLDER_ARTICLES.find((a) => a.slug === slug)
    : null;

  if (!dbArticle && !placeholder) {
    notFound();
  }

  // Format dates consistently (Section 64 & 65)
  const formatEditorialDate = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  // 4. Normalize article data
  const article = dbArticle
    ? {
        id: dbArticle.id,
        title: dbArticle.title,
        excerpt: dbArticle.excerpt,
        content: dbArticle.content,
        primaryCategoryId: dbArticle.primaryCategory.id,
        category: dbArticle.primaryCategory.name,
        categorySlug: dbArticle.primaryCategory.slug,
        author: {
          name: dbArticle.author.name,
          role: dbArticle.author.role || "Staff Reporter",
          avatar: dbArticle.author.avatar,
        },
        publishedAt: formatEditorialDate(dbArticle.publishedAt),
        updatedAt:
          dbArticle.updatedAt &&
          dbArticle.publishedAt &&
          new Date(dbArticle.updatedAt).getTime() - new Date(dbArticle.publishedAt).getTime() >
            86400000 * 2 // Only show updated if updated > 2 days after publication (Section 13)
            ? formatEditorialDate(dbArticle.updatedAt)
            : null,
        featuredImage: dbArticle.featuredImage
          ? {
              url: dbArticle.featuredImage.url,
              altText: dbArticle.featuredImage.altText || dbArticle.title,
              caption: dbArticle.featuredImage.caption,
            }
          : null,
        tags: dbArticle.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          slug: t.tag.slug,
        })),
        inlineMedia: dbArticle.inlineMedia.map((im) => ({
          url: im.media.url,
          altText: im.media.altText || "",
          caption: im.caption || im.media.caption,
          order: im.order,
        })),
      }
    : {
        id: "placeholder-" + placeholder!.slug,
        title: placeholder!.title,
        excerpt: placeholder!.excerpt,
        content: `<p class="lead">${placeholder!.excerpt}</p><p>International diplomats and industry leaders convened earlier today to discuss strategic implementation frameworks. Further briefings will follow as working sessions continue.</p>`,
        primaryCategoryId: "cat-" + placeholder!.primaryCategory,
        category: placeholder!.primaryCategory.toUpperCase(),
        categorySlug: placeholder!.primaryCategory,
        author: {
          name: placeholder!.author.name,
          role: placeholder!.author.role || "Staff Reporter",
          avatar: placeholder!.author.avatar || null,
        },
        publishedAt: formatEditorialDate(placeholder!.publishedAt),
        updatedAt: null,
        featuredImage: placeholder!.imageUrl
          ? {
              url: placeholder!.imageUrl,
              altText: placeholder!.title,
              caption: placeholder!.imageCaption || null,
            }
          : null,
        tags: (placeholder!.tags || []).map((t) => ({ id: t, name: t, slug: t })),
        inlineMedia: [],
      };

  // 5. Fetch related & latest stories server-side (Sections 27-30)
  let relatedArticles: any[] = [];
  let latestArticles: any[] = [];

  if (dbArticle) {
    try {
      [relatedArticles, latestArticles] = await Promise.all([
        getRelatedArticles({
          currentArticleId: dbArticle.id,
          primaryCategoryId: dbArticle.primaryCategory.id,
          tagIds: dbArticle.tags.map((t) => t.tag.id),
          limit: 4,
        }),
        getLatestPublishedArticles({
          limit: 4,
          excludeId: dbArticle.id,
        }),
      ]);
    } catch {
      // Non-blocking query failure
    }
  }

  return (
    <article className="py-8 sm:py-12" itemScope itemType="https://schema.org/NewsArticle">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section Breadcrumb & Category (Section 10, 15, 32) */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500">
            <Link href="/" className="hover:underline text-zinc-500">
              Home
            </Link>
            <span className="text-zinc-400" aria-hidden="true">
              /
            </span>
            <Link
              href={`/${article.categorySlug}`}
              className="hover:underline font-bold"
            >
              {article.category}
            </Link>
          </nav>

          {/* Headline (Section 11 & 23 - exactly one H1) */}
          <h1
            itemProp="headline"
            className="font-editorial text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.15]"
          >
            {article.title}
          </h1>

          {/* Standfirst / Excerpt (Section 12) */}
          {article.excerpt && (
            <p className="font-serif text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-2 border-red-700 pl-4 py-1">
              {article.excerpt}
            </p>
          )}

          {/* Byline & Dateline (Section 13, 14, 64) */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <div className="flex items-center gap-3">
              {article.author.avatar && (
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  By {article.author.name}
                </span>
                <span className="text-zinc-500 text-[11px]">
                  {article.author.role}
                </span>
              </div>
            </div>

            <div className="text-right">
              {article.publishedAt && (
                <div className="text-zinc-600 dark:text-zinc-400">
                  Published <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                </div>
              )}
              {article.updatedAt && (
                <div className="text-zinc-500 dark:text-zinc-500 text-[11px]">
                  Updated <time dateTime={article.updatedAt}>{article.updatedAt}</time>
                </div>
              )}
            </div>
          </div>

          {/* Hero / Featured Image (Section 16, 17, 61, 62) */}
          {article.featuredImage && (
            <figure className="space-y-2">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={article.featuredImage.url}
                  alt={article.featuredImage.altText}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
              {article.featuredImage.caption && (
                <figcaption className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic text-right">
                  {article.featuredImage.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body Content (Section 18, 21, 22, 49) */}
          <div
            className="prose prose-zinc dark:prose-invert max-w-none font-serif text-base sm:text-lg leading-relaxed space-y-6 pt-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags (Section 26) */}
          {article.tags.length > 0 && (
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-3">
                Related Topics:
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="pt-6">
            <Link
              href={`/${article.categorySlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500 hover:underline"
            >
              ← Back to {article.category} Section
            </Link>
          </div>
        </div>
      </Container>
    </article>
  );
}

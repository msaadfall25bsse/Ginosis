import React from "react";
import { Metadata } from "next";
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
import { ArticleHeader } from "@/components/news/ArticleHeader";
import { EditorialByline } from "@/components/news/EditorialByline";
import { ArticleFeaturedImage } from "@/components/news/ArticleFeaturedImage";
import { ArticleContentRenderer } from "@/components/news/ArticleContentRenderer";
import { ArticleTags } from "@/components/news/ArticleTags";

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Dynamic metadata generation for canonical public article route
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
    // Fallback if DB is temporarily unreachable
  }

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

/**
 * Canonical Public Article Page (Phase 6 Sections 10-26, 37-39, 71-72)
 */
export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;

  // 1. Safety validation: immediately 404 on malformed/invalid slugs (Section 74)
  if (!isValidPublicSlug(slug)) {
    notFound();
  }

  // 2. Query published article via secure repository layer (Sections 4-9, 43, 73)
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

  // 4. Normalize article data shape
  const article = dbArticle
    ? {
        id: dbArticle.id,
        title: dbArticle.title,
        excerpt: dbArticle.excerpt,
        content: dbArticle.content,
        category: dbArticle.primaryCategory.name,
        categorySlug: dbArticle.primaryCategory.slug,
        author: {
          name: dbArticle.author.name,
          role: dbArticle.author.role || "Staff Correspondent",
          avatar: dbArticle.author.avatar,
        },
        publishedAt: dbArticle.publishedAt,
        updatedAt: dbArticle.updatedAt,
        featuredImage: dbArticle.featuredImage
          ? {
              url: dbArticle.featuredImage.url,
              altText: dbArticle.featuredImage.altText || dbArticle.title,
              caption: dbArticle.featuredImage.caption,
              width: dbArticle.featuredImage.width,
              height: dbArticle.featuredImage.height,
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
        category: placeholder!.primaryCategory.toUpperCase(),
        categorySlug: placeholder!.primaryCategory,
        author: {
          name: placeholder!.author.name,
          role: placeholder!.author.role || "Staff Correspondent",
          avatar: placeholder!.author.avatar || null,
        },
        publishedAt: placeholder!.publishedAt,
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

  return (
    <article
      className="py-8 sm:py-12 lg:py-16"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 1. Header (Breadcrumb, Single H1 Headline, Standfirst / Excerpt) */}
          <ArticleHeader
            title={article.title}
            category={article.category}
            categorySlug={article.categorySlug}
            excerpt={article.excerpt}
          />

          {/* 2. Byline & Dateline (Author name, role, avatar, published/updated dates) */}
          <EditorialByline
            author={article.author}
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
          />

          {/* 3. Hero / Featured Image (16:9 Aspect Ratio, Priority, Caption) */}
          {article.featuredImage && (
            <ArticleFeaturedImage
              image={article.featuredImage}
              articleTitle={article.title}
              priority
            />
          )}

          {/* 4. Rich Article Content (Sanitized, Single H1, Safe External Links, Inline Media) */}
          <main>
            <ArticleContentRenderer
              content={article.content}
              inlineMedia={article.inlineMedia}
            />
          </main>

          {/* 5. Article Tags (Topics rendered as non-link badges) */}
          {article.tags.length > 0 && <ArticleTags tags={article.tags} />}

          {/* 6. Section Navigation */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Link
              href={`/${article.categorySlug}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500 hover:underline transition-colors"
            >
              <span aria-hidden="true">←</span>
              <span>Back to {article.category} Hub</span>
            </Link>
          </div>
        </div>
      </Container>
    </article>
  );
}

import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getArticleBySlug } from "@/lib/repositories/article.repository";
import { PLACEHOLDER_ARTICLES } from "@/lib/placeholder-data";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Dynamic metadata generation for individual news articles
 */
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Try DB article
  let articleTitle = "";
  let articleExcerpt = "";

  try {
    const dbArticle = await getArticleBySlug(slug);
    if (dbArticle) {
      articleTitle = dbArticle.seo?.seoTitle || dbArticle.title;
      articleExcerpt = dbArticle.seo?.metaDescription || dbArticle.excerpt;
    }
  } catch {
    // Graceful fallback to static data
  }

  // 2. Fallback to placeholder articles
  if (!articleTitle) {
    const placeholder = PLACEHOLDER_ARTICLES.find((a) => a.slug === slug);
    if (placeholder) {
      articleTitle = placeholder.title;
      articleExcerpt = placeholder.excerpt;
    }
  }

  if (!articleTitle) {
    return {
      title: "Article Not Found | GNOSIS",
    };
  }

  return {
    title: `${articleTitle} | GNOSIS`,
    description: articleExcerpt,
  };
}

export default async function DynamicArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // 1. Query Database Article
  let dbArticle = null;
  try {
    dbArticle = await getArticleBySlug(slug);
  } catch {
    // Database connection may be offline in dev/preview
  }

  // 2. Fallback to Placeholder Article if DB record not found
  const placeholder = !dbArticle
    ? PLACEHOLDER_ARTICLES.find((a) => a.slug === slug)
    : null;

  if (!dbArticle && !placeholder) {
    notFound();
  }

  // Normalize article data shape for presentation
  const article = dbArticle
    ? {
        title: dbArticle.title,
        excerpt: dbArticle.excerpt,
        content: dbArticle.content,
        category: dbArticle.primaryCategory.name,
        categorySlug: dbArticle.primaryCategory.slug,
        authorName: dbArticle.author.name,
        authorRole: dbArticle.author.role || "Staff Journalist",
        publishedAt: dbArticle.publishedAt
          ? new Date(dbArticle.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "Recently Published",
        imageUrl: dbArticle.featuredImage?.url || null,
        imageCaption: dbArticle.featuredImage?.caption || null,
        tags: dbArticle.tags.map((t) => t.tag.name),
      }
    : {
        title: placeholder!.title,
        excerpt: placeholder!.excerpt,
        content: `<p class="lead">${placeholder!.excerpt}</p><p>International diplomats and industry leaders convened earlier today to discuss strategic implementation frameworks. Further briefings will follow as working sessions continue.</p>`,
        category: placeholder!.primaryCategory.toUpperCase(),
        categorySlug: placeholder!.primaryCategory,
        authorName: placeholder!.author.name,
        authorRole: placeholder!.author.role,
        publishedAt: new Date(placeholder!.publishedAt).toLocaleDateString(
          "en-US",
          { month: "long", day: "numeric", year: "numeric" }
        ),
        imageUrl: placeholder!.imageUrl,
        imageCaption: placeholder!.imageCaption || null,
        tags: placeholder!.tags || [],
      };

  return (
    <article className="py-8 sm:py-12">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section Breadcrumb & Category */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500">
            <Link href="/" className="hover:underline text-zinc-500">
              Home
            </Link>
            <span className="text-zinc-400">/</span>
            <Link
              href={`/${article.categorySlug}`}
              className="hover:underline font-bold"
            >
              {article.category}
            </Link>
          </div>

          {/* Headline */}
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.15]">
            {article.title}
          </h1>

          {/* Standfirst / Excerpt */}
          {article.excerpt && (
            <p className="font-serif text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-2 border-red-700 pl-4 py-1">
              {article.excerpt}
            </p>
          )}

          {/* Byline & Dateline */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                By {article.authorName}
              </span>
              <span>•</span>
              <span>{article.authorRole}</span>
            </div>
            <time className="text-zinc-500">{article.publishedAt}</time>
          </div>

          {/* Hero Image */}
          {article.imageUrl && (
            <figure className="space-y-2">
              <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
              {article.imageCaption && (
                <figcaption className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic text-right">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body */}
          <div
            className="prose prose-zinc dark:prose-invert max-w-none font-serif text-base sm:text-lg leading-relaxed space-y-6 pt-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-3">
                Related Topics:
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to section navigation */}
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

import React from "react";
import Link from "next/link";
import { CategorySlug, NewsArticlePlaceholder } from "@/types/news";
import { CATEGORIES } from "@/config/navigation";
import { PLACEHOLDER_ARTICLES } from "@/lib/placeholder-data";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublishedArticlesByCategory } from "@/lib/repositories/article.repository";

interface CategoryViewProps {
  categorySlug: CategorySlug;
}

/**
 * Editorial Category View Component (Phase 6 Sections 53-58, 69, 75, 85)
 * Asynchronously queries published articles for the specified category,
 * displays the latest story as lead, secondary stories in a responsive 3-column grid,
 * and renders Section 58 compliant empty state when no published stories exist.
 */
export async function CategoryView({ categorySlug }: CategoryViewProps) {
  const categoryInfo = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!categoryInfo) {
    return (
      <Container className="py-12">
        <EmptyState
          title="Section Not Found"
          description="The news section you requested does not exist."
        />
      </Container>
    );
  }

  // 1. Fetch real published articles from database (Sections 53-55)
  let dbArticles: any[] = [];
  let isDbConnected = false;

  try {
    dbArticles = await getPublishedArticlesByCategory(categorySlug, 20);
    isDbConnected = true;
  } catch {
    // Database connection offline fallback
    isDbConnected = false;
  }

  // 2. Normalize articles to card shape
  let articles: NewsArticlePlaceholder[] = [];

  if (isDbConnected) {
    articles = dbArticles.map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || "",
      primaryCategory: categorySlug,
      tags: [],
      author: {
        name: art.author.name,
        role: art.author.role || "Staff Correspondent",
        avatar: art.author.avatar || undefined,
      },
      publishedAt: art.publishedAt
        ? new Date(art.publishedAt).toISOString()
        : new Date().toISOString(),
      readTime: "4 min read",
      imageUrl: art.featuredImage?.url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200",
      imageCaption: art.featuredImage?.caption || undefined,
      isFeatured: true,
    }));
  } else {
    // Offline local preview fallback
    articles = PLACEHOLDER_ARTICLES.filter(
      (a) =>
        a.primaryCategory === categorySlug ||
        (a.additionalCategories && a.additionalCategories.includes(categorySlug))
    );
  }

  const leadArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="py-6 sm:py-8 space-y-10">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {categoryInfo.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-4 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
            {categoryInfo.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl font-serif">
            {categoryInfo.description}
          </p>
        </div>

        {/* Content Section: Compliant Empty State (Section 58) */}
        {articles.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-2">
              No stories are available in this category yet.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 font-serif">
              Our international news desk is continuously reviewing and publishing verified reports. Please check back shortly.
            </p>
            <Link
              href="/"
              className="inline-block text-xs uppercase font-bold tracking-wider bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Lead / Featured Story for Category (Section 57) */}
            {leadArticle && (
              <div>
                <FeaturedNewsCard article={leadArticle} priority />
              </div>
            )}

            {/* Other Stories in Section (Responsive 3-Column Grid, Sections 54 & 69) */}
            {otherArticles.length > 0 && (
              <div>
                <SectionHeader title={`More in ${categoryInfo.name}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherArticles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

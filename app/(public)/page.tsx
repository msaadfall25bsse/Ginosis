import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import { CompactNewsCard } from "@/components/news/CompactNewsCard";
import {
  getLatestPublishedArticles,
  getTrendingArticles,
} from "@/lib/repositories/article.repository";
import { PLACEHOLDER_ARTICLES } from "@/lib/placeholder-data";
import { NewsArticlePlaceholder } from "@/types/news";

export default async function HomePage() {
  let dbArticles: any[] = [];
  let dbTrending: any[] = [];
  let isDbConnected = false;

  try {
    [dbArticles, dbTrending] = await Promise.all([
      getLatestPublishedArticles({ limit: 12 }),
      getTrendingArticles({ limit: 4 }),
    ]);
    isDbConnected = true;
  } catch {
    isDbConnected = false;
  }

  let articles: NewsArticlePlaceholder[] = [];

  if (isDbConnected && dbArticles.length > 0) {
    articles = dbArticles.map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || "",
      primaryCategory: (art.primaryCategory?.slug as any) || "world",
      tags: [],
      author: {
        name: art.author?.name || "Staff Reporter",
        role: art.author?.role || "Staff Correspondent",
        avatar: art.author?.avatar || undefined,
      },
      publishedAt: art.publishedAt
        ? new Date(art.publishedAt).toISOString()
        : new Date().toISOString(),
      readTime: "4 min read",
      imageUrl: art.featuredImage?.url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200",
      imageCaption: art.featuredImage?.caption || undefined,
      isFeatured: true,
    }));
  }

  const trendingArticles: NewsArticlePlaceholder[] =
    dbTrending.length > 0
      ? dbTrending.map((art) => ({
          id: art.id,
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt || "",
          primaryCategory: (art.primaryCategory?.slug as any) || "world",
          tags: [],
          author: {
            name: art.author?.name || "Staff Reporter",
            role: art.author?.role || "Staff Correspondent",
            avatar: art.author?.avatar || undefined,
          },
          publishedAt: art.publishedAt
            ? new Date(art.publishedAt).toISOString()
            : new Date().toISOString(),
          readTime: "4 min read",
          imageUrl: art.featuredImage?.url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200",
          imageCaption: art.featuredImage?.caption || undefined,
          isFeatured: true,
        }))
      : (articles.length >= 5 ? articles.slice(1, 5) : PLACEHOLDER_ARTICLES.slice(1, 5));

  const leadArticle = articles[0] || PLACEHOLDER_ARTICLES[0];
  const secondaryArticles = articles.length >= 3 ? articles.slice(1, 3) : PLACEHOLDER_ARTICLES.slice(1, 3);
  const categoryHighlights = articles.length >= 8 ? articles.slice(3, 7) : PLACEHOLDER_ARTICLES.slice(3, 7);
  const moreNews = articles.length >= 12 ? articles.slice(7, 11) : PLACEHOLDER_ARTICLES.slice(2, 6);
  const briefingArticles = articles.length >= 4 ? articles.slice(0, 4) : PLACEHOLDER_ARTICLES.slice(0, 4);

  return (
    <div className="py-6 sm:py-8 space-y-12">
      {/* 1. Lead / Hero Section */}
      <section aria-label="Lead Stories">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Featured Story (7 cols) */}
            <div className="lg:col-span-8">
              <FeaturedNewsCard article={leadArticle} priority />
            </div>

            {/* Side Secondary Headlines (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-1.5 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-500">
                  Key Developments
                </span>
              </div>
              {secondaryArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  layout="horizontal"
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Trending / Important Stories Bar */}
      <section aria-label="Trending Stories" className="bg-zinc-100 dark:bg-zinc-900/60 py-8 border-y border-zinc-200 dark:border-zinc-800">
        <Container>
          <SectionHeader
            title="Trending Now"
            linkText="Discover more"
            href="/world"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingArticles.map((article, index) => (
              <div
                key={article.id}
                className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs"
              >
                <CompactNewsCard
                  article={article}
                  index={index}
                  showIndex
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. Category Highlights */}
      <section aria-label="Category Highlights">
        <Container>
          <SectionHeader
            title="Editorial Highlights"
            href="/technology"
            linkText="Browse all sections"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryHighlights.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Latest News Feed Grid */}
      <section aria-label="Latest News">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <SectionHeader title="Latest Dispatch" href="/world" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moreNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Sidebar Opinion / Analysis Placeholder */}
            <aside className="lg:col-span-4 border-l border-zinc-200 dark:border-zinc-800 lg:pl-8">
              <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-2 mb-4">
                <h3 className="text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-sans">
                  The Briefing
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                Essential context, global policy analysis, and verified reporting updated throughout the day.
              </p>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {briefingArticles.map((art, idx) => (
                  <CompactNewsCard key={art.id} article={art} index={idx} />
                ))}
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}

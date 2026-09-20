import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/discovery/SearchBar";
import { SearchResults } from "@/components/discovery/SearchResults";
import { SearchResultCard } from "@/components/discovery/SearchResultCard";
import {
  searchPublishedArticles,
  getLatestPublishedArticles,
} from "@/lib/repositories/article.repository";
import { validateSearchQuery, validatePagination } from "@/lib/search/validation";
import { PLACEHOLDER_ARTICLES } from "@/lib/placeholder-data";
import { CATEGORIES } from "@/config/navigation";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const rawQuery = resolvedParams?.q || "";
  const { isValid, query } = validateSearchQuery(rawQuery);

  if (isValid && query) {
    return {
      title: `Search: ${query} — Gnosis`,
      description: `Search results for "${query}" across Gnosis international journalism.`,
    };
  }

  return {
    title: "Search — Gnosis",
    description: "Search international news, politics, technology, and analysis on Gnosis.",
  };
}

/**
 * Editorial Search Page Route (Phase 7 Sections 5-10, 16-19, 58-64, 88, 114, 126)
 * Server-rendered search route handling query validation, deterministic ranking,
 * pagination, and Section 126 discovery fallback when no search term is entered.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const rawQuery = resolvedParams?.q || "";
  const rawPage = resolvedParams?.page;
  const rawCategory = resolvedParams?.category;

  const { isValid, query: cleanQuery } = validateSearchQuery(rawQuery);
  const { page } = validatePagination(rawPage, 10);

  // If query is present and valid, run server-side search (Section 20 & 88)
  if (isValid && cleanQuery) {
    const searchResult = await searchPublishedArticles(cleanQuery, {
      page,
      pageSize: 10,
      categorySlug: rawCategory,
    });

    return (
      <main id="main-content" className="py-6 sm:py-10">
        <Container className="max-w-4xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-800 dark:text-zinc-200 font-semibold" aria-current="page">
                Search
              </li>
            </ol>
          </nav>

          <header className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <h1 className="text-3xl sm:text-4xl font-black font-editorial text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
              Search Gnosis
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Verified global dispatches, investigative reporting, and international analysis.
            </p>
            <div className="mt-6">
              <SearchBar
                initialQuery={cleanQuery}
                initialCategory={rawCategory || ""}
                autoFocus={false}
              />
            </div>
          </header>

          <SearchResults
            articles={searchResult.articles}
            totalCount={searchResult.totalCount}
            totalPages={searchResult.totalPages}
            currentPage={searchResult.page}
            query={cleanQuery}
            category={rawCategory}
          />
        </Container>
      </main>
    );
  }

  // Section 126: When no query is provided, show discovery fallback instead of empty page
  // "Do not trigger a database search without a query."
  let fallbackArticles: any[] = [];
  try {
    fallbackArticles = await getLatestPublishedArticles({ limit: 6 });
  } catch {
    fallbackArticles = [];
  }

  // Graceful offline fallback
  const discoveryItems =
    fallbackArticles.length > 0
      ? fallbackArticles
      : PLACEHOLDER_ARTICLES.slice(0, 6).map((art) => ({
          id: art.id,
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          publishedAt: art.publishedAt,
          primaryCategory: {
            id: art.primaryCategory,
            name: art.primaryCategory.toUpperCase(),
            slug: art.primaryCategory,
          },
          featuredImage: {
            id: "placeholder",
            url: art.imageUrl,
            altText: art.title,
            caption: null,
          },
          author: {
            id: "author",
            name: art.author.name,
            avatar: null,
            role: "Correspondent",
          },
        }));

  return (
    <main id="main-content" className="py-6 sm:py-10">
      <Container className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-zinc-800 dark:text-zinc-200 font-semibold" aria-current="page">
              Search
            </li>
          </ol>
        </nav>

        {/* Masthead Header */}
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-editorial text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
            Search The Publication
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Enter keywords, topics, policy areas, or reporter names to explore verified Gnosis coverage.
          </p>
          <div className="mt-6 text-left">
            <SearchBar
              initialQuery=""
              initialCategory=""
              autoFocus={true}
              placeholder="Search by topic, headline, or keyword..."
            />
          </div>

          {/* Quick Categories Bar */}
          <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Popular Sections:</span>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </header>

        {/* Section 126 Discovery Section: Latest News Fallback */}
        <section aria-label="Latest Published Stories" className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-2 mb-6 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider font-sans text-zinc-900 dark:text-zinc-100">
              Latest Dispatches
            </h2>
            <Link
              href="/"
              className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {discoveryItems.map((article: any) => (
              <SearchResultCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}

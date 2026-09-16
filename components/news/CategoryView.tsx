import React from "react";
import Link from "next/link";
import { CategorySlug } from "@/types/news";
import { CATEGORIES } from "@/config/navigation";
import { PLACEHOLDER_ARTICLES } from "@/lib/placeholder-data";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { NewsCard } from "@/components/news/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface CategoryViewProps {
  categorySlug: CategorySlug;
}

export function CategoryView({ categorySlug }: CategoryViewProps) {
  const categoryInfo = CATEGORIES.find((c) => c.slug === categorySlug);
  
  // Find articles matching primary or additional category
  const matchingArticles = PLACEHOLDER_ARTICLES.filter(
    (a) =>
      a.primaryCategory === categorySlug ||
      (a.additionalCategories && a.additionalCategories.includes(categorySlug))
  );

  const leadArticle = matchingArticles[0];
  const otherArticles = matchingArticles.slice(1);

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

  return (
    <div className="py-6 sm:py-8 space-y-10">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            <li>
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
              {categoryInfo.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
            {categoryInfo.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
            {categoryInfo.description}
          </p>
        </div>

        {/* Content Section */}
        {matchingArticles.length === 0 ? (
          <EmptyState
            title={`No ${categoryInfo.name} Stories Yet`}
            description="Our editorial team is currently preparing coverage for this section. Check back shortly for updates."
          />
        ) : (
          <div className="space-y-10">
            {/* Top lead story for category */}
            {leadArticle && (
              <div>
                <FeaturedNewsCard article={leadArticle} priority />
              </div>
            )}

            {/* Other stories in section */}
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

import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ArticleStatus } from "@prisma/client";

/**
 * Standard relational include for article queries
 */
export const articleDefaultInclude = {
  primaryCategory: true,
  categories: {
    include: {
      category: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
  author: true,
  featuredImage: true,
  inlineMedia: {
    include: {
      media: true,
    },
    orderBy: {
      order: "asc" as const,
    },
  },
  seo: true,
};

export async function getPublishedArticles(limit = 20, skip = 0) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
    },
    include: articleDefaultInclude,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
    skip,
  });
}

export async function getLatestArticles(limit = 10) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
    },
    include: articleDefaultInclude,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: articleDefaultInclude,
  });
}

export async function getArticlesByCategory(categorySlug: string, limit = 20) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { primaryCategory: { slug: categorySlug } },
        { categories: { some: { category: { slug: categorySlug } } } },
      ],
    },
    include: articleDefaultInclude,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

export async function getArticlesByTag(tagSlug: string, limit = 20) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      tags: {
        some: {
          tag: { slug: tagSlug },
        },
      },
    },
    include: articleDefaultInclude,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

export async function getAuthorArticles(authorSlug: string, limit = 20) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      author: { slug: authorSlug },
    },
    include: articleDefaultInclude,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });
}

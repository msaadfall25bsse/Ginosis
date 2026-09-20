import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ArticleStatus, Prisma } from "@prisma/client";
import { generateSlug, checkSlugAvailability, sanitizePublicSlug } from "@/lib/articles/slug";
import {
  validateSearchQuery,
  validatePagination,
  validateCategoryFilter,
} from "@/lib/search/validation";
import {
  calculateTrendingScore,
  getCachedTrending,
  setCachedTrending,
} from "@/lib/trending/service";

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

// -----------------------------------------------------------------------------
// PUBLIC FRONTEND PROJECTIONS & QUERIES (Phase 6 Architecture)
// -----------------------------------------------------------------------------

/**
 * Optimized lightweight projection for public news cards (Section 29 & 44).
 * Omits heavy rich content body to maximize performance.
 */
export const publicArticleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  primaryCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  featuredImage: {
    select: {
      id: true,
      url: true,
      altText: true,
      caption: true,
      width: true,
      height: true,
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      slug: true,
      avatar: true,
      role: true,
    },
  },
} as const;

/**
 * Controlled projection for full public article reading experience (Section 43 & 48).
 * Never exposes sensitive admin metadata, passwords, or storage credentials.
 */
export const publicArticleDetailSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  primaryCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  },
  categories: {
    select: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      slug: true,
      avatar: true,
      role: true,
      bio: true,
    },
  },
  featuredImage: {
    select: {
      id: true,
      url: true,
      altText: true,
      caption: true,
      width: true,
      height: true,
    },
  },
  inlineMedia: {
    select: {
      caption: true,
      order: true,
      media: {
        select: {
          id: true,
          url: true,
          altText: true,
          caption: true,
          width: true,
          height: true,
        },
      },
    },
    orderBy: {
      order: "asc" as const,
    },
  },
  seo: {
    select: {
      seoTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      socialTitle: true,
      socialDescription: true,
      socialImage: true,
    },
  },
} as const;

/**
 * Retrieves a published article by slug with strict visibility protection (Sections 4-9, 43, 73, 74).
 * Returns null if the article does not exist or if its status is DRAFT, SCHEDULED, or ARCHIVED.
 * Leaks no private metadata, admin fields, or draft existence info.
 */
export async function getPublishedArticleBySlug(slug: string) {
  const cleanSlug = sanitizePublicSlug(slug);
  if (!cleanSlug) {
    return null;
  }

  return prisma.article.findFirst({
    where: {
      slug: cleanSlug,
      status: ArticleStatus.PUBLISHED,
    },
    select: publicArticleDetailSelect,
  });
}

export interface GetRelatedArticlesOptions {
  currentArticleId: string;
  primaryCategoryId: string;
  tagIds?: string[];
  limit?: number;
}

/**
 * Deterministic related articles selector (Sections 27, 28, 29, 76).
 * Priority: Same primary category or shared tags.
 * Strictly excludes current article and all non-published articles (no drafts, scheduled, or archived).
 * Returns lightweight card projections (title, slug, image, category, published date) without full body content.
 */
export async function getRelatedArticles(options: GetRelatedArticlesOptions) {
  const { currentArticleId, primaryCategoryId, tagIds = [], limit = 4 } = options;
  const safeLimit = Math.min(6, Math.max(1, limit));

  // Build OR conditions: same primary category OR shared tag
  const orConditions: Prisma.ArticleWhereInput[] = [
    { primaryCategoryId },
  ];

  if (tagIds.length > 0) {
    orConditions.push({
      tags: {
        some: {
          tagId: { in: tagIds },
        },
      },
    });
  }

  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      id: { not: currentArticleId },
      OR: orConditions,
    },
    select: publicArticleCardSelect,
    orderBy: {
      publishedAt: "desc",
    },
    take: safeLimit,
  });
}

export interface GetLatestPublishedArticlesOptions {
  limit?: number;
  excludeId?: string;
}

/**
 * Retrieves recent published articles for the latest news feed (Sections 30, 77).
 * Strictly filters by PUBLISHED status, ordered by publication date descending.
 */
export async function getLatestPublishedArticles(options: GetLatestPublishedArticlesOptions = {}) {
  const { limit = 6, excludeId } = options;
  const safeLimit = Math.min(20, Math.max(1, limit));

  const where: Prisma.ArticleWhereInput = {
    status: ArticleStatus.PUBLISHED,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  try {
    return prisma.article.findMany({
      where,
      select: publicArticleCardSelect,
      orderBy: {
        publishedAt: "desc",
      },
      take: safeLimit,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("getLatestPublishedArticles fallback triggered:", (error as any)?.message || error);
    }
    return [];
  }
}

export interface GetTrendingArticlesOptions {
  limit?: number;
  excludeId?: string;
  categorySlug?: string;
}

/**
 * Retrieves trending published articles (Phase 7 Sections 3, 29-39, 66-71, 77, 89, 96, 112).
 * - Filters strictly by status: PUBLISHED (drafts, scheduled, and archived articles are strictly excluded).
 * - Limit bounded between 5 and 10 (default 6, Section 37).
 * - Applies deterministic score formula: Activity × Recency Weight (Section 33, 138).
 * - Bounded time decay window (24h/48h/7d).
 * - Ties broken deterministically by publishedAt DESC (Section 96).
 * - Reuses publicArticleCardSelect projection (Section 14 & 48).
 * - Short-lived in-memory caching to optimize query load (Section 67 & 112).
 * - Safe error handling for offline database environments.
 */
export async function getTrendingArticles(options: GetTrendingArticlesOptions = {}) {
  const { limit = 6, excludeId, categorySlug } = options;
  const safeLimit = Math.min(10, Math.max(5, limit)); // Section 37: 5-10 articles

  const cacheKey = `trending:${safeLimit}:${excludeId || "none"}:${categorySlug || "all"}`;
  const cached = getCachedTrending<any[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    if (categorySlug) {
      where.OR = [
        { primaryCategory: { slug: categorySlug } },
        { categories: { some: { category: { slug: categorySlug } } } },
      ];
    }

    // Retrieve recent candidate pool (e.g. up to 25 latest published articles) to score and rank
    const candidates = await prisma.article.findMany({
      where,
      select: publicArticleCardSelect,
      orderBy: {
        publishedAt: "desc",
      },
      take: 25,
    });

    const now = new Date();
    const scored = candidates.map((article) => ({
      article,
      score: calculateTrendingScore(article, now),
    }));

    // Sort by score descending; if score equal, sort by publishedAt DESC (Section 95-96)
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const dateA = a.article.publishedAt ? new Date(a.article.publishedAt).getTime() : 0;
      const dateB = b.article.publishedAt ? new Date(b.article.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    const results = scored.slice(0, safeLimit).map((item) => item.article);
    setCachedTrending(cacheKey, results);
    return results;
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("getTrendingArticles fallback triggered:", (error as any)?.message || error);
    }
    return [];
  }
}

/**
 * Efficient public category articles query (Section 53-55).
 */
export async function getPublishedArticlesByCategory(
  categorySlug: string,
  limit = 20,
  skip = 0
) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { primaryCategory: { slug: categorySlug } },
        { categories: { some: { category: { slug: categorySlug } } } },
      ],
    },
    select: publicArticleCardSelect,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
    skip,
  });
}

export interface SearchPublishedArticlesOptions {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
}

export interface SearchPublishedArticlesResult {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: Date | null;
    primaryCategory: {
      id: string;
      name: string;
      slug: string;
    };
    featuredImage: {
      id: string;
      url: string;
      altText: string | null;
      caption: string | null;
      width: number | null;
      height: number | null;
    } | null;
    author: {
      id: string;
      name: string;
      slug: string;
      avatar: string | null;
      role: string | null;
    };
  }>;
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  query: string;
}

/**
 * Server-side public article search query (Phase 7 Sections 1-22, 72-76, 87-88, 94-96, 99-101, 146).
 * - Enforces status: PUBLISHED only (strictly bars drafts, scheduled, and archived stories).
 * - Validates input query (strips control characters, max 256 chars, trims whitespace).
 * - Never executes unconstrained queries on empty string (returns empty result immediately).
 * - Searches across title, excerpt, slug, and tags (does NOT search full rich body content in initial Phase 7).
 * - Implements deterministic relevance ranking:
 *     Exact Title Match > Title Starts With > Title Contains > Slug Match > Excerpt Match
 *     Ties broken deterministically by publishedAt DESC.
 * - Enforces pagination bounds (pageSize 1-20, page >= 1).
 * - Uses publicArticleCardSelect projection to prevent credential leakage and content bloat.
 */
export async function searchPublishedArticles(
  rawQuery: string,
  options: SearchPublishedArticlesOptions = {}
): Promise<SearchPublishedArticlesResult> {
  const { isValid, query: cleanQuery } = validateSearchQuery(rawQuery);
  const { page, pageSize } = validatePagination(options.page, options.pageSize);
  const validCategory = validateCategoryFilter(options.categorySlug);

  // If query is empty or invalid, never hit the database (Section 9 & 126)
  if (!isValid || !cleanQuery) {
    return {
      articles: [],
      totalCount: 0,
      totalPages: 0,
      page,
      pageSize,
      query: "",
    };
  }

  try {
    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { title: { contains: cleanQuery, mode: "insensitive" } },
        { slug: { contains: cleanQuery, mode: "insensitive" } },
        { excerpt: { contains: cleanQuery, mode: "insensitive" } },
        {
          tags: {
            some: {
              tag: {
                name: { contains: cleanQuery, mode: "insensitive" },
              },
            },
          },
        },
      ],
    };

    if (validCategory) {
      where.AND = [
        {
          OR: [
            { primaryCategory: { slug: validCategory } },
            { categories: { some: { category: { slug: validCategory } } } },
          ],
        },
      ];
    }

    // Retrieve candidate matches with lightweight card projection (Section 14 & 48)
    const candidates = await prisma.article.findMany({
      where,
      select: publicArticleCardSelect,
      take: 100,
    });

    const lowerQuery = cleanQuery.toLowerCase();

    // Calculate deterministic relevance score (Section 13, 94-96)
    const scored = candidates.map((article) => {
      let score = 0;
      const lowerTitle = article.title.toLowerCase();
      const lowerExcerpt = (article.excerpt || "").toLowerCase();
      const lowerSlug = article.slug.toLowerCase();

      if (lowerTitle === lowerQuery) {
        score += 100; // Exact title match
      } else if (lowerTitle.startsWith(lowerQuery)) {
        score += 50; // Title starts with query
      } else if (lowerTitle.includes(lowerQuery)) {
        score += 30; // Title contains query
      }

      if (lowerSlug.includes(lowerQuery)) {
        score += 25; // Slug match
      }

      if (lowerExcerpt.includes(lowerQuery)) {
        score += 10; // Excerpt match
      }

      return { article, score };
    });

    // Sort by score descending; if score equal, sort by publishedAt DESC (Section 95-96)
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const dateA = a.article.publishedAt ? new Date(a.article.publishedAt).getTime() : 0;
      const dateB = b.article.publishedAt ? new Date(b.article.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    const totalCount = scored.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedArticles = scored
      .slice(startIndex, startIndex + pageSize)
      .map((item) => item.article);

    return {
      articles: paginatedArticles,
      totalCount,
      totalPages,
      page,
      pageSize,
      query: cleanQuery,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("searchPublishedArticles fallback triggered:", (error as any)?.message || error);
    }
    return {
      articles: [],
      totalCount: 0,
      totalPages: 0,
      page,
      pageSize,
      query: cleanQuery,
    };
  }
}

// -----------------------------------------------------------------------------
// LEGACY COMPATIBILITY QUERIES
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// PHASE 5: ADMIN ARTICLE CMS TYPES & OPERATIONS
// -----------------------------------------------------------------------------

export interface CreateArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  status: ArticleStatus;
  primaryCategoryId: string;
  additionalCategoryIds?: string[];
  tagIds?: string[];
  authorId: string;
  featuredImageId?: string | null;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  seo?: {
    seoTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    canonicalUrl?: string | null;
    socialTitle?: string | null;
    socialDescription?: string | null;
    socialImage?: string | null;
  } | null;
  inlineMedia?: Array<{
    mediaId: string;
    caption?: string | null;
    order: number;
  }>;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: ArticleStatus;
  primaryCategoryId?: string;
  additionalCategoryIds?: string[];
  tagIds?: string[];
  authorId?: string;
  featuredImageId?: string | null;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  seo?: {
    seoTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    canonicalUrl?: string | null;
    socialTitle?: string | null;
    socialDescription?: string | null;
    socialImage?: string | null;
  } | null;
  inlineMedia?: Array<{
    mediaId: string;
    caption?: string | null;
    order: number;
  }>;
}

export interface GetAdminArticlesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ArticleStatus;
  categoryId?: string;
  authorId?: string;
  sort?: "newest" | "published_newest" | "published_oldest" | "title_asc";
}

export interface AdminArticleSummaryItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: ArticleStatus;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  primaryCategory: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    slug: string;
  };
  featuredImage: {
    id: string;
    url: string;
    fileName: string;
    altText: string | null;
  } | null;
  _count: {
    categories: number;
    tags: number;
    inlineMedia: number;
  };
}

export interface PaginatedAdminArticlesResult {
  articles: AdminArticleSummaryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Atomic Transactional Article Creation (Section 55, 93, 139)
 * Saves Article + Categories + Tags + SEO + Inline Media atomically.
 * Rolls back automatically if any relation fails.
 */
export async function createArticleTransaction(data: CreateArticleInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify Primary Category existence
    const primaryCategory = await tx.category.findUnique({
      where: { id: data.primaryCategoryId },
      select: { id: true },
    });
    if (!primaryCategory) {
      throw new Error(`Primary category not found: ${data.primaryCategoryId}`);
    }

    // 2. Verify Author existence
    const author = await tx.author.findUnique({
      where: { id: data.authorId },
      select: { id: true },
    });
    if (!author) {
      throw new Error(`Author not found: ${data.authorId}`);
    }

    // 3. Verify Featured Image if provided
    if (data.featuredImageId) {
      const media = await tx.media.findUnique({
        where: { id: data.featuredImageId },
        select: { id: true },
      });
      if (!media) {
        throw new Error(`Featured media item not found: ${data.featuredImageId}`);
      }
    }

    // 4. Validate Slug Uniqueness
    const targetSlug = generateSlug(data.slug || data.title);
    const slugAvailability = await checkSlugAvailability(targetSlug);
    if (!slugAvailability.isAvailable) {
      throw new Error(
        `This slug is already in use. Please choose another slug. (Suggestion: "${slugAvailability.suggestedSlug}")`
      );
    }

    // 5. Determine publication timestamp
    let publishedAt = data.publishedAt || null;
    if (data.status === ArticleStatus.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }

    // 6. Create Main Article Record
    const article = await tx.article.create({
      data: {
        title: data.title.trim(),
        slug: targetSlug,
        excerpt: data.excerpt?.trim() || "",
        content: data.content,
        status: data.status,
        primaryCategoryId: data.primaryCategoryId,
        authorId: data.authorId,
        featuredImageId: data.featuredImageId || null,
        scheduledAt: data.scheduledAt || null,
        publishedAt,
      },
    });

    // 7. Attach Additional Categories (Prevent duplicate of primary category)
    if (data.additionalCategoryIds && data.additionalCategoryIds.length > 0) {
      const cleanAdditional = Array.from(
        new Set(
          data.additionalCategoryIds.filter(
            (catId) => catId && catId !== data.primaryCategoryId
          )
        )
      );

      for (const catId of cleanAdditional) {
        await tx.articleCategory.create({
          data: {
            articleId: article.id,
            categoryId: catId,
          },
        });
      }
    }

    // 8. Attach Tags
    if (data.tagIds && data.tagIds.length > 0) {
      const cleanTags = Array.from(new Set(data.tagIds.filter(Boolean)));
      for (const tagId of cleanTags) {
        await tx.articleTag.create({
          data: {
            articleId: article.id,
            tagId,
          },
        });
      }
    }

    // 9. Attach Inline Media
    if (data.inlineMedia && data.inlineMedia.length > 0) {
      for (let i = 0; i < data.inlineMedia.length; i++) {
        const item = data.inlineMedia[i];
        await tx.articleMedia.create({
          data: {
            articleId: article.id,
            mediaId: item.mediaId,
            caption: item.caption || null,
            order: typeof item.order === "number" ? item.order : i,
          },
        });
      }
    }

    // 10. Attach SEO Metadata
    if (data.seo) {
      await tx.articleSEO.create({
        data: {
          articleId: article.id,
          seoTitle: data.seo.seoTitle || null,
          metaDescription: data.seo.metaDescription || null,
          focusKeyword: data.seo.focusKeyword || null,
          canonicalUrl: data.seo.canonicalUrl || null,
          socialTitle: data.seo.socialTitle || null,
          socialDescription: data.seo.socialDescription || null,
          socialImage: data.seo.socialImage || null,
        },
      });
    }

    // Return the full populated article
    return tx.article.findUniqueOrThrow({
      where: { id: article.id },
      include: articleDefaultInclude,
    });
  });
}

/**
 * Atomic Transactional Article Update (Section 41, 54, 94, 139)
 * Updates Article fields, diffs/synchronizes Categories & Tags, updates SEO and Inline Media.
 * Preserves original publishedAt unless intentionally modified.
 */
export async function updateArticleTransaction(id: string, data: UpdateArticleInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch current article
    const existing = await tx.article.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
        inlineMedia: true,
        seo: true,
      },
    });

    if (!existing) {
      throw new Error(`Article not found with ID: ${id}`);
    }

    // 2. Validate Slug if being updated
    let newSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      const cleanSlug = generateSlug(data.slug);
      const slugCheck = await checkSlugAvailability(cleanSlug, id);
      if (!slugCheck.isAvailable) {
        throw new Error(
          `This slug is already in use. Please choose another slug. (Suggestion: "${slugCheck.suggestedSlug}")`
        );
      }
      newSlug = cleanSlug;
    }

    // 3. Verify Foreign Keys if changed
    if (data.primaryCategoryId && data.primaryCategoryId !== existing.primaryCategoryId) {
      const cat = await tx.category.findUnique({ where: { id: data.primaryCategoryId } });
      if (!cat) throw new Error(`Primary category not found: ${data.primaryCategoryId}`);
    }

    if (data.authorId && data.authorId !== existing.authorId) {
      const author = await tx.author.findUnique({ where: { id: data.authorId } });
      if (!author) throw new Error(`Author not found: ${data.authorId}`);
    }

    if (data.featuredImageId && data.featuredImageId !== existing.featuredImageId) {
      const media = await tx.media.findUnique({ where: { id: data.featuredImageId } });
      if (!media) throw new Error(`Featured media item not found: ${data.featuredImageId}`);
    }

    // 4. Determine publishedAt timestamp preservation (Section 37 & 137)
    let publishedAt = existing.publishedAt;
    if (data.publishedAt !== undefined) {
      publishedAt = data.publishedAt;
    } else if (data.status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const primaryCategoryId = data.primaryCategoryId || existing.primaryCategoryId;

    // 5. Update Main Article Record
    await tx.article.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        slug: newSlug,
        excerpt: data.excerpt !== undefined ? data.excerpt.trim() : undefined,
        content: data.content !== undefined ? data.content : undefined,
        status: data.status !== undefined ? data.status : undefined,
        primaryCategoryId,
        authorId: data.authorId !== undefined ? data.authorId : undefined,
        featuredImageId: data.featuredImageId !== undefined ? data.featuredImageId : undefined,
        scheduledAt: data.scheduledAt !== undefined ? data.scheduledAt : undefined,
        publishedAt,
      },
    });

    // 6. Synchronize Additional Categories (Diff & Sync)
    if (data.additionalCategoryIds !== undefined) {
      const cleanAdditional = Array.from(
        new Set(
          data.additionalCategoryIds.filter(
            (catId) => catId && catId !== primaryCategoryId
          )
        )
      );

      // Remove existing categories for this article
      await tx.articleCategory.deleteMany({
        where: { articleId: id },
      });

      // Insert updated categories
      for (const catId of cleanAdditional) {
        await tx.articleCategory.create({
          data: {
            articleId: id,
            categoryId: catId,
          },
        });
      }
    }

    // 7. Synchronize Tags (Diff & Sync)
    if (data.tagIds !== undefined) {
      const cleanTags = Array.from(new Set(data.tagIds.filter(Boolean)));

      await tx.articleTag.deleteMany({
        where: { articleId: id },
      });

      for (const tagId of cleanTags) {
        await tx.articleTag.create({
          data: {
            articleId: id,
            tagId,
          },
        });
      }
    }

    // 8. Synchronize Inline Media
    if (data.inlineMedia !== undefined) {
      await tx.articleMedia.deleteMany({
        where: { articleId: id },
      });

      for (let i = 0; i < data.inlineMedia.length; i++) {
        const item = data.inlineMedia[i];
        await tx.articleMedia.create({
          data: {
            articleId: id,
            mediaId: item.mediaId,
            caption: item.caption || null,
            order: typeof item.order === "number" ? item.order : i,
          },
        });
      }
    }

    // 9. Synchronize SEO Metadata
    if (data.seo !== undefined) {
      if (data.seo) {
        await tx.articleSEO.upsert({
          where: { articleId: id },
          create: {
            articleId: id,
            seoTitle: data.seo.seoTitle || null,
            metaDescription: data.seo.metaDescription || null,
            focusKeyword: data.seo.focusKeyword || null,
            canonicalUrl: data.seo.canonicalUrl || null,
            socialTitle: data.seo.socialTitle || null,
            socialDescription: data.seo.socialDescription || null,
            socialImage: data.seo.socialImage || null,
          },
          update: {
            seoTitle: data.seo.seoTitle || null,
            metaDescription: data.seo.metaDescription || null,
            focusKeyword: data.seo.focusKeyword || null,
            canonicalUrl: data.seo.canonicalUrl || null,
            socialTitle: data.seo.socialTitle || null,
            socialDescription: data.seo.socialDescription || null,
            socialImage: data.seo.socialImage || null,
          },
        });
      } else {
        await tx.articleSEO.deleteMany({
          where: { articleId: id },
        });
      }
    }

    // Return the updated full article
    return tx.article.findUniqueOrThrow({
      where: { id },
      include: articleDefaultInclude,
    });
  });
}

/**
 * Archive an article (Section 48, 82, 138).
 * Transitions status to ARCHIVED while keeping article content, relations, and media intact.
 */
export async function archiveArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: {
      status: ArticleStatus.ARCHIVED,
    },
    include: articleDefaultInclude,
  });
}

/**
 * Retrieves a single article with all relations for the editorial workspace (Section 96).
 */
export async function getAdminArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: articleDefaultInclude,
  });
}

/**
 * Efficient Server-side Admin Article Listing (Sections 44, 45, 46, 47, 77, 78, 79, 80, 140).
 * Excludes full rich content from projection to maintain lightning-fast response times.
 */
export async function getAdminArticles(
  options: GetAdminArticlesOptions = {}
): Promise<PaginatedAdminArticlesResult> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.ArticleWhereInput = {};

  // Status Filter
  if (options.status) {
    where.status = options.status;
  }

  // Category Filter (Primary or Additional)
  if (options.categoryId) {
    where.OR = [
      { primaryCategoryId: options.categoryId },
      { categories: { some: { categoryId: options.categoryId } } },
    ];
  }

  // Author Filter
  if (options.authorId) {
    where.authorId = options.authorId;
  }

  // Search Filter (Title or Slug)
  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }

  // Sorting
  let orderBy: Prisma.ArticleOrderByWithRelationInput = { updatedAt: "desc" };
  if (options.sort === "published_newest") {
    orderBy = { publishedAt: "desc" };
  } else if (options.sort === "published_oldest") {
    orderBy = { publishedAt: "asc" };
  } else if (options.sort === "title_asc") {
    orderBy = { title: "asc" };
  }

  // Execute Count & Query concurrently
  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        publishedAt: true,
        scheduledAt: true,
        createdAt: true,
        updatedAt: true,
        primaryCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            fileName: true,
            altText: true,
          },
        },
        _count: {
          select: {
            categories: true,
            tags: true,
            inlineMedia: true,
          },
        },
      },
      orderBy,
      take: pageSize,
      skip,
    }),
  ]);

  return {
    articles: articles as AdminArticleSummaryItem[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Safe Deletion of an Article (Section 48, 88).
 * Removes article and relational junction rows, but NEVER deletes associated Media records or storage files.
 */
export async function deleteArticleSafe(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // Clean up junction rows
      await tx.articleCategory.deleteMany({ where: { articleId: id } });
      await tx.articleTag.deleteMany({ where: { articleId: id } });
      await tx.articleMedia.deleteMany({ where: { articleId: id } });
      await tx.articleSEO.deleteMany({ where: { articleId: id } });

      // Delete main article record
      await tx.article.delete({ where: { id } });
    });

    return {
      success: true,
      message: "Article deleted successfully. Associated media assets remain preserved in library.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to delete article record.",
    };
  }
}

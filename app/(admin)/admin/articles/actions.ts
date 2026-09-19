"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/auth";
import {
  validateArticleData,
  ArticleInputData,
  ArticleValidationError,
  ArticleValidationWarning,
} from "@/lib/articles/validation";
import { checkSlugAvailability, SlugAvailabilityResult } from "@/lib/articles/slug";
import {
  createArticleTransaction,
  updateArticleTransaction,
  archiveArticle,
  deleteArticleSafe,
  getAdminArticles,
  getAdminArticleById,
  GetAdminArticlesOptions,
  PaginatedAdminArticlesResult,
} from "@/lib/repositories/article.repository";
import { ArticleStatus } from "@prisma/client";

/**
 * Server-side authorization verification helper (Section 52 & 85).
 * Strictly requires an authenticated user with role ADMIN and active account status.
 */
async function assertAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

export interface SaveArticleResult {
  success: boolean;
  articleId?: string;
  slug?: string;
  status?: ArticleStatus;
  errors?: ArticleValidationError[];
  warnings?: ArticleValidationWarning[];
  generalError?: string;
}

/**
 * Server Action for Article Creation and Updates (Section 51, 52, 93, 94).
 * Enforces server validation rules for Draft, Published, and Scheduled states.
 */
export async function saveArticleAction(
  data: ArticleInputData,
  targetStatus: ArticleStatus = ArticleStatus.DRAFT,
  articleId?: string
): Promise<SaveArticleResult> {
  try {
    await assertAdminUser();

    // 1. Authoritative Server-Side Validation & Sanitization (Section 15 & 51)
    const validation = validateArticleData(data, targetStatus);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    const sanitized = validation.sanitized;

    // 2. Route to Update or Create Transaction
    let article;
    if (articleId) {
      article = await updateArticleTransaction(articleId, {
        title: sanitized.title,
        slug: sanitized.slug,
        excerpt: sanitized.excerpt,
        content: sanitized.content,
        status: sanitized.status,
        primaryCategoryId: sanitized.primaryCategoryId || undefined,
        additionalCategoryIds: sanitized.additionalCategoryIds,
        tagIds: sanitized.tagIds,
        authorId: sanitized.authorId || undefined,
        featuredImageId: sanitized.featuredImageId,
        scheduledAt: sanitized.scheduledAt,
        seo: sanitized.seo,
        inlineMedia: sanitized.inlineMedia,
      });
    } else {
      article = await createArticleTransaction({
        title: sanitized.title,
        slug: sanitized.slug,
        excerpt: sanitized.excerpt,
        content: sanitized.content,
        status: sanitized.status,
        primaryCategoryId: sanitized.primaryCategoryId!,
        additionalCategoryIds: sanitized.additionalCategoryIds,
        tagIds: sanitized.tagIds,
        authorId: sanitized.authorId!,
        featuredImageId: sanitized.featuredImageId,
        scheduledAt: sanitized.scheduledAt,
        seo: sanitized.seo,
        inlineMedia: sanitized.inlineMedia,
      });
    }

    // 3. Revalidate Admin and Public Paths
    revalidatePath("/admin/articles");
    revalidatePath("/admin");

    return {
      success: true,
      articleId: article.id,
      slug: article.slug,
      status: article.status,
      warnings: validation.warnings,
    };
  } catch (error: any) {
    console.error("Save Article Server Action Error:", error);
    return {
      success: false,
      generalError: error.message || "An unexpected error occurred while saving the article.",
    };
  }
}

/**
 * Server Action to archive an article (Section 48, 82, 95).
 */
export async function archiveArticleAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await assertAdminUser();

    if (!id) {
      return { success: false, message: "Article ID is required." };
    }

    await archiveArticle(id);
    revalidatePath("/admin/articles");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Article archived successfully.",
    };
  } catch (error: any) {
    console.error("Archive Article Server Action Error:", error);
    return {
      success: false,
      message: error.message || "Failed to archive article.",
    };
  }
}

/**
 * Server Action for safe article deletion (Section 48, 88).
 * Strictly preserves associated Media objects in storage and library.
 */
export async function deleteArticleAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await assertAdminUser();

    if (!id) {
      return { success: false, message: "Article ID is required." };
    }

    const result = await deleteArticleSafe(id);
    revalidatePath("/admin/articles");
    revalidatePath("/admin");

    return result;
  } catch (error: any) {
    console.error("Delete Article Server Action Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete article.",
    };
  }
}

/**
 * Server Action to fetch paginated admin articles (Section 44-47, 77-80).
 */
export async function getAdminArticlesAction(
  options: GetAdminArticlesOptions = {}
): Promise<PaginatedAdminArticlesResult> {
  await assertAdminUser();
  return getAdminArticles(options);
}

/**
 * Server Action to fetch full article record for the editorial workspace (Section 96).
 */
export async function getArticleForEditAction(id: string) {
  await assertAdminUser();
  return getAdminArticleById(id);
}

/**
 * Server Action to check slug availability and suggest counter suffixes (Section 10 & 50).
 */
export async function checkSlugAction(
  slug: string,
  excludeArticleId?: string
): Promise<SlugAvailabilityResult> {
  await assertAdminUser();
  return checkSlugAvailability(slug, excludeArticleId);
}

import "server-only";
import { ArticleStatus } from "@prisma/client";
import { generateSlug } from "./slug";

export interface ArticleSeoInput {
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  socialImage?: string | null;
}

export interface InlineMediaInput {
  mediaId: string;
  caption?: string | null;
  order: number;
}

export interface ArticleInputData {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  status?: ArticleStatus;
  primaryCategoryId?: string | null;
  additionalCategoryIds?: string[];
  tagIds?: string[];
  authorId?: string | null;
  featuredImageId?: string | null;
  scheduledAt?: Date | string | null;
  seo?: ArticleSeoInput | null;
  inlineMedia?: InlineMediaInput[];
}

export interface ArticleValidationError {
  field: string;
  message: string;
}

export interface ArticleValidationWarning {
  field: string;
  message: string;
}

export interface ArticleValidationResult {
  isValid: boolean;
  errors: ArticleValidationError[];
  warnings: ArticleValidationWarning[];
  sanitized: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: ArticleStatus;
    primaryCategoryId: string | null;
    additionalCategoryIds: string[];
    tagIds: string[];
    authorId: string | null;
    featuredImageId: string | null;
    scheduledAt: Date | null;
    seo: ArticleSeoInput | null;
    inlineMedia: InlineMediaInput[];
  };
}

/**
 * Server-side HTML & rich-content sanitizer (Section 15, 57, & 58).
 * Strictly removes script tags, style injections, iframes, inline event handlers,
 * and dangerous URI schemes (such as `javascript:`).
 */
export function sanitizeArticleContent(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  let sanitized = html
    // Strip <script> tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip <style> tags and their contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Strip <iframe> tags (Section 57)
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Strip inline event handlers (e.g. onclick, onerror, onload)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Strip dangerous URL schemes in href and src attributes
    .replace(/(href|src)\s*=\s*["']?\s*(?:javascript|data|vbscript):[^"'>\s]*/gi, '$1="#"');

  return sanitized.trim();
}

/**
 * Validates article input data based on the intended status (Draft vs Published vs Scheduled)
 * strictly implementing Sections 15, 23, 25, 26, 30, 35, 38, 51, and 73.
 */
export function validateArticleData(
  data: ArticleInputData,
  targetStatus: ArticleStatus = ArticleStatus.DRAFT
): ArticleValidationResult {
  const errors: ArticleValidationError[] = [];
  const warnings: ArticleValidationWarning[] = [];

  const rawTitle = (data.title || "").trim();
  const rawSlug = (data.slug || "").trim();
  const rawExcerpt = (data.excerpt || "").trim();
  const rawContent = sanitizeArticleContent(data.content || "");
  const primaryCategoryId = data.primaryCategoryId?.trim() || null;
  const authorId = data.authorId?.trim() || null;
  const featuredImageId = data.featuredImageId?.trim() || null;

  // Deduplicate and filter additional category IDs
  const rawAdditionalCategories = Array.isArray(data.additionalCategoryIds)
    ? Array.from(new Set(data.additionalCategoryIds.map((id) => id.trim()).filter(Boolean)))
    : [];

  // Filter out primary category if mistakenly passed in additional categories (Section 25 & 26)
  const additionalCategoryIds = primaryCategoryId
    ? rawAdditionalCategories.filter((catId) => catId !== primaryCategoryId)
    : rawAdditionalCategories;

  // Deduplicate tags
  const tagIds = Array.isArray(data.tagIds)
    ? Array.from(new Set(data.tagIds.map((id) => id.trim()).filter(Boolean)))
    : [];

  // Parse and validate scheduled date
  let scheduledAt: Date | null = null;
  if (data.scheduledAt) {
    const parsedDate = new Date(data.scheduledAt);
    if (!isNaN(parsedDate.getTime())) {
      scheduledAt = parsedDate;
    }
  }

  // 1. BASE TITLE VALIDATION (Applies to all states)
  if (!rawTitle) {
    errors.push({
      field: "title",
      message: "Title is required.",
    });
  } else if (rawTitle.length > 250) {
    errors.push({
      field: "title",
      message: "Title must not exceed 250 characters.",
    });
  }

  // 2. BASE SLUG VALIDATION (Applies to all states)
  const calculatedSlug = generateSlug(rawSlug || rawTitle);
  if (!calculatedSlug) {
    errors.push({
      field: "slug",
      message: "A valid URL-safe slug is required.",
    });
  }

  // 3. EXCERPT LENGTH VALIDATION
  if (rawExcerpt.length > 600) {
    warnings.push({
      field: "excerpt",
      message: "Excerpt exceeds recommended 600 characters for news cards.",
    });
  }

  // 4. PUBLISHING RULES (Section 35 & 73)
  if (targetStatus === ArticleStatus.PUBLISHED || targetStatus === ArticleStatus.SCHEDULED) {
    // Content is mandatory for publishing
    const strippedContentText = rawContent.replace(/<[^>]+>/g, "").trim();
    if (!rawContent || (!strippedContentText && !rawContent.includes("<img"))) {
      errors.push({
        field: "content",
        message: "Article content cannot be empty before publication.",
      });
    }

    // Featured Image is strictly mandatory for publication (Section 23 & 73)
    if (!featuredImageId) {
      errors.push({
        field: "featuredImage",
        message: "Featured hero image is required before publishing.",
      });
    }

    // Primary Category is strictly mandatory for publication (Section 25 & 73)
    if (!primaryCategoryId) {
      errors.push({
        field: "primaryCategory",
        message: "Primary category must be selected before publishing.",
      });
    }

    // Author is strictly mandatory for publication (Section 28 & 73)
    if (!authorId) {
      errors.push({
        field: "author",
        message: "Article author must be selected before publishing.",
      });
    }

    // SCHEDULED SPECIFIC VALIDATION (Section 38 & 73)
    if (targetStatus === ArticleStatus.SCHEDULED) {
      if (!scheduledAt) {
        errors.push({
          field: "scheduledAt",
          message: "A scheduled publication date and time is required.",
        });
      } else if (scheduledAt.getTime() <= Date.now()) {
        errors.push({
          field: "scheduledAt",
          message: "Scheduled publication time must be in the future.",
        });
      }
    }
  }

  // 5. SEO VALIDATION & ADVISORY WARNINGS (Section 64)
  if (data.seo) {
    if (data.seo.seoTitle && data.seo.seoTitle.length > 70) {
      warnings.push({
        field: "seoTitle",
        message: "SEO title exceeds recommended length of 70 characters.",
      });
    }
    if (data.seo.metaDescription && data.seo.metaDescription.length > 160) {
      warnings.push({
        field: "metaDescription",
        message: "Meta description exceeds recommended length of 160 characters.",
      });
    }
  }

  // 6. SANITIZE INLINE MEDIA
  const inlineMedia: InlineMediaInput[] = Array.isArray(data.inlineMedia)
    ? data.inlineMedia
        .filter((item) => item && typeof item.mediaId === "string" && item.mediaId.trim())
        .map((item, index) => ({
          mediaId: item.mediaId.trim(),
          caption: item.caption?.trim() || null,
          order: typeof item.order === "number" ? item.order : index,
        }))
    : [];

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: {
      title: rawTitle,
      slug: calculatedSlug,
      excerpt: rawExcerpt,
      content: rawContent,
      status: targetStatus,
      primaryCategoryId,
      additionalCategoryIds,
      tagIds,
      authorId,
      featuredImageId,
      scheduledAt,
      seo: data.seo
        ? {
            seoTitle: data.seo.seoTitle?.trim() || null,
            metaDescription: data.seo.metaDescription?.trim() || null,
            focusKeyword: data.seo.focusKeyword?.trim() || null,
            canonicalUrl: data.seo.canonicalUrl?.trim() || null,
            socialTitle: data.seo.socialTitle?.trim() || null,
            socialDescription: data.seo.socialDescription?.trim() || null,
            socialImage: data.seo.socialImage?.trim() || null,
          }
        : null,
      inlineMedia,
    },
  };
}

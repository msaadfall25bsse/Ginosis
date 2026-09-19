import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Normalizes a string into a URL-safe, lowercase, hyphen-separated slug (Section 9 & 62).
 * Strips special characters, normalizes accents, and prevents consecutive hyphens.
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== "string") {
    return "";
  }

  const normalized = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars except space & hyphen
    .replace(/[\s_]+/g, "-") // Convert spaces and underscores to hyphens
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Strip leading & trailing hyphens

  // Cap length sensibly without cutting in the middle of a word if possible
  const maxLength = 100;
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const trimmed = normalized.slice(0, maxLength);
  const lastHyphen = trimmed.lastIndexOf("-");
  return (lastHyphen > 30 ? trimmed.slice(0, lastHyphen) : trimmed).replace(/-+$/, "");
}

export interface SlugAvailabilityResult {
  isAvailable: boolean;
  slug: string;
  suggestedSlug?: string;
}

/**
 * Validates slug uniqueness against the database (Section 10 & 50).
 * If the slug is already taken, calculates an available numeric alternative (e.g. "my-slug-2").
 */
export async function checkSlugAvailability(
  slug: string,
  excludeArticleId?: string
): Promise<SlugAvailabilityResult> {
  const cleanSlug = generateSlug(slug);

  if (!cleanSlug) {
    return {
      isAvailable: false,
      slug: "",
      suggestedSlug: undefined,
    };
  }

  try {
    // Check if an article already uses this slug
    const existing = await prisma.article.findUnique({
      where: { slug: cleanSlug },
      select: { id: true },
    });

    // If no record found, or the matching record is the current article being edited
    if (!existing || (excludeArticleId && existing.id === excludeArticleId)) {
      return {
        isAvailable: true,
        slug: cleanSlug,
      };
    }

    // Find existing collision prefixes to determine next counter
    const collisions = await prisma.article.findMany({
      where: {
        slug: {
          startsWith: cleanSlug,
        },
      },
      select: { slug: true, id: true },
    });

    const usedSlugs = new Set(
      collisions
        .filter((c) => !excludeArticleId || c.id !== excludeArticleId)
        .map((c) => c.slug)
    );

    let counter = 2;
    let candidate = `${cleanSlug}-${counter}`;
    while (usedSlugs.has(candidate)) {
      counter++;
      candidate = `${cleanSlug}-${counter}`;
    }

    return {
      isAvailable: false,
      slug: cleanSlug,
      suggestedSlug: candidate,
    };
  } catch {
    // Fallback if database is unavailable
    return {
      isAvailable: true,
      slug: cleanSlug,
    };
  }
}

/**
 * Validates and safely decodes a public article slug from URL parameters (Section 74).
 * Returns decoded, normalized slug if valid, or null if malformed, oversized, or unsafe.
 */
export function sanitizePublicSlug(rawSlug: unknown): string | null {
  if (typeof rawSlug !== "string" || !rawSlug.trim()) {
    return null;
  }

  let decoded = "";
  try {
    decoded = decodeURIComponent(rawSlug).trim();
  } catch {
    return null;
  }

  // Reject empty or oversized slugs (> 200 chars)
  if (decoded.length === 0 || decoded.length > 200) {
    return null;
  }

  // Reject unsafe injection characters
  if (/[<>{}\\^~\[\]`|"\0\r\n]/.test(decoded)) {
    return null;
  }

  return decoded.toLowerCase();
}

/**
 * Checks if a public slug is valid
 */
export function isValidPublicSlug(rawSlug: unknown): boolean {
  return sanitizePublicSlug(rawSlug) !== null;
}

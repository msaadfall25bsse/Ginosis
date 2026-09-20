import { CATEGORIES } from "@/config/navigation";

/**
 * Search Validation Constants (Phase 7 Sections 10, 16, 75, 76, 101, 130, 131)
 */
export const MAX_SEARCH_QUERY_LENGTH = 256;
export const DEFAULT_PAGE_SIZE = 10;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 20;
export const MAX_PAGE_NUMBER = 100;

export interface ValidatedSearchQuery {
  isValid: boolean;
  query: string;
  error?: string;
}

export interface ValidatedPagination {
  page: number;
  pageSize: number;
}

/**
 * Normalizes and validates raw user search query string (Sections 9, 10, 75, 127, 128).
 * - Strips control characters
 * - Safely handles URL decoding
 * - Trims whitespace and collapses consecutive spaces
 * - Enforces max length of 256 characters
 * - Rejects empty or whitespace-only queries without querying database
 */
export function validateSearchQuery(rawQuery: unknown): ValidatedSearchQuery {
  if (typeof rawQuery !== "string") {
    return {
      isValid: false,
      query: "",
      error: "Please enter a search term.",
    };
  }

  let decoded = rawQuery;
  try {
    decoded = decodeURIComponent(rawQuery);
  } catch {
    // Retain raw query if malformed URI component
    decoded = rawQuery;
  }

  // Strip null bytes and non-printable control characters (XSS/SQL injection prevention)
  let cleaned = decoded.replace(/[\u0000-\u001F\u007F]/g, "");

  // Collapse consecutive whitespaces and trim edges
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return {
      isValid: false,
      query: "",
      error: "Please enter a search term.",
    };
  }

  // Enforce maximum length of 256 characters
  if (cleaned.length > MAX_SEARCH_QUERY_LENGTH) {
    cleaned = cleaned.slice(0, MAX_SEARCH_QUERY_LENGTH).trim();
  }

  return {
    isValid: true,
    query: cleaned,
  };
}

/**
 * Validates and clamps pagination parameters to safe boundaries (Sections 16, 76, 101, 130, 131).
 * Prevents memory exhaustion attacks like ?pageSize=100000.
 */
export function validatePagination(
  rawPage: unknown,
  rawPageSize: unknown = DEFAULT_PAGE_SIZE
): ValidatedPagination {
  let page = 1;
  if (typeof rawPage === "number" && Number.isInteger(rawPage)) {
    page = rawPage;
  } else if (typeof rawPage === "string") {
    const parsed = parseInt(rawPage, 10);
    if (!isNaN(parsed)) {
      page = parsed;
    }
  }

  if (page < 1) {
    page = 1;
  } else if (page > MAX_PAGE_NUMBER) {
    page = MAX_PAGE_NUMBER;
  }

  let pageSize = DEFAULT_PAGE_SIZE;
  if (typeof rawPageSize === "number" && Number.isInteger(rawPageSize)) {
    pageSize = rawPageSize;
  } else if (typeof rawPageSize === "string") {
    const parsed = parseInt(rawPageSize, 10);
    if (!isNaN(parsed)) {
      pageSize = parsed;
    }
  }

  if (pageSize < MIN_PAGE_SIZE) {
    pageSize = MIN_PAGE_SIZE;
  } else if (pageSize > MAX_PAGE_SIZE) {
    pageSize = MAX_PAGE_SIZE;
  }

  return {
    page,
    pageSize,
  };
}

/**
 * Validates optional category filter against known canonical categories (Section 61, 62, 132).
 */
export function validateCategoryFilter(rawCategory: unknown): string | undefined {
  if (typeof rawCategory !== "string") {
    return undefined;
  }

  const normalized = rawCategory.trim().toLowerCase();
  const exists = CATEGORIES.some((c) => c.slug === normalized);
  return exists ? normalized : undefined;
}

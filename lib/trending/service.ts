/**
 * Trending Service & Scoring Engine (Phase 7 Sections 3, 29-35, 66, 67, 96, 112, 138)
 * - Deterministic recency-decay scoring formula
 * - Bounded time windows: 24h, 48h, 7d
 * - Short-lived in-memory caching to optimize database queries
 * - Zero fake metrics policy: strictly avoids fabricating view counts
 */

export interface TrendingScorableArticle {
  id: string;
  publishedAt: Date | string | null;
  views?: number;
  [key: string]: any;
}

// Bounded Time Constants in milliseconds (Section 35)
export const ONE_HOUR_MS = 60 * 60 * 1000;
export const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;
export const FORTY_EIGHT_HOURS_MS = 48 * ONE_HOUR_MS;
export const SEVEN_DAYS_MS = 7 * 24 * ONE_HOUR_MS;

// Cache TTL: 60 seconds (Section 67 & 112)
export const TRENDING_CACHE_TTL_MS = 60 * 1000;

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Calculates deterministic recency decay weight based on publication age (Section 33, 34, 35).
 * - <= 24 hours: 1.00 (maximum freshness)
 * - <= 48 hours: 0.80
 * - <= 7 days: 0.50
 * - > 7 days: 0.20 (old articles decay significantly so they don't trend indefinitely)
 */
export function getRecencyWeight(
  publishedAt: Date | string | null | undefined,
  now: Date = new Date()
): number {
  if (!publishedAt) {
    return 0.1;
  }

  const pubDate = typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
  const ageMs = now.getTime() - pubDate.getTime();

  if (ageMs <= 0) {
    return 1.0;
  }
  if (ageMs <= TWENTY_FOUR_HOURS_MS) {
    return 1.0;
  }
  if (ageMs <= FORTY_EIGHT_HOURS_MS) {
    return 0.8;
  }
  if (ageMs <= SEVEN_DAYS_MS) {
    return 0.5;
  }
  return 0.2;
}

/**
 * Computes deterministic trending score (Section 33, 34, 138).
 * Formula: Score = (effectiveActivity) * recencyWeight
 * When view counts are not tracked, effectiveActivity uses a transparent freshness weight
 * rather than fabricating artificial view metrics (Section 31 & 70).
 */
export function calculateTrendingScore(
  article: TrendingScorableArticle,
  now: Date = new Date()
): number {
  const weight = getRecencyWeight(article.publishedAt, now);
  // Real view count if available, otherwise baseline unit signal (no fake inflated metrics)
  const activitySignal = typeof article.views === "number" && article.views > 0 ? article.views : 10;
  const baseScore = activitySignal * weight;

  // Include small chronological tie-breaker component so recent articles edge out ties
  const pubTime = article.publishedAt
    ? (typeof article.publishedAt === "string" ? new Date(article.publishedAt) : article.publishedAt).getTime()
    : 0;
  const chronoBonus = pubTime / 1e13; // tiny fraction to guarantee stability

  return baseScore + chronoBonus;
}

/**
 * Retrieves cached trending results if still valid within TTL (Section 67 & 112).
 */
export function getCachedTrending<T>(cacheKey: string): T | null {
  const entry = cache.get(cacheKey);
  if (!entry) return null;

  const isExpired = Date.now() - entry.cachedAt > TRENDING_CACHE_TTL_MS;
  if (isExpired) {
    cache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

/**
 * Sets trending result in short-lived cache.
 */
export function setCachedTrending<T>(cacheKey: string, data: T): void {
  cache.set(cacheKey, {
    data,
    cachedAt: Date.now(),
  });
}

/**
 * Invalidate cache (useful for testing or editorial updates).
 */
export function clearTrendingCache(): void {
  cache.clear();
}

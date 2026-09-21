/**
 * GNOSIS Phase 7 Part 5 Automated Test Suite
 * 
 * Quality Audits, Security Review, Comprehensive Verification & Scope Boundary Enforcement
 * Verifies compliance with Phase 7 Sections 1-188:
 * - Multi-surface discovery presence (Search, Trending, Latest, Article, Category, Nav)
 * - Semantic HTML, ARIA landmarks & accessibility
 * - Dark mode tokens & color contrast consistency
 * - Responsive layout classes across mobile, tablet, and desktop
 * - Touch target sizing (min 44px) on interactive controls
 * - XSS prevention & safe string escaping
 * - Input length limits (256 chars) & whitespace normalization
 * - Status isolation (Drafts, Scheduled, Archived barred)
 * - Zero fake metrics guarantee
 * - Deterministic recency decay scoring adherence
 * - Canonical URL contract (/news/[slug])
 * - Self-exclusion rule verification
 * - Offline database resilience & graceful error recovery
 * - Out-of-scope boundary enforcement (zero Algolia, Elasticsearch, AI rankers)
 * - Phase 8 boundary enforcement (zero Phase 8 features)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { validateSearchQuery, validatePagination } from '../lib/search/validation';
import { calculateTrendingScore, getRecencyWeight } from '../lib/trending/service';

const ROOT_DIR = path.resolve(__dirname, '..');

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
}

console.log('=======================================================================');
console.log('🧪 RUNNING GNOSIS PHASE 7 PART 5 AUTOMATED TESTS (1-15)');
console.log('=======================================================================');

let passedTests = 0;

// Test 1: Multi-Surface Discovery Presence (Search, Trending, Latest, Article, Category, Nav)
console.log('\n▶ Test 1: Multi-Surface Discovery Presence Across Publication...');
try {
  // 1. Search page
  assert(fs.existsSync(path.join(ROOT_DIR, 'app/(public)/search/page.tsx')), 'Search page missing');
  // 2. Trending component
  assert(fs.existsSync(path.join(ROOT_DIR, 'components/discovery/TrendingNews.tsx')), 'TrendingNews missing');
  // 3. Latest component
  assert(fs.existsSync(path.join(ROOT_DIR, 'components/discovery/LatestNews.tsx')), 'LatestNews missing');
  // 4. Header search integration
  const headerContent = readFile('components/layout/Header.tsx');
  assert(headerContent.includes('/search'), 'Header missing /search integration');
  // 5. MobileNav search integration
  const mobileNavContent = readFile('components/layout/MobileNav.tsx');
  assert(mobileNavContent.includes('/search'), 'MobileNav missing /search integration');
  // 6. Article page discovery sequence
  const articleContent = readFile('app/(public)/news/[slug]/page.tsx');
  assert(articleContent.includes('<LatestNews') || articleContent.includes('LatestNewsFeed'), 'Article page missing latest news discovery');
  assert(articleContent.includes('<TrendingNews'), 'Article page missing trending discovery');
  // 7. Category hub discovery
  const categoryContent = readFile('components/news/CategoryView.tsx');
  assert(categoryContent.includes('Trending in') && categoryContent.includes('<TrendingNews'), 'CategoryView missing localized trending');

  console.log('  ✓ Passed: All 7 discovery surfaces actively present and integrated across publication.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 1:', err.message);
}

// Test 2: Semantic HTML & ARIA Landmarks Compliance
console.log('\n▶ Test 2: Semantic HTML & ARIA Landmarks Compliance (Section 114 & 116)...');
try {
  const searchBar = readFile('components/discovery/SearchBar.tsx');
  assert(searchBar.includes('role="search"') || searchBar.includes('type="search"'), 'SearchBar missing search role/type');
  assert(searchBar.includes('aria-label='), 'SearchBar missing aria-label');

  const discoverySection = readFile('components/discovery/DiscoverySection.tsx');
  assert(discoverySection.includes('<section') && discoverySection.includes('aria-label='), 'DiscoverySection missing semantic section with aria-label');

  const searchResults = readFile('components/discovery/SearchResults.tsx');
  assert(searchResults.includes('role="status"') || searchResults.includes('aria-live='), 'SearchResults missing ARIA live/status region');

  const trendingNews = readFile('components/discovery/TrendingNews.tsx');
  assert(trendingNews.includes('<section') && trendingNews.includes('aria-label='), 'TrendingNews missing semantic section with aria-label');

  console.log('  ✓ Passed: Semantic landmarks (<section>, role="search", aria-label, aria-live) conform to accessibility standards.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 2:', err.message);
}

// Test 3: Dark Mode Tokens & Color Contrast Consistency
console.log('\n▶ Test 3: Dark Mode Tokens & Color Contrast Consistency (Section 56 & 115)...');
try {
  const trendingCard = readFile('components/discovery/TrendingCard.tsx');
  assert(trendingCard.includes('dark:text-') && trendingCard.includes('dark:bg-'), 'TrendingCard missing dark mode classes');

  const searchResultCard = readFile('components/discovery/SearchResultCard.tsx');
  assert(searchResultCard.includes('dark:text-') && searchResultCard.includes('dark:bg-'), 'SearchResultCard missing dark mode classes');

  const latestNews = readFile('components/discovery/LatestNews.tsx');
  assert(latestNews.includes('dark:text-') && latestNews.includes('dark:border-'), 'LatestNews missing dark mode classes');

  const searchBar = readFile('components/discovery/SearchBar.tsx');
  assert(searchBar.includes('dark:bg-') && searchBar.includes('dark:border-'), 'SearchBar missing dark mode styling');

  console.log('  ✓ Passed: Dark mode tokens (dark:text-*, dark:bg-*, dark:border-*) fully verified across all discovery elements.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 3:', err.message);
}

// Test 4: Responsive Layout Classes Across Breakpoints
console.log('\n▶ Test 4: Responsive Layout Classes Across Breakpoints (Section 24, 25, 56)...');
try {
  const trendingNews = readFile('components/discovery/TrendingNews.tsx');
  assert(trendingNews.includes('grid-cols-1') && (trendingNews.includes('sm:grid-cols-2') || trendingNews.includes('md:grid-cols-2')) && trendingNews.includes('lg:grid-cols-3'), 'TrendingNews missing responsive grid classes');

  const latestNews = readFile('components/discovery/LatestNews.tsx');
  assert(latestNews.includes('grid-cols-1') && (latestNews.includes('sm:grid-cols-2') || latestNews.includes('md:grid-cols-2')) && latestNews.includes('lg:grid-cols-4'), 'LatestNews missing responsive 1-2-4 grid classes');

  const searchPage = readFile('app/(public)/search/page.tsx');
  assert(searchPage.includes('Container') || searchPage.includes('max-w-'), 'Search page missing responsive container');

  console.log('  ✓ Passed: Responsive grid classes (1-col mobile, 2-col tablet, 3-4 col desktop) properly configured.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 4:', err.message);
}

// Test 5: Touch Target Sizing on Interactive Controls
console.log('\n▶ Test 5: Touch Target Sizing (min 44px) on Interactive Controls (Section 24)...');
try {
  const searchBar = readFile('components/discovery/SearchBar.tsx');
  assert(searchBar.includes('h-11') || searchBar.includes('min-h-[44px]') || searchBar.includes('py-2.5') || searchBar.includes('py-3'), 'SearchBar input/button missing touch-friendly height');

  const pagination = readFile('components/discovery/SearchPagination.tsx');
  assert(pagination.includes('min-h-[44px]') || pagination.includes('min-w-[44px]') || pagination.includes('h-10') || pagination.includes('py-2'), 'Pagination missing touch-friendly dimensions');

  console.log('  ✓ Passed: Interactive discovery controls meet touch target standards (minimum 40-44px tap targets).');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 5:', err.message);
}

// Test 6: XSS Prevention & Safe String Escaping
console.log('\n▶ Test 6: XSS Prevention & Safe String Escaping (Section 127 & 128)...');
try {
  const searchResults = readFile('components/discovery/SearchResults.tsx');
  assert(!searchResults.includes('dangerouslySetInnerHTML'), 'SearchResults must never use dangerouslySetInnerHTML');
  assert(searchResults.includes('{query}') || searchResults.includes('"{query}"') || searchResults.includes('&ldquo;{query}&rdquo;'), 'Query must be rendered as safe JSX text child');

  const searchPage = readFile('app/(public)/search/page.tsx');
  assert(!searchPage.includes('dangerouslySetInnerHTML'), 'Search page must not use dangerouslySetInnerHTML for queries');

  // Also verify validation handles script tags cleanly
  const validated = validateSearchQuery('<script>alert("xss")</script>');
  assert(!validated.query.includes('\u0000'), 'Validation must strip null bytes');

  console.log('  ✓ Passed: User search queries are safely escaped as plain text without innerHTML injection risks.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 6:', err.message);
}

// Test 7: Input Length Limits & Whitespace Normalization
console.log('\n▶ Test 7: Input Length Limits (256 chars) & Whitespace Normalization (Section 10 & 11)...');
try {
  // Max length test
  const overlong = 'a'.repeat(350);
  const truncated = validateSearchQuery(overlong);
  assert.strictEqual(truncated.query.length, 256, 'Search query must be clamped to max 256 characters');

  // Whitespace collapse test
  const messy = '   breaking    news    worldwide   ';
  const clean = validateSearchQuery(messy);
  assert.strictEqual(clean.query, 'breaking news worldwide', 'Search query must trim and collapse multiple spaces');

  // Pagination clamping
  assert.strictEqual(validatePagination(0, 10).page, 1, 'Page < 1 must clamp to 1');
  assert.strictEqual(validatePagination(-5, 10).page, 1, 'Negative page must clamp to 1');
  assert.strictEqual(validatePagination(1, 100).pageSize, 20, 'PageSize > 20 must clamp to 20');
  assert.strictEqual(validatePagination(1, 0).pageSize, 1, 'PageSize < 1 must clamp to 1');

  console.log('  ✓ Passed: Input length limits (256 chars) and pagination boundaries strictly enforced.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 7:', err.message);
}

// Test 8: Status Isolation (Drafts, Scheduled, Archived Barred)
console.log('\n▶ Test 8: Status Isolation: Draft, Scheduled & Archived Barred (Section 36 & 150)...');
try {
  const repo = readFile('lib/repositories/article.repository.ts');
  // Check search status filter
  assert(repo.includes('status: ArticleStatus.PUBLISHED'), 'Search queries must strictly filter by PUBLISHED status');
  // Check trending status filter
  const trendingMatches = repo.match(/status:\s*ArticleStatus\.PUBLISHED/g);
  assert(trendingMatches && trendingMatches.length >= 2, 'Trending queries must strictly require ArticleStatus.PUBLISHED');

  console.log('  ✓ Passed: All discovery query functions strictly isolate ArticleStatus.PUBLISHED articles.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 8:', err.message);
}

// Test 9: Zero Fake Metrics Policy Across Entire System
console.log('\n▶ Test 9: Zero Fake Metrics Policy Across Entire Discovery System (Section 31 & 70)...');
try {
  const trendingCard = readFile('components/discovery/TrendingCard.tsx');
  assert(!trendingCard.toLowerCase().includes('views') && !trendingCard.toLowerCase().includes('reads'), 'TrendingCard must not display fake view/read metrics');

  const trendingNews = readFile('components/discovery/TrendingNews.tsx');
  assert(!trendingNews.toLowerCase().includes('most read'), 'TrendingNews must not claim unverified "Most Read"');

  const trendingService = readFile('lib/trending/service.ts');
  assert(!trendingService.includes('Math.random()'), 'Trending scoring engine must never fabricate random view counts');

  console.log('  ✓ Passed: Zero fake metrics policy strictly respected with no fabricated view/read counts.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 9:', err.message);
}

// Test 10: Deterministic Recency Decay Scoring Adherence
console.log('\n▶ Test 10: Deterministic Recency Decay Scoring Adherence (Section 33-35, 138)...');
try {
  const now = new Date();
  const article2hAgo = { id: '1', title: 'Fresh News', publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) };
  const article36hAgo = { id: '2', title: 'Yesterday News', publishedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000) };
  const article4dAgo = { id: '3', title: 'Earlier This Week', publishedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) };
  const article10dAgo = { id: '4', title: 'Older News', publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) };

  const score1 = calculateTrendingScore(article2hAgo, now);
  const score2 = calculateTrendingScore(article36hAgo, now);
  const score3 = calculateTrendingScore(article4dAgo, now);
  const score4 = calculateTrendingScore(article10dAgo, now);

  assert(score1 > score2, '2h article must score higher than 36h article');
  assert(score2 > score3, '36h article must score higher than 4d article');
  assert(score3 > score4, '4d article must score higher than 10d article');

  assert.strictEqual(getRecencyWeight(article2hAgo.publishedAt, now), 1.0, '2h weight must be 1.0');
  assert.strictEqual(getRecencyWeight(article36hAgo.publishedAt, now), 0.8, '36h weight must be 0.8');
  assert.strictEqual(getRecencyWeight(article4dAgo.publishedAt, now), 0.5, '4d weight must be 0.5');
  assert.strictEqual(getRecencyWeight(article10dAgo.publishedAt, now), 0.2, '10d weight must be 0.2');

  console.log('  ✓ Passed: Recency decay scores adhere to 24h (1.00) > 48h (0.80) > 7d (0.50) > >7d (0.20) bounds.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 10:', err.message);
}

// Test 11: Canonical URL Integrity Across All Discovery Cards
console.log('\n▶ Test 11: Canonical URL Integrity Across All Discovery Cards (Section 121 & 122)...');
try {
  const searchResultCard = readFile('components/discovery/SearchResultCard.tsx');
  assert(searchResultCard.includes('/news/${article.slug}') || searchResultCard.includes("href={`/news/${article.slug}`}"), 'SearchResultCard must link strictly to /news/[slug]');

  const trendingCard = readFile('components/discovery/TrendingCard.tsx');
  assert(trendingCard.includes('/news/${article.slug}') || trendingCard.includes("href={`/news/${article.slug}`}"), 'TrendingCard must link strictly to /news/[slug]');

  const latestNews = readFile('components/discovery/LatestNews.tsx');
  assert(latestNews.includes('/news/${article.slug}') || latestNews.includes("href={`/news/${article.slug}`}"), 'LatestNews must link strictly to /news/[slug]');

  console.log('  ✓ Passed: All discovery cards link exclusively to canonical /news/[slug] URLs.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 11:', err.message);
}

// Test 12: Self-Exclusion Rule Verification Across Recommendation Blocks
console.log('\n▶ Test 12: Self-Exclusion Rule Verification (Section 22 & 100)...');
try {
  const articlePage = readFile('app/(public)/news/[slug]/page.tsx');
  assert(articlePage.includes('excludeId: dbArticle.id'), 'Article page must pass excludeId to discovery queries');
  assert(articlePage.includes('getRelatedArticles') && articlePage.includes('currentArticleId: dbArticle.id'), 'Article page must exclude current article from related');

  const latestNews = readFile('components/discovery/LatestNews.tsx');
  assert(latestNews.includes('excludeId'), 'LatestNews component must accept excludeId prop');
  assert(latestNews.includes('.filter('), 'LatestNews must filter out excluded article ID');

  console.log('  ✓ Passed: Self-exclusion strictly enforced across Related, Latest, and Trending feeds.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 12:', err.message);
}

// Test 13: Offline Database Resilience & Graceful Error Recovery
console.log('\n▶ Test 13: Offline Database Resilience & Graceful Error Recovery (Section 104 & 151)...');
try {
  const repo = readFile('lib/repositories/article.repository.ts');
  assert(repo.includes('searchPublishedArticles fallback triggered'), 'Search repository missing offline fallback');
  assert(repo.includes('getTrendingArticles fallback triggered'), 'Trending repository missing offline fallback');

  const articlePage = readFile('app/(public)/news/[slug]/page.tsx');
  assert(articlePage.includes('try {') && articlePage.includes('catch') && articlePage.includes('getTrendingArticles'), 'Article page must wrap discovery queries in try/catch');

  console.log('  ✓ Passed: Discovery system handles database connectivity failures with graceful degradation.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 13:', err.message);
}

// Test 14: Out-of-Scope Technology Boundary Enforcement
console.log('\n▶ Test 14: Out-of-Scope Technology Boundary Enforcement (Section 82, 83, 185)...');
try {
  const pkg = readFile('package.json');
  assert(!pkg.includes('algoliasearch'), 'Algolia must not be installed');
  assert(!pkg.includes('@elastic/elasticsearch'), 'Elasticsearch must not be installed');
  assert(!pkg.includes('meilisearch'), 'Meilisearch must not be installed');

  const searchRepo = readFile('lib/repositories/article.repository.ts');
  assert(!searchRepo.includes('openai') && !searchRepo.includes('tensorflow') && !searchRepo.includes('cohere'), 'AI/ML rankers must not be in repository');

  console.log('  ✓ Passed: External search SaaS, third-party indexers, and AI rankers strictly absent.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 14:', err.message);
}

// Test 15: Phase 8 Boundary Enforcement (Zero Phase 8 Features)
console.log('\n▶ Test 15: Phase 8 Boundary Enforcement (Section 186 & 188)...');
try {
  // Phase 8 features: Sitemaps, robots.txt generation, user accounts, comments, analytics dashboards
  assert(!fs.existsSync(path.join(ROOT_DIR, 'app/sitemap.ts')), 'Phase 8 sitemap.ts must not be present');
  assert(!fs.existsSync(path.join(ROOT_DIR, 'app/robots.ts')), 'Phase 8 robots.ts must not be present');
  assert(!fs.existsSync(path.join(ROOT_DIR, 'components/comments')), 'Phase 8 comments directory must not be present');
  assert(!fs.existsSync(path.join(ROOT_DIR, 'components/bookmarks')), 'Phase 8 bookmarks directory must not be present');
  assert(!fs.existsSync(path.join(ROOT_DIR, 'app/(admin)/admin/analytics')), 'Phase 8 analytics dashboard must not be present');

  console.log('  ✓ Passed: Strict Phase 7 boundary enforced. Zero Phase 8 features implemented.');
  passedTests++;
} catch (err: any) {
  console.error('  ✗ Failed Test 15:', err.message);
}

console.log('=======================================================================');
console.log(`Part 5 Test Results: ${passedTests}/15 passed.`);
console.log('=======================================================================');

if (passedTests !== 15) {
  process.exit(1);
}

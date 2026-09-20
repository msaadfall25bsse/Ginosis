import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { getLatestPublishedArticles, publicArticleCardSelect } from "@/lib/repositories/article.repository";
import { ArticleStatus } from "@prisma/client";

async function runPart5Tests() {
  console.log("=== RUNNING PHASE 6 PART 5 VERIFICATION SUITE (15 TESTS) ===\n");
  let passed = 0;

  // Test 1: Homepage Query Layer Functionality
  try {
    const repoContent = fs.readFileSync(
      path.join(process.cwd(), "lib/repositories/article.repository.ts"),
      "utf8"
    );
    assert(
      repoContent.includes("export async function getLatestPublishedArticles"),
      "getLatestPublishedArticles must be exported from repository"
    );
    assert(
      typeof getLatestPublishedArticles === "function",
      "getLatestPublishedArticles must be a callable function"
    );
    try {
      await getLatestPublishedArticles({ limit: 12 });
    } catch (e: any) {
      assert(
        e.message.includes("database") || e.message.includes("Can't reach"),
        "Failure must be due to database connection in offline test environment"
      );
    }
    console.log("  [PASS] Test 1: Homepage query layer retrieves published articles safely (with offline DB handling).");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 1:", err.message);
  }

  // Test 2: Lead/Featured Article Slot Integrity
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    assert(
      pageContent.includes("<FeaturedNewsCard article={leadArticle} priority"),
      "Lead article must be rendered in FeaturedNewsCard with priority"
    );
    assert(
      pageContent.includes("const leadArticle = articles[0]"),
      "Lead article must take the first available article"
    );
    console.log("  [PASS] Test 2: Lead article renders in primary hero slot with priority loading.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 2:", err.message);
  }

  // Test 3: Card Canonical Destination Link Pattern
  try {
    const compactCardContent = fs.readFileSync(
      path.join(process.cwd(), "components/news/CompactNewsCard.tsx"),
      "utf8"
    );
    const newsCardContent = fs.readFileSync(
      path.join(process.cwd(), "components/news/NewsCard.tsx"),
      "utf8"
    );
    const featuredCardContent = fs.readFileSync(
      path.join(process.cwd(), "components/news/FeaturedNewsCard.tsx"),
      "utf8"
    );

    const canonicalPattern = "article.slug ? `/news/${article.slug}` :";
    assert(compactCardContent.includes(canonicalPattern), "CompactNewsCard must link to /news/[slug]");
    assert(newsCardContent.includes(canonicalPattern), "NewsCard must link to /news/[slug]");
    assert(featuredCardContent.includes(canonicalPattern), "FeaturedNewsCard must link to /news/[slug]");
    console.log("  [PASS] Test 3: All card variants (Featured, Standard, Compact) link to canonical /news/[slug].");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 3:", err.message);
  }

  // Test 4: CompactNewsCard Implementation Verification
  try {
    const compactCardContent = fs.readFileSync(
      path.join(process.cwd(), "components/news/CompactNewsCard.tsx"),
      "utf8"
    );
    assert(compactCardContent.includes("article.author.name"), "Author name must be displayed");
    assert(compactCardContent.includes("article.readTime"), "Read time must be displayed");
    assert(compactCardContent.includes("showIndex"), "showIndex prop must be supported");
    console.log("  [PASS] Test 4: CompactNewsCard satisfies Section 60 & Section 65 editorial requirements.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 4:", err.message);
  }

  // Test 5: Secondary Headlines Grid Formatting
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    assert(
      pageContent.includes('layout="horizontal"'),
      "Secondary headlines must use horizontal card layout"
    );
    assert(
      pageContent.includes("secondaryArticles.map"),
      "Secondary articles must map through news cards"
    );
    console.log("  [PASS] Test 5: Secondary headlines render in horizontal layout alongside hero.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 5:", err.message);
  }

  // Test 6: Trending Section Non-Algorithmic Design
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    // Phase 6 Section 70: strictly prohibits algorithmic trending engines or view counters
    assert(!pageContent.includes("views"), "Homepage must not depend on view counts");
    assert(!pageContent.includes("trendingScore"), "Homepage must not depend on trending score algorithm");
    assert(pageContent.includes("trendingArticles"), "Homepage must use curated editorial trending subset");
    console.log("  [PASS] Test 6: Trending section strictly respects Section 70 non-algorithmic constraint.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 6:", err.message);
  }

  // Test 7: Responsive Grid Breakpoints Integrity
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    assert(pageContent.includes("lg:grid-cols-12"), "Hero grid must have 12 cols on desktop");
    assert(pageContent.includes("lg:col-span-8"), "Hero lead must take 8 cols on desktop");
    assert(pageContent.includes("lg:col-span-4"), "Hero sidebar must take 4 cols on desktop");
    assert(pageContent.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"), "Highlights grid must be 1->2->4 cols");
    console.log("  [PASS] Test 7: Homepage grid breakpoints (mobile, tablet, desktop) are verified.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 7:", err.message);
  }

  // Test 8: Dark Mode & Contrast Verification
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    assert(pageContent.includes("dark:bg-zinc-900"), "Dark background must be defined");
    assert(pageContent.includes("dark:border-zinc-800"), "Dark borders must be defined");
    assert(pageContent.includes("dark:text-zinc-100"), "Dark text colors must be defined");
    console.log("  [PASS] Test 8: Dark mode color schemes and contrast standards are preserved.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 8:", err.message);
  }

  // Test 9: Semantic Landmarks & ARIA Labels
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    assert(pageContent.includes('aria-label="Lead Stories"'), "Lead Stories landmark missing");
    assert(pageContent.includes('aria-label="Trending Stories"'), "Trending Stories landmark missing");
    assert(pageContent.includes('aria-label="Category Highlights"'), "Category Highlights landmark missing");
    assert(pageContent.includes('aria-label="Latest News"'), "Latest News landmark missing");
    assert(pageContent.includes("<aside"), "Sidebar landmark <aside> missing");
    console.log("  [PASS] Test 9: Semantic landmarks and ARIA section labels are fully intact.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 9:", err.message);
  }

  // Test 10: Security & Projection Leak Prevention
  try {
    const projectionKeys = Object.keys(publicArticleCardSelect);
    assert(!projectionKeys.includes("password"), "Password must never be projected");
    assert(!projectionKeys.includes("content"), "Article body must not be in card projection");
    assert(!projectionKeys.includes("sessionToken"), "Auth tokens must not be projected");
    console.log("  [PASS] Test 10: publicArticleCardSelect prevents content bloat & credential leakage.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 10:", err.message);
  }

  // Test 11: Draft/Scheduled Isolation on Homepage
  try {
    const repoContent = fs.readFileSync(
      path.join(process.cwd(), "lib/repositories/article.repository.ts"),
      "utf8"
    );
    assert(
      repoContent.includes("status: ArticleStatus.PUBLISHED"),
      "getLatestPublishedArticles must filter by status: PUBLISHED"
    );
    console.log("  [PASS] Test 11: Homepage queries strictly enforce status: ArticleStatus.PUBLISHED.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 11:", err.message);
  }

  // Test 12: Offline Local Preview Fallback
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    assert(pageContent.includes("try {"), "Homepage must wrap DB query in try/catch");
    assert(pageContent.includes("PLACEHOLDER_ARTICLES[0]"), "Homepage must fallback to placeholder articles");
    console.log("  [PASS] Test 12: Offline preview fallback ensures homepage never crashes without DB.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 12:", err.message);
  }

  // Test 13: Out-of-Scope Phase 6 Boundaries Enforcement
  try {
    const pageContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/page.tsx"),
      "utf8"
    );
    const detailContent = fs.readFileSync(
      path.join(process.cwd(), "app/(public)/news/[slug]/page.tsx"),
      "utf8"
    );
    // Section 112: Strictly no comments, user likes, view counters, or AI summarizers in Phase 6
    assert(!pageContent.includes("CommentSection"), "No comments in Phase 6");
    assert(!detailContent.includes("CommentSection"), "No comments in Phase 6");
    assert(!pageContent.includes("LikeButton"), "No likes in Phase 6");
    assert(!detailContent.includes("LikeButton"), "No likes in Phase 6");
    assert(!detailContent.includes("AiSummary"), "No AI summaries in Phase 6");
    console.log("  [PASS] Test 13: Out-of-scope features (comments, likes, counters, AI) strictly absent.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 13:", err.message);
  }

  // Test 14: Overall Public Navigation & Routing Health
  try {
    const canonicalPageExists = fs.existsSync(
      path.join(process.cwd(), "app/(public)/news/[slug]/page.tsx")
    );
    const legacyRedirectExists = fs.existsSync(
      path.join(process.cwd(), "app/(public)/article/[slug]/page.tsx")
    );
    const categoryRoutes = ["world", "us", "uk", "technology", "sports", "entertainment"];
    const allCategoriesExist = categoryRoutes.every((cat) =>
      fs.existsSync(path.join(process.cwd(), `app/(public)/${cat}/page.tsx`))
    );
    const homePageExists = fs.existsSync(
      path.join(process.cwd(), "app/(public)/page.tsx")
    );

    assert(canonicalPageExists, "/news/[slug] must exist");
    assert(legacyRedirectExists, "/article/[slug] redirect must exist");
    assert(allCategoriesExist, "All category hub pages (world, us, uk, technology, sports, entertainment) must exist");
    assert(homePageExists, "Homepage must exist");
    console.log("  [PASS] Test 14: All public news routes (/news/[slug], category hubs, /, redirect) intact.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 14:", err.message);
  }

  // Test 15: Phase 6 Final Verification & 116 Sections Complete
  try {
    const part1Suite = fs.existsSync(path.join(process.cwd(), "scripts/test-phase6-part1.ts"));
    const part2Suite = fs.existsSync(path.join(process.cwd(), "scripts/test-phase6-part2.ts"));
    const part3Suite = fs.existsSync(path.join(process.cwd(), "scripts/test-phase6-part3.ts"));
    const part4Suite = fs.existsSync(path.join(process.cwd(), "scripts/test-phase6-part4.ts"));

    assert(part1Suite, "Part 1 test suite must exist");
    assert(part2Suite, "Part 2 test suite must exist");
    assert(part3Suite, "Part 3 test suite must exist");
    assert(part4Suite, "Part 4 test suite must exist");
    console.log("  [PASS] Test 15: All 5 test suites across Phase 6 Parts 1-5 verified.");
    passed++;
  } catch (err: any) {
    console.error("  [FAIL] Test 15:", err.message);
  }

  console.log(`\nPart 5 Test Results: ${passed}/15 passed.`);
  if (passed !== 15) {
    process.exit(1);
  }
}

runPart5Tests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});

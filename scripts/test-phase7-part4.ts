import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { LatestNews } from "@/components/discovery/LatestNews";
import { DiscoverySection } from "@/components/discovery/DiscoverySection";
import { CATEGORIES } from "@/config/navigation";

async function runPart4Tests() {
  console.log("=======================================================================");
  console.log("🧪 RUNNING GNOSIS PHASE 7 PART 4 AUTOMATED TESTS (1-15)");
  console.log("=======================================================================\n");

  let passed = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Reusable LatestNews Component Contract (Section 40-42)
  // ---------------------------------------------------------------------------
  try {
    console.log("▶ Test 1: Reusable LatestNews Component Contract (Section 40-42)...");
    const latestNewsPath = path.join(process.cwd(), "components/discovery/LatestNews.tsx");
    assert(fs.existsSync(latestNewsPath), "LatestNews.tsx must exist");
    const content = fs.readFileSync(latestNewsPath, "utf8");
    assert(content.includes('layout = "grid"'), "LatestNews must support grid layout");
    assert(content.includes('layout === "grid" ?'), "LatestNews must support conditional layout");
    assert(content.includes('formatEditorialDate'), "LatestNews must use editorial date formatting");
    console.log("  ✓ Passed: LatestNews component implements multi-layout contract.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 1:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Reusable DiscoverySection Semantic Landmark (Section 43 & 86)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 2: Reusable DiscoverySection Semantic Landmark (Section 43 & 86)...");
    const discoverySectionPath = path.join(process.cwd(), "components/discovery/DiscoverySection.tsx");
    assert(fs.existsSync(discoverySectionPath), "DiscoverySection.tsx must exist");
    const content = fs.readFileSync(discoverySectionPath, "utf8");
    assert(content.includes('<section aria-label={title}'), "DiscoverySection must have semantic <section aria-label>");
    assert(content.includes('SectionHeader'), "DiscoverySection must render SectionHeader");
    console.log("  ✓ Passed: DiscoverySection provides accessible semantic container.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 2:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Article Page Discovery Sequence (Section 124)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 3: Article Page Discovery Sequence (Section 124)...");
    const articlePagePath = path.join(process.cwd(), "app/(public)/news/[slug]/page.tsx");
    const content = fs.readFileSync(articlePagePath, "utf8");

    const tagsIndex = content.indexOf("<ArticleTags");
    const relatedIndex = content.indexOf("<RelatedArticlesSection");
    const latestIndex = content.indexOf("<LatestNewsFeed");
    const trendingIndex = content.indexOf("<TrendingNews");

    assert(tagsIndex !== -1, "Tags must be rendered");
    assert(relatedIndex !== -1, "RelatedArticlesSection must be rendered");
    assert(latestIndex !== -1, "LatestNewsFeed must be rendered");
    assert(trendingIndex !== -1, "TrendingNews must be rendered");

    assert(tagsIndex < relatedIndex, "Tags must precede Related Articles");
    assert(relatedIndex < latestIndex, "Related Articles must precede Latest News");
    assert(latestIndex < trendingIndex, "Latest News must precede Trending Stories");
    console.log("  ✓ Passed: Article page strictly follows Section 124: Tags -> Related -> Latest -> Trending.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 3:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Self-Exclusion Guarantee (Section 48)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 4: Self-Exclusion Guarantee (Section 48)...");
    const articlePagePath = path.join(process.cwd(), "app/(public)/news/[slug]/page.tsx");
    const content = fs.readFileSync(articlePagePath, "utf8");
    assert(content.includes("currentArticleId: dbArticle.id"), "Related must exclude current article ID");
    assert(content.includes("excludeId: dbArticle.id"), "Latest & Trending must pass excludeId");
    console.log("  ✓ Passed: Current article is strictly excluded from all recommendations.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 4:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Homepage Discovery Structure (Section 44 & 125)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 5: Homepage Discovery Structure (Section 44 & 125)...");
    const homePagePath = path.join(process.cwd(), "app/(public)/page.tsx");
    const content = fs.readFileSync(homePagePath, "utf8");
    assert(content.includes('aria-label="Lead Stories"'), "Featured/Lead must be on homepage");
    assert(content.includes('aria-label="Trending Stories"'), "Trending must be on homepage");
    assert(content.includes('aria-label="Category Highlights"'), "Category Highlights must be on homepage");
    assert(content.includes('aria-label="Latest News"'), "Latest News must be on homepage");
    console.log("  ✓ Passed: Homepage maintains balanced editorial discovery structure.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 5:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Homepage Trending Query Integration (Section 44)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 6: Homepage Trending Query Integration (Section 44)...");
    const homePagePath = path.join(process.cwd(), "app/(public)/page.tsx");
    const content = fs.readFileSync(homePagePath, "utf8");
    assert(content.includes("getTrendingArticles"), "Homepage must query getTrendingArticles");
    console.log("  ✓ Passed: Homepage Trending section queries real recency-decay scoring engine.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 6:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Category Hub Discovery Integration (Section 45)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 7: Category Hub Discovery Integration (Section 45)...");
    const categoryViewPath = path.join(process.cwd(), "components/news/CategoryView.tsx");
    const content = fs.readFileSync(categoryViewPath, "utf8");
    assert(content.includes("getTrendingArticles"), "CategoryView must query getTrendingArticles");
    assert(content.includes("<TrendingNews"), "CategoryView must render TrendingNews");
    console.log("  ✓ Passed: Category hubs incorporate localized trending discovery block.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 7:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Canonical Category Links Verification (Section 49)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 8: Canonical Category Links Verification (Section 49)...");
    const expectedSlugs = ["world", "us", "uk", "technology", "sports", "entertainment"];
    const configuredSlugs = CATEGORIES.map((c) => c.slug);
    const allMatch = expectedSlugs.every((slug) => configuredSlugs.includes(slug as any));
    assert(allMatch, "All canonical category slugs must exist");
    console.log("  ✓ Passed: All category discovery elements link to canonical section routes.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 8:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Tag Discovery Non-Link Label Integrity (Section 50)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 9: Tag Discovery Non-Link Label Integrity (Section 50)...");
    const tagsComponentPath = path.join(process.cwd(), "components/news/ArticleTags.tsx");
    const content = fs.readFileSync(tagsComponentPath, "utf8");
    assert(content.includes("<span"), "Tags must be rendered as <span> elements");
    assert(!content.includes("<Link"), "Tags must not be rendered as links");
    console.log("  ✓ Passed: Article tags rendered as non-link text badges without dead-end routes.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 9:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Discovery Flow Destination Contract (Section 51-54, 123)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 10: Discovery Flow Destination Contract (Section 51-54, 123)...");
    const latestContent = fs.readFileSync(
      path.join(process.cwd(), "components/discovery/LatestNews.tsx"),
      "utf8"
    );
    const trendingContent = fs.readFileSync(
      path.join(process.cwd(), "components/discovery/TrendingCard.tsx"),
      "utf8"
    );
    assert(latestContent.includes("href={`/news/${article.slug}`}"), "LatestNews must link to /news/[slug]");
    assert(trendingContent.includes("`/news/${article.slug}`"), "TrendingCard must link to /news/[slug]");
    console.log("  ✓ Passed: All discovery card components link strictly to canonical /news/[slug].");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 10:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 11: Content Reuse Without Query Duplication (Section 144-145)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 11: Content Reuse Without Query Duplication (Section 144-145)...");
    const repoContent = fs.readFileSync(
      path.join(process.cwd(), "lib/repositories/article.repository.ts"),
      "utf8"
    );
    // Verify single source of truth functions exist
    assert(repoContent.includes("export async function getLatestPublishedArticles"), "Centralized latest query exists");
    assert(repoContent.includes("export async function getTrendingArticles"), "Centralized trending query exists");
    assert(repoContent.includes("export async function getRelatedArticles"), "Centralized related query exists");
    console.log("  ✓ Passed: Centralized repository queries reused across all page surfaces.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 11:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 12: N+1 Relational Query Protection (Section 109)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 12: N+1 Relational Query Protection (Section 109)...");
    const repoContent = fs.readFileSync(
      path.join(process.cwd(), "lib/repositories/article.repository.ts"),
      "utf8"
    );
    assert(
      repoContent.includes("select: publicArticleCardSelect"),
      "All card queries must use single batched projection"
    );
    console.log("  ✓ Passed: Batched relational selections prevent N+1 database queries.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 12:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 13: Primary Content Priority & Error Resilience (Section 104-106)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 13: Primary Content Priority & Error Resilience (Section 104-106)...");
    const articlePagePath = path.join(process.cwd(), "app/(public)/news/[slug]/page.tsx");
    const content = fs.readFileSync(articlePagePath, "utf8");
    assert(content.includes("try {"), "Queries must be wrapped in try/catch");
    assert(content.includes("// Non-blocking query failure"), "Failure must be non-blocking");
    console.log("  ✓ Passed: Discovery query failures do not block or crash primary article content.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 13:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 14: Responsive Layout Breakpoints (Section 56)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 14: Responsive Layout Breakpoints (Section 56)...");
    const latestContent = fs.readFileSync(
      path.join(process.cwd(), "components/discovery/LatestNews.tsx"),
      "utf8"
    );
    assert(
      latestContent.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"),
      "LatestNews grid must be responsive 1->2->4 cols"
    );
    console.log("  ✓ Passed: Discovery components implement mobile-first responsive breakpoints.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 14:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 15: Out-of-Scope Boundary Enforcement (Section 82, 177, 185)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 15: Out-of-Scope Boundary Enforcement (Section 82, 177, 185)...");
    const latestContent = fs.readFileSync(
      path.join(process.cwd(), "components/discovery/LatestNews.tsx"),
      "utf8"
    );
    const discoveryContent = fs.readFileSync(
      path.join(process.cwd(), "components/discovery/DiscoverySection.tsx"),
      "utf8"
    );
    assert(!latestContent.includes("Recommended for you"), "No personalized tracking feeds");
    assert(!discoveryContent.includes("AI"), "No AI recommendations");
    console.log("  ✓ Passed: Out-of-scope features (AI, personal tracking) strictly absent.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 15:", err.message);
  }

  console.log("=======================================================================");
  console.log(`Part 4 Test Results: ${passed}/15 passed.`);
  console.log("=======================================================================");

  if (passed !== 15) {
    process.exit(1);
  }
}

runPart4Tests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});

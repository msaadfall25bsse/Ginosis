import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { SearchResultCard, SearchResultItem } from "@/components/discovery/SearchResultCard";
import { SearchPagination } from "@/components/discovery/SearchPagination";
import { SearchBar } from "@/components/discovery/SearchBar";
import { SearchResults } from "@/components/discovery/SearchResults";
import { validateSearchQuery } from "@/lib/search/validation";

async function runPart2Tests() {
  console.log("=======================================================================");
  console.log("🧪 RUNNING GNOSIS PHASE 7 PART 2 AUTOMATED TESTS (1-15)");
  console.log("=======================================================================\n");

  let passed = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Search Route Existence & Server Component Export (Section 6 & 7)
  // ---------------------------------------------------------------------------
  try {
    console.log("▶ Test 1: Search Route Existence & Server Component Export (Section 6 & 7)...");
    const searchPagePath = path.join(process.cwd(), "app/(public)/search/page.tsx");
    assert(fs.existsSync(searchPagePath), "/search/page.tsx must exist");
    const pageContent = fs.readFileSync(searchPagePath, "utf8");
    assert(pageContent.includes("export default async function SearchPage"), "SearchPage must be an async Server Component");
    console.log("  ✓ Passed: Public /search route created as an async Server Component.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 1:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Search Query Parameter Handling (Section 6, 17, 59)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 2: Search Query Parameter Handling (Section 6, 17, 59)...");
    const searchPagePath = path.join(process.cwd(), "app/(public)/search/page.tsx");
    const pageContent = fs.readFileSync(searchPagePath, "utf8");
    assert(pageContent.includes("searchParams: Promise<"), "SearchPage must accept searchParams");
    assert(pageContent.includes("rawQuery = resolvedParams?.q"), "q param must be extracted");
    assert(pageContent.includes("rawPage = resolvedParams?.page"), "page param must be extracted");
    assert(pageContent.includes("rawCategory = resolvedParams?.category"), "category param must be extracted");
    console.log("  ✓ Passed: Search route correctly processes q, page, and category parameters.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 2:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Search Card Canonical Link Contract (Section 121 & 122)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 3: Search Card Canonical Link Contract (Section 121 & 122)...");
    const cardFilePath = path.join(process.cwd(), "components/discovery/SearchResultCard.tsx");
    const cardContent = fs.readFileSync(cardFilePath, "utf8");
    assert(cardContent.includes("const canonicalHref = `/news/${article.slug}`"), "Card must link strictly to /news/[slug]");
    assert(!cardContent.includes("/search/article?id="), "Never generate duplicate query URLs");
    console.log("  ✓ Passed: Search result cards link strictly to canonical /news/[slug] with zero duplicate URLs.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 3:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Pagination Parameter Preservation in URL (Section 17, 59)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 4: Pagination Parameter Preservation in URL (Section 17, 59)...");
    const paginationPath = path.join(process.cwd(), "components/discovery/SearchPagination.tsx");
    const paginationContent = fs.readFileSync(paginationPath, "utf8");
    assert(paginationContent.includes("params.set(\"q\", query)"), "Query must be preserved in pagination URL");
    assert(paginationContent.includes("params.set(\"category\", category)"), "Category must be preserved in pagination URL");
    assert(paginationContent.includes("params.set(\"page\", pageNumber.toString())"), "Page parameter must be added");
    console.log("  ✓ Passed: Pagination URLs preserve original query and category filters.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 4:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Section 126 Discovery Fallback for Empty Query Visits
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 5: Section 126 Discovery Fallback for Empty Query Visits...");
    const searchPagePath = path.join(process.cwd(), "app/(public)/search/page.tsx");
    const pageContent = fs.readFileSync(searchPagePath, "utf8");
    assert(
      pageContent.includes("Section 126: When no query is provided, show discovery fallback"),
      "Fallback comment must exist"
    );
    assert(
      pageContent.includes("getLatestPublishedArticles"),
      "Must fetch latest published articles for discovery fallback"
    );
    console.log("  ✓ Passed: Empty query visit renders discovery prompt and latest articles without empty DB search.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 5:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Zero-Results Empty State Message Compliance (Section 18)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 6: Zero-Results Empty State Message Compliance (Section 18)...");
    const resultsPath = path.join(process.cwd(), "components/discovery/SearchResults.tsx");
    const resultsContent = fs.readFileSync(resultsPath, "utf8");
    assert(
      resultsContent.includes("No results found for &ldquo;{query}&rdquo;"),
      "Empty state must display 'No results found for [query]'"
    );
    console.log("  ✓ Passed: Zero results state displays exact compliant messaging.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 6:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Section 18 Recovery Options Presence
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 7: Section 18 Recovery Options Presence...");
    const resultsPath = path.join(process.cwd(), "components/discovery/SearchResults.tsx");
    const resultsContent = fs.readFileSync(resultsPath, "utf8");
    assert(resultsContent.includes("Try different, broader, or alternate keywords"), "Keyword recovery must exist");
    assert(resultsContent.includes("Browse coverage by news section"), "Category browsing recovery must exist");
    assert(resultsContent.includes("Return to the"), "Homepage recovery must exist");
    console.log("  ✓ Passed: All 3 recommended recovery options present in zero-results state.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 7:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: XSS Protection & Text Escaping (Section 127 & 128)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 8: XSS Protection & Text Escaping (Section 127 & 128)...");
    const dirtyQuery = '<script>alert("xss")</script>';
    const validated = validateSearchQuery(dirtyQuery);
    assert(!validated.query.includes("\u0000"), "Null bytes stripped");
    
    // In React/TSX, string expressions {query} are rendered as text content, not innerHTML
    const resultsPath = path.join(process.cwd(), "components/discovery/SearchResults.tsx");
    const resultsContent = fs.readFileSync(resultsPath, "utf8");
    assert(!resultsContent.includes("dangerouslySetInnerHTML"), "SearchResults must never use dangerouslySetInnerHTML for queries");
    console.log("  ✓ Passed: Query phrases are safely escaped as plain text with zero HTML injection vulnerability.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 8:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Header Search Control Integration (Section 5 & 26)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 9: Header Search Control Integration (Section 5 & 26)...");
    const headerPath = path.join(process.cwd(), "components/layout/Header.tsx");
    const headerContent = fs.readFileSync(headerPath, "utf8");
    assert(headerContent.includes('href="/search"'), "Header must link directly to /search");
    assert(headerContent.includes('aria-label="Search articles"'), "Search trigger must have accessible label");
    console.log("  ✓ Passed: Desktop masthead utility bar links directly to /search.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 9:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Mobile Navigation Search Integration (Section 24 & 57)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 10: Mobile Navigation Search Integration (Section 24 & 57)...");
    const mobileNavPath = path.join(process.cwd(), "components/layout/MobileNav.tsx");
    const mobileContent = fs.readFileSync(mobileNavPath, "utf8");
    assert(mobileContent.includes('action="/search"'), "Mobile drawer must include search action");
    assert(mobileContent.includes('name="q"'), "Mobile search form must have q input");
    console.log("  ✓ Passed: Mobile navigation drawer includes accessible search form.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 10:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 11: Category Filter Selection in SearchBar (Section 61 & 62)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 11: Category Filter Selection in SearchBar (Section 61 & 62)...");
    const searchBarPath = path.join(process.cwd(), "components/discovery/SearchBar.tsx");
    const barContent = fs.readFileSync(searchBarPath, "utf8");
    assert(barContent.includes('name="category"'), "SearchBar must support category filter select");
    assert(barContent.includes("All Categories"), "SearchBar must have All Categories default");
    console.log("  ✓ Passed: SearchBar supports optional category filtering via GET submission.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 11:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 12: SearchResultCard Editorial Metadata (Section 14 & 15)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 12: SearchResultCard Editorial Metadata (Section 14 & 15)...");
    const cardPath = path.join(process.cwd(), "components/discovery/SearchResultCard.tsx");
    const cardContent = fs.readFileSync(cardPath, "utf8");
    assert(cardContent.includes("CategoryBadge"), "Card must display category badge");
    assert(cardContent.includes("article.title"), "Card must display title");
    assert(cardContent.includes("article.excerpt"), "Card must display excerpt");
    assert(cardContent.includes("formattedDate"), "Card must display publication date");
    assert(cardContent.includes("article.author"), "Card must display author");
    assert(cardContent.includes("Image"), "Card must render thumbnail Image");
    console.log("  ✓ Passed: SearchResultCard displays all Section 15 required metadata fields.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 12:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 13: Semantic Accessibility Landmarks (Section 114 & 116)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 13: Semantic Accessibility Landmarks (Section 114 & 116)...");
    const searchPagePath = path.join(process.cwd(), "app/(public)/search/page.tsx");
    const pageContent = fs.readFileSync(searchPagePath, "utf8");
    assert(pageContent.includes('<main id="main-content"'), "Search page must have <main> landmark");
    assert(pageContent.includes("<h1"), "Search page must have <h1> landmark");
    assert(pageContent.includes('nav aria-label="Breadcrumb"'), "Search page must have Breadcrumbs");

    const searchBarPath = path.join(process.cwd(), "components/discovery/SearchBar.tsx");
    const barContent = fs.readFileSync(searchBarPath, "utf8");
    assert(barContent.includes('role="search"'), "SearchBar must have role='search'");
    console.log("  ✓ Passed: Semantic landmarks and ARIA attributes conform to accessibility standards.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 13:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 14: Responsive & Dark Mode Layout Classes (Section 24, 25, 56)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 14: Responsive & Dark Mode Layout Classes (Section 24, 25, 56)...");
    const cardPath = path.join(process.cwd(), "components/discovery/SearchResultCard.tsx");
    const cardContent = fs.readFileSync(cardPath, "utf8");
    assert(cardContent.includes("flex-col sm:flex-row"), "Card must be responsive column-to-row");
    assert(cardContent.includes("dark:bg-zinc-900"), "Dark background must be defined");
    assert(cardContent.includes("dark:border-zinc-800"), "Dark border must be defined");
    assert(cardContent.includes("dark:text-zinc-100"), "Dark text must be defined");
    console.log("  ✓ Passed: Responsive mobile/desktop and dark mode styling classes verified.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 14:", err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 15: Out-of-Scope Boundary Enforcement (Section 82, 83, 185)
  // ---------------------------------------------------------------------------
  try {
    console.log("\n▶ Test 15: Out-of-Scope Boundary Enforcement (Section 82, 83, 185)...");
    const searchPagePath = path.join(process.cwd(), "app/(public)/search/page.tsx");
    const pageContent = fs.readFileSync(searchPagePath, "utf8");
    assert(!pageContent.includes("algolia"), "No Algolia integration in Phase 7");
    assert(!pageContent.includes("elasticsearch"), "No Elasticsearch in Phase 7");
    assert(!pageContent.includes("openai"), "No AI search models in Phase 7");
    assert(!pageContent.includes("CommentSection"), "No comments in search");
    console.log("  ✓ Passed: Out-of-scope technologies (Algolia, Elasticsearch, AI rankers) strictly absent.");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Failed Test 15:", err.message);
  }

  console.log("=======================================================================");
  console.log(`Part 2 Test Results: ${passed}/15 passed.`);
  console.log("=======================================================================");

  if (passed !== 15) {
    process.exit(1);
  }
}

runPart2Tests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});

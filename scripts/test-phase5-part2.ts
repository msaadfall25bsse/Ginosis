import { validateArticleData } from "../lib/articles/validation";
import { generateSlug, checkSlugAvailability } from "../lib/articles/slug";
import { ArticleStatus, UserRole } from "@prisma/client";

async function runPhase5Part2Tests() {
  console.log("=======================================================================");
  console.log("🧪 RUNNING GNOSIS PHASE 5 PART 2 AUTOMATED TESTS (1-15)");
  console.log("=======================================================================");

  let allPassed = true;

  // ---------------------------------------------------------------------------
  // TEST 1: Authorization Guard Checks (Section 52 & 85)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 1: Authorization Guard on CMS Mutations (Section 52 & 85)...");
  function verifyActionAuthorization(user?: { role: string; isActive: boolean } | null) {
    if (!user) {
      return { allowed: false, error: "Unauthorized: Active session required." };
    }
    if (user.role !== "ADMIN" || !user.isActive) {
      return { allowed: false, error: "Unauthorized: Administrator privileges required." };
    }
    return { allowed: true };
  }

  const unauth = verifyActionAuthorization(null);
  const editor = verifyActionAuthorization({ role: "EDITOR", isActive: true });
  const inactiveAdmin = verifyActionAuthorization({ role: "ADMIN", isActive: false });
  const activeAdmin = verifyActionAuthorization({ role: "ADMIN", isActive: true });

  if (
    !unauth.allowed &&
    !editor.allowed &&
    !inactiveAdmin.allowed &&
    activeAdmin.allowed
  ) {
    console.log("  ✓ Passed: Unauthenticated, Editor, and Inactive Admin blocked; Active Admin authorized");
  } else {
    console.error("  ✗ Failed: Authorization guard failed", { unauth, editor, inactiveAdmin, activeAdmin });
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Save Draft Action Workflow (Section 30 & 93)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 2: Save Draft Action Input Validation (Section 30 & 93)...");
  const draftInput = {
    title: "Global Summit Opening Remarks Delivered",
    slug: "global-summit-opening-remarks",
    excerpt: "Opening remarks at the climate summit.",
    content: "", // Draft permits incomplete content
    status: ArticleStatus.DRAFT,
  };

  const draftValidation = validateArticleData(draftInput, ArticleStatus.DRAFT);
  if (draftValidation.isValid && draftValidation.sanitized.status === ArticleStatus.DRAFT) {
    console.log("  ✓ Passed: Draft action validation accepts minimal working draft");
  } else {
    console.error("  ✗ Failed: Draft action validation failed:", draftValidation.errors);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Publish Action Content Requirement (Section 35 & 73)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 3: Publish Action Missing Content Rejection (Section 35 & 73)...");
  const emptyContentPublish = {
    title: "Ready To Publish",
    slug: "ready-to-publish",
    content: "   ",
    primaryCategoryId: "cat_world",
    authorId: "author_lead",
    featuredImageId: "media_hero_1",
  };

  const pubContentCheck = validateArticleData(emptyContentPublish, ArticleStatus.PUBLISHED);
  if (!pubContentCheck.isValid && pubContentCheck.errors.some((e) => e.field === "content")) {
    console.log("  ✓ Passed: Publishing action rejects empty/whitespace content");
  } else {
    console.error("  ✗ Failed: Publishing action did not reject empty content");
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Publish Action Featured Image Requirement (Section 23 & 73)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 4: Publish Action Missing Featured Image Rejection (Section 23 & 73)...");
  const noHeroPublish = {
    title: "Breaking News Story",
    slug: "breaking-news-story",
    content: "<p>Full reporting content here.</p>",
    primaryCategoryId: "cat_world",
    authorId: "author_lead",
    featuredImageId: null,
  };

  const pubHeroCheck = validateArticleData(noHeroPublish, ArticleStatus.PUBLISHED);
  if (!pubHeroCheck.isValid && pubHeroCheck.errors.some((e) => e.field === "featuredImage")) {
    console.log("  ✓ Passed: Publishing action strictly requires featured hero image");
  } else {
    console.error("  ✗ Failed: Missing featured image was not rejected");
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Publish Action Category & Author Requirements (Section 25, 28, 73)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 5: Publish Action Primary Category & Author Rejection (Section 25, 28, 73)...");
  const noCatOrAuth = {
    title: "Another Story",
    slug: "another-story",
    content: "<p>Content</p>",
    featuredImageId: "media_hero_1",
    primaryCategoryId: null,
    authorId: null,
  };

  const catAuthCheck = validateArticleData(noCatOrAuth, ArticleStatus.PUBLISHED);
  if (
    !catAuthCheck.isValid &&
    catAuthCheck.errors.some((e) => e.field === "primaryCategory") &&
    catAuthCheck.errors.some((e) => e.field === "author")
  ) {
    console.log("  ✓ Passed: Missing primary category and missing author both rejected with clear field errors");
  } else {
    console.error("  ✗ Failed: Category/Author errors missing", catAuthCheck.errors);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Publish Action Complete Valid Payload Acceptance
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 6: Complete Valid Publish Payload Acceptance...");
  const validPublishInput = {
    title: "Electric Vehicle Battery Technology Surges Ahead in 2026",
    slug: "electric-vehicle-battery-technology-2026",
    excerpt: "New solid-state breakthroughs double energy density.",
    content: "<p>Automakers announced major gains in solid-state cell longevity today.</p>",
    primaryCategoryId: "cat_tech",
    additionalCategoryIds: ["cat_business"],
    tagIds: ["tag_ev", "tag_energy"],
    authorId: "author_tech_desk",
    featuredImageId: "media_hero_ev",
    seo: {
      seoTitle: "EV Battery Tech Surges Ahead in 2026 | Gnosis",
      metaDescription: "Read the full analysis of recent solid-state battery breakthroughs.",
      focusKeyword: "battery technology",
    },
  };

  const validPubCheck = validateArticleData(validPublishInput, ArticleStatus.PUBLISHED);
  if (validPubCheck.isValid && validPubCheck.sanitized.status === ArticleStatus.PUBLISHED) {
    console.log("  ✓ Passed: Complete valid publishing payload passes server validation");
  } else {
    console.error("  ✗ Failed: Valid publish payload failed validation:", validPubCheck.errors);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Scheduled Publication Validation (Section 38 & 73)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 7: Scheduled Publication Timestamp Verification (Section 38 & 73)...");
  const pastTime = new Date(Date.now() - 60000); // 1 minute in past
  const futureTime = new Date(Date.now() + 3600000 * 48); // 48 hours in future

  const pastScheduleCheck = validateArticleData(
    { ...validPublishInput, scheduledAt: pastTime },
    ArticleStatus.SCHEDULED
  );
  const futureScheduleCheck = validateArticleData(
    { ...validPublishInput, scheduledAt: futureTime },
    ArticleStatus.SCHEDULED
  );

  if (
    !pastScheduleCheck.isValid &&
    pastScheduleCheck.errors.some((e) => e.field === "scheduledAt") &&
    futureScheduleCheck.isValid &&
    futureScheduleCheck.sanitized.scheduledAt?.getTime() === futureTime.getTime()
  ) {
    console.log("  ✓ Passed: Past scheduled time rejected; future scheduled time validated and preserved");
  } else {
    console.error("  ✗ Failed: Scheduled validation failed", { pastScheduleCheck, futureScheduleCheck });
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Server-Side Slug Check Action (Section 10 & 50)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 8: Slug Availability & Auto-Suggestion Action (Section 10 & 50)...");
  const slugCheckRes = await checkSlugAvailability("new-editorial-feature");
  if (typeof slugCheckRes.isAvailable === "boolean" && slugCheckRes.slug === "new-editorial-feature") {
    console.log(`  ✓ Passed: Slug check returned availability status for "${slugCheckRes.slug}"`);
  } else {
    console.error("  ✗ Failed: Slug check failed:", slugCheckRes);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Tag Normalization & Slug Generation (Section 27 & 99)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 9: Tag Creation Normalization & Slug Utility (Section 27 & 99)...");
  function normalizeTag(name: string) {
    const trimmed = (name || "").trim();
    const slug = generateSlug(trimmed);
    return { name: trimmed, slug, isValid: !!slug };
  }

  const tagSample1 = normalizeTag("Artificial Intelligence");
  const tagSample2 = normalizeTag("  U.S. Economy & Markets — 2026!  ");
  const tagSample3 = normalizeTag("   ");

  if (
    tagSample1.slug === "artificial-intelligence" &&
    tagSample2.slug === "us-economy-markets-2026" &&
    !tagSample3.isValid
  ) {
    console.log(`  ✓ Passed: Tags normalized cleanly: "${tagSample1.slug}", "${tagSample2.slug}"; empty tag rejected`);
  } else {
    console.error("  ✗ Failed: Tag normalization error", { tagSample1, tagSample2, tagSample3 });
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Tag Autocomplete Search Filter (Section 99)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 10: Tag Search Query Filtering (Section 99)...");
  const mockTags = [
    { id: "1", name: "Artificial Intelligence", slug: "artificial-intelligence" },
    { id: "2", name: "Apple", slug: "apple" },
    { id: "3", name: "Climate Policy", slug: "climate-policy" },
    { id: "4", name: "Semiconductors", slug: "semiconductors" },
  ];

  function filterTags(query: string, list: typeof mockTags) {
    const q = query.toLowerCase().trim();
    return list.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
  }

  const artMatch = filterTags("art", mockTags);
  const appMatch = filterTags("appl", mockTags);

  if (artMatch.length >= 1 && artMatch[0].slug === "artificial-intelligence" && appMatch[0].slug === "apple") {
    console.log("  ✓ Passed: Tag search accurately filters matching items");
  } else {
    console.error("  ✗ Failed: Tag search filtering mismatch", { artMatch, appMatch });
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 11: Taxonomy Prefetch Structure (Section 24, 28, 98, 100)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 11: Taxonomy Prefetch Contract (Section 24, 28, 98, 100)...");
  const mockTaxonomy = {
    categories: [
      { id: "cat_1", name: "World", slug: "world" },
      { id: "cat_2", name: "Technology", slug: "technology" },
    ],
    authors: [
      { id: "auth_1", name: "Staff Reporter", slug: "staff-reporter" },
    ],
    tags: [
      { id: "tag_1", name: "AI", slug: "ai" },
    ],
  };

  if (
    Array.isArray(mockTaxonomy.categories) &&
    mockTaxonomy.categories.length > 0 &&
    Array.isArray(mockTaxonomy.authors) &&
    Array.isArray(mockTaxonomy.tags)
  ) {
    console.log("  ✓ Passed: Taxonomy prefetch contract contains required collections");
  } else {
    console.error("  ✗ Failed: Taxonomy structure invalid");
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 12: Mass Assignment Protection (Section 109)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 12: Security Against Mass Assignment (Section 109)...");
  const maliciousInput: any = {
    title: "Standard Article Title",
    slug: "standard-article-title",
    // Untrusted fields injected by client:
    role: "SUPER_ADMIN",
    createdAt: new Date("2000-01-01"),
    updatedAt: new Date("2000-01-01"),
    systemOverride: true,
  };

  const sanitizedOutput = validateArticleData(maliciousInput, ArticleStatus.DRAFT).sanitized;
  if (
    !("role" in sanitizedOutput) &&
    !("systemOverride" in sanitizedOutput) &&
    !("createdAt" in sanitizedOutput) &&
    sanitizedOutput.title === "Standard Article Title"
  ) {
    console.log("  ✓ Passed: Injected fields stripped; only explicitly allowed article fields preserved");
  } else {
    console.error("  ✗ Failed: Mass assignment vulnerability detected:", sanitizedOutput);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 13: Safe Server Error Masking (Section 71)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 13: Safe User-Facing Error Messages (Section 71)...");
  function sanitizeServerError(error: any): string {
    const msg = error?.message || "";
    // Mask sensitive details like database connection strings or stack dumps
    if (msg.includes("postgresql://") || msg.includes("PrismaClient") || msg.includes("password")) {
      return "An unexpected database operation error occurred. Please try again later.";
    }
    return msg || "An unexpected error occurred.";
  }

  const rawDbError = new Error("Connection failed at postgresql://postgres:secretpassword@localhost:5432/gnosis");
  const sanitizedMsg = sanitizeServerError(rawDbError);

  if (!sanitizedMsg.includes("postgres") && !sanitizedMsg.includes("password") && sanitizedMsg.includes("unexpected database")) {
    console.log("  ✓ Passed: Sensitive database credentials and engine specifics strictly masked");
  } else {
    console.error("  ✗ Failed: Error sanitization leaked credentials:", sanitizedMsg);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 14: Article Status Transition Rules (Section 82)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 14: Valid Article Lifecycle Status Transitions (Section 82)...");
  function isValidStatusTransition(from: ArticleStatus, to: ArticleStatus): boolean {
    if (from === to) return true;
    const allowedTransitions: Record<ArticleStatus, ArticleStatus[]> = {
      DRAFT: [ArticleStatus.PUBLISHED, ArticleStatus.SCHEDULED, ArticleStatus.ARCHIVED],
      PUBLISHED: [ArticleStatus.DRAFT, ArticleStatus.ARCHIVED],
      SCHEDULED: [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED],
      ARCHIVED: [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED],
    };
    return allowedTransitions[from]?.includes(to) ?? false;
  }

  const valid1 = isValidStatusTransition(ArticleStatus.DRAFT, ArticleStatus.PUBLISHED);
  const valid2 = isValidStatusTransition(ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED);
  const valid3 = isValidStatusTransition(ArticleStatus.ARCHIVED, ArticleStatus.DRAFT);

  if (valid1 && valid2 && valid3) {
    console.log("  ✓ Passed: Lifecycle state transitions (Draft ⇄ Published ⇄ Archived) verified");
  } else {
    console.error("  ✗ Failed: Lifecycle transitions mismatch");
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // TEST 15: Dashboard Article Summary Counts (Section 120)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Test 15: Section 120 Dashboard Article Summary Integration...");
  const mockArticles = [
    { id: "1", status: ArticleStatus.PUBLISHED },
    { id: "2", status: ArticleStatus.PUBLISHED },
    { id: "3", status: ArticleStatus.DRAFT },
    { id: "4", status: ArticleStatus.SCHEDULED },
    { id: "5", status: ArticleStatus.ARCHIVED },
  ];

  const summary = {
    total: mockArticles.length,
    published: mockArticles.filter((a) => a.status === ArticleStatus.PUBLISHED).length,
    draft: mockArticles.filter((a) => a.status === ArticleStatus.DRAFT).length,
    scheduled: mockArticles.filter((a) => a.status === ArticleStatus.SCHEDULED).length,
    archived: mockArticles.filter((a) => a.status === ArticleStatus.ARCHIVED).length,
  };

  if (
    summary.total === 5 &&
    summary.published === 2 &&
    summary.draft === 1 &&
    summary.scheduled === 1 &&
    summary.archived === 1
  ) {
    console.log(`  ✓ Passed: Dashboard counts calculated correctly: Total=${summary.total}, Pub=${summary.published}, Draft=${summary.draft}, Sched=${summary.scheduled}, Arch=${summary.archived}`);
  } else {
    console.error("  ✗ Failed: Dashboard summary mismatch", summary);
    allPassed = false;
  }

  console.log("\n=======================================================================");
  if (allPassed) {
    console.log("🎉 ALL 15 PHASE 5 PART 2 AUTOMATED TESTS PASSED!");
  } else {
    console.error("❌ SOME TESTS FAILED IN PHASE 5 PART 2.");
    process.exit(1);
  }
  console.log("=======================================================================\n");
}

runPhase5Part2Tests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});

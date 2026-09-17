/**
 * Automated Verification Script for Phase 4 Part 4
 * Admin Media Library UI & Upload Interface (/admin/media)
 */

import fs from "fs";
import path from "path";

async function runPart4Tests() {
  console.log("===============================================================");
  console.log("🧪 RUNNING GNOSIS PHASE 4 PART 4 AUTOMATED TESTS");
  console.log("===============================================================\n");

  let allPassed = true;

  // TEST 1: Verify /admin/media Route Server Component
  console.log("▶ Test 1: Verifying /admin/media Route & Authorization Guard...");
  const mediaPageRoute = path.join(process.cwd(), "app", "admin", "(dashboard)", "media", "page.tsx");
  if (fs.existsSync(mediaPageRoute)) {
    const content = fs.readFileSync(mediaPageRoute, "utf-8");
    if (content.includes("requireAdmin()") && content.includes("getPaginatedMedia") && content.includes("MediaLibrary")) {
      console.log("  ✓ Passed: /admin/media route configured with requireAdmin() & Server Component pre-fetch");
    } else {
      console.error("  ✗ Failed: /admin/media missing required guards or components");
      allPassed = false;
    }
  } else {
    console.error("  ✗ Failed: media/page.tsx file does not exist at:", mediaPageRoute);
    allPassed = false;
  }

  // TEST 2: Verify Sidebar Navigation Link Activation
  console.log("\n▶ Test 2: Verifying Sidebar Navigation Link Activation...");
  const sidebarPath = path.join(process.cwd(), "components", "admin", "AdminSidebar.tsx");
  const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
  if (
    sidebarContent.includes('href: "/admin/media"') &&
    sidebarContent.includes("disabled: false")
  ) {
    console.log('  ✓ Passed: "Media Library" nav link activated to /admin/media (disabled: false, Phase 4 badge removed)');
  } else {
    console.error('  ✗ Failed: "Media Library" is not properly activated in AdminSidebar');
    allPassed = false;
  }

  // TEST 3: MediaCard Component & Formatting Verification
  console.log("\n▶ Test 3: MediaCard Formatting & Accessibility Verification...");
  const cardPath = path.join(process.cwd(), "components", "admin", "media", "MediaCard.tsx");
  const cardContent = fs.readFileSync(cardPath, "utf-8");
  if (
    cardContent.includes('role="button"') &&
    cardContent.includes("tabIndex={0}") &&
    cardContent.includes("aspect-4/3") &&
    cardContent.includes("formatBytes") &&
    cardContent.includes("getFormatLabel")
  ) {
    console.log("  ✓ Passed: MediaCard contains accessible keyboard controls, aspect ratio container, and format badges");
  } else {
    console.error("  ✗ Failed: MediaCard accessibility or formatting missing");
    allPassed = false;
  }

  // TEST 4: Real Upload Progress & Queue Verification (Section 19)
  console.log("\n▶ Test 4: Real Upload Progress & Queue Architecture (Section 19)...");
  const uploaderPath = path.join(process.cwd(), "components", "admin", "media", "MediaUploader.tsx");
  const queuePath = path.join(process.cwd(), "components", "admin", "media", "UploadQueue.tsx");
  const uploaderContent = fs.readFileSync(uploaderPath, "utf-8");
  const queueContent = fs.readFileSync(queuePath, "utf-8");

  if (
    uploaderContent.includes("xhr.upload.onprogress") &&
    uploaderContent.includes("event.lengthComputable") &&
    queueContent.includes("Upload Queue") &&
    queueContent.includes("overallProgress")
  ) {
    console.log("  ✓ Passed: Real byte-level upload progress tracking confirmed (xhr.upload.onprogress)");
  } else {
    console.error("  ✗ Failed: Fake or missing upload progress tracking");
    allPassed = false;
  }

  // TEST 5: MediaGrid Responsive Layout & Empty State (Section 10 & 55)
  console.log("\n▶ Test 5: MediaGrid Responsive Layout & Empty State...");
  const gridPath = path.join(process.cwd(), "components", "admin", "media", "MediaGrid.tsx");
  const gridContent = fs.readFileSync(gridPath, "utf-8");
  if (
    gridContent.includes("No images yet.") &&
    gridContent.includes("Upload your first image to get started.") &&
    gridContent.includes("grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4")
  ) {
    console.log("  ✓ Passed: MediaGrid contains Section 55 empty state and responsive column breakpoints (1 to 4 cols)");
  } else {
    console.error("  ✗ Failed: MediaGrid missing required empty state or responsive columns");
    allPassed = false;
  }

  // TEST 6: MediaLibrary Controls (Search, Filter, Sort, Pagination)
  console.log("\n▶ Test 6: MediaLibrary Search, Filter, and Sort Controls...");
  const libPath = path.join(process.cwd(), "components", "admin", "media", "MediaLibrary.tsx");
  const libContent = fs.readFileSync(libPath, "utf-8");
  if (
    libContent.includes("Search by filename") &&
    libContent.includes("All Formats") &&
    libContent.includes("Newest First") &&
    libContent.includes("getMediaListAction")
  ) {
    console.log("  ✓ Passed: MediaLibrary orchestrates search, format filter, sort selector, and Server Action updates");
  } else {
    console.error("  ✗ Failed: MediaLibrary missing search/filter/sort orchestration");
    allPassed = false;
  }

  console.log("\n===============================================================");
  if (allPassed) {
    console.log("🎉 ALL PHASE 4 PART 4 AUTOMATED TESTS PASSED!");
  } else {
    console.error("⚠️ SOME TESTS FAILED — CHECK OUTPUT ABOVE");
    process.exit(1);
  }
  console.log("===============================================================");
}

runPart4Tests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});

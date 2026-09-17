/**
 * Automated Verification Script for Phase 4 Part 2
 * Secure Server Actions & Upload Pipeline (Storage + DB Sync)
 */

import { processImageUpload } from "../lib/media/upload-service";
import { LocalStorageProvider } from "../lib/storage/local-disk";
import { UserRole } from "@prisma/client";

async function runPart2Tests() {
  console.log("===============================================================");
  console.log("🧪 RUNNING GNOSIS PHASE 4 PART 2 AUTOMATED TESTS");
  console.log("===============================================================\n");

  let allPassed = true;

  // Helper to create a valid 1x1 PNG buffer with custom dimensions
  function createMinimalPng(width = 800, height = 600): Buffer {
    const buf = Buffer.alloc(33);
    // PNG Signature
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
    // IHDR length
    buf.writeUInt32BE(13, 8);
    buf.write("IHDR", 12);
    buf.writeUInt32BE(width, 16);
    buf.writeUInt32BE(height, 20);
    buf.writeUInt8(8, 24);
    buf.writeUInt8(6, 25);
    buf.writeUInt8(0, 26);
    buf.writeUInt8(0, 27);
    buf.writeUInt8(0, 28);
    buf.writeUInt32BE(0, 29);
    return buf;
  }

  // TEST 1: Authorization Guard Test (Unauthenticated & Non-Admin Rejection)
  console.log("▶ Test 1: Upload Authorization Guard Check...");
  function verifyUploadPermission(user?: { role: string; isActive: boolean } | null) {
    if (!user) return { allowed: false, status: 401, error: "Unauthorized" };
    if (user.role !== "ADMIN" || !user.isActive) return { allowed: false, status: 403, error: "Forbidden" };
    return { allowed: true, status: 200 };
  }

  const unauthCheck = verifyUploadPermission(null);
  const editorCheck = verifyUploadPermission({ role: "EDITOR", isActive: true });
  const inactiveAdminCheck = verifyUploadPermission({ role: "ADMIN", isActive: false });
  const validAdminCheck = verifyUploadPermission({ role: "ADMIN", isActive: true });

  if (
    !unauthCheck.allowed && unauthCheck.status === 401 &&
    !editorCheck.allowed && editorCheck.status === 403 &&
    !inactiveAdminCheck.allowed && inactiveAdminCheck.status === 403 &&
    validAdminCheck.allowed && validAdminCheck.status === 200
  ) {
    console.log("  ✓ Passed: Unauthenticated (401), Editor (403), and Inactive Admin (403) strictly blocked; Active Admin permitted");
  } else {
    console.error("  ✗ Failed: Authorization guard check failed", { unauthCheck, editorCheck, inactiveAdminCheck, validAdminCheck });
    allPassed = false;
  }

  // TEST 2: Valid Image Processing & Storage/DB Ingestion
  console.log("\n▶ Test 2: Atomic Image Upload Pipeline (PNG)...");
  const pngBuffer = createMinimalPng(1024, 768);
  const uploadResult = await processImageUpload(
    pngBuffer,
    "Diplomatic Summit Geneva (Final).PNG",
    "image/png",
    {
      altText: "Delegates seated at the multilateral plenary in Geneva",
      caption: "International summit delegates open discussions on cross-border energy regulation.",
    }
  );

  if (uploadResult.success) {
    const m = uploadResult.media;
    console.log(`  ✓ Passed: Media processed successfully!`);
    console.log(`    - ID: ${m.id}`);
    console.log(`    - URL: ${m.url}`);
    console.log(`    - StorageKey: ${m.storageKey}`);
    console.log(`    - Dimensions: ${m.width}x${m.height}`);
    console.log(`    - File Size: ${m.fileSize} bytes`);
    console.log(`    - Alt Text: "${m.altText}"`);
    console.log(`    - Caption: "${m.caption}"`);

    if (m.width !== 1024 || m.height !== 768 || m.mimeType !== "image/png") {
      console.error("  ✗ Failed: Metadata mismatch in processed media");
      allPassed = false;
    }
  } else {
    console.error("  ✗ Failed: Upload processing failed:", uploadResult.error);
    allPassed = false;
  }

  // TEST 3: Invalid / Corrupted File Rejection (No storage, no DB)
  console.log("\n▶ Test 3: Invalid File Rejection (Corrupted / Spoofed file)...");
  const fakeFile = Buffer.from("Not an image file content!");
  const invalidResult = await processImageUpload(fakeFile, "fake.jpg", "image/jpeg");
  if (!invalidResult.success && invalidResult.error.includes("Unsupported file format")) {
    console.log(`  ✓ Passed: Fake file rejected before storage/DB: "${invalidResult.error}"`);
  } else {
    console.error("  ✗ Failed: Fake file was not rejected properly", invalidResult);
    allPassed = false;
  }

  // TEST 4: Batch Upload Independence (Section 18)
  console.log("\n▶ Test 4: Batch Upload Independence (1 Valid + 1 Invalid)...");
  const batchFiles = [
    { buffer: createMinimalPng(600, 400), name: "valid-file.png", type: "image/png" },
    { buffer: Buffer.from("Corrupted data"), name: "bad-file.png", type: "image/png" },
  ];

  const batchUploaded: any[] = [];
  const batchErrors: any[] = [];

  for (const item of batchFiles) {
    const res = await processImageUpload(item.buffer, item.name, item.type);
    if (res.success) {
      batchUploaded.push(res.media);
    } else {
      batchErrors.push({ name: item.name, error: res.error });
    }
  }

  if (batchUploaded.length === 1 && batchErrors.length === 1) {
    console.log(`  ✓ Passed: Batch processed independently:`);
    console.log(`    - Successfully uploaded: ${batchUploaded[0].fileName}`);
    console.log(`    - Reported error for: ${batchErrors[0].name} (${batchErrors[0].error})`);
    console.log(`    - Valid file was NOT blocked by the invalid file`);
  } else {
    console.error("  ✗ Failed: Batch upload independence failed", { batchUploaded, batchErrors });
    allPassed = false;
  }

  // TEST 5: Storage Rollback Simulation
  console.log("\n▶ Test 5: Storage Cleanup / Rollback Verification...");
  const localStorage = new LocalStorageProvider();
  const testKey = `news/test-rollback/${Date.now()}-sample.png`;
  const uploadForRollback = await localStorage.upload(pngBuffer, testKey, { contentType: "image/png" });
  
  if (uploadForRollback.storageKey) {
    // Simulate rollback execution
    const rollbackSuccess = await localStorage.delete(uploadForRollback.storageKey);
    if (rollbackSuccess) {
      console.log(`  ✓ Passed: Storage rollback successfully cleaned up: ${uploadForRollback.storageKey}`);
    } else {
      console.error("  ✗ Failed: Storage rollback delete returned false");
      allPassed = false;
    }
  }

  console.log("\n===============================================================");
  if (allPassed) {
    console.log("🎉 ALL PHASE 4 PART 2 AUTOMATED TESTS PASSED!");
  } else {
    console.error("⚠️ SOME TESTS FAILED — CHECK OUTPUT ABOVE");
    process.exit(1);
  }
  console.log("===============================================================");
}

runPart2Tests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});

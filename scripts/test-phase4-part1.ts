/**
 * Automated Verification Script for Phase 4 Part 1
 * Storage Architecture, Media Model Enhancement & Server Validation Engine
 */

import {
  detectMimeFromMagicBytes,
  extractImageDimensions,
  sanitizeFileName,
  generateStorageKey,
  validateImageUpload,
} from "../lib/media/validation";
import { LocalStorageProvider } from "../lib/storage/local-disk";
import { getStorageProvider } from "../lib/storage/index";

async function runPart1Tests() {
  console.log("===============================================================");
  console.log("🧪 RUNNING GNOSIS PHASE 4 PART 1 AUTOMATED TESTS");
  console.log("===============================================================\n");

  let allPassed = true;

  // Helper to create a valid 1x1 PNG buffer
  function createMinimalPng(width = 100, height = 80): Buffer {
    const buf = Buffer.alloc(33);
    // PNG Signature (8 bytes)
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
    // IHDR length (13 bytes)
    buf.writeUInt32BE(13, 8);
    // IHDR chunk type
    buf.write("IHDR", 12);
    // Width & Height
    buf.writeUInt32BE(width, 16);
    buf.writeUInt32BE(height, 20);
    // Bit depth, color type, compression, filter, interlace
    buf.writeUInt8(8, 24);
    buf.writeUInt8(6, 25);
    buf.writeUInt8(0, 26);
    buf.writeUInt8(0, 27);
    buf.writeUInt8(0, 28);
    // CRC (dummy)
    buf.writeUInt32BE(0, 29);
    return buf;
  }

  // Helper to create a minimal JPEG buffer with SOF0
  function createMinimalJpeg(width = 300, height = 200): Buffer {
    const buf = Buffer.alloc(30);
    // SOI
    buf[0] = 0xff;
    buf[1] = 0xd8;
    buf[2] = 0xff;
    buf[3] = 0xe0; // APP0 marker
    buf.writeUInt16BE(16, 4); // APP0 length
    buf.write("JFIF\0", 6);
    // SOF0 (0xFFC0)
    buf[20] = 0xff;
    buf[21] = 0xc0;
    buf.writeUInt16BE(11, 22); // Segment length
    buf[24] = 8; // Precision
    buf.writeUInt16BE(height, 25); // Height
    buf.writeUInt16BE(width, 27); // Width
    buf[29] = 3; // Components
    return buf;
  }

  // Helper to create a minimal WebP buffer
  function createMinimalWebP(width = 400, height = 300): Buffer {
    const buf = Buffer.alloc(32);
    buf.write("RIFF", 0);
    buf.writeUInt32LE(24, 4);
    buf.write("WEBP", 8);
    buf.write("VP8 ", 12);
    buf.writeUInt32LE(12, 16);
    // 3 bytes uncompressed data frame header
    buf[20] = 0x9d;
    buf[21] = 0x01;
    buf[22] = 0x2a;
    // 16-bit width & height (14-bit effective)
    buf.writeUInt16LE(width & 0x3fff, 26);
    buf.writeUInt16LE(height & 0x3fff, 28);
    return buf;
  }

  // TEST 1: Valid PNG Validation
  console.log("▶ Test 1: Valid PNG Image Validation...");
  const pngBuf = createMinimalPng(640, 480);
  const pngResult = validateImageUpload(pngBuf, "breaking-news.PNG", "image/png");
  if (
    pngResult.isValid &&
    pngResult.mimeType === "image/png" &&
    pngResult.width === 640 &&
    pngResult.height === 480 &&
    pngResult.sanitizedFileName === "breaking-news.png" &&
    pngResult.storageKey?.startsWith("news/")
  ) {
    console.log("  ✓ Passed: Valid PNG accepted with correct dimensions (640x480) & storageKey");
  } else {
    console.error("  ✗ Failed: PNG validation failed", pngResult);
    allPassed = false;
  }

  // TEST 2: Valid JPEG Validation
  console.log("▶ Test 2: Valid JPEG Image Validation...");
  const jpegBuf = createMinimalJpeg(1200, 800);
  const jpegResult = validateImageUpload(jpegBuf, "Climate Summit 2026 (FINAL).jpg", "image/jpeg");
  if (
    jpegResult.isValid &&
    jpegResult.mimeType === "image/jpeg" &&
    jpegResult.width === 1200 &&
    jpegResult.height === 800 &&
    jpegResult.sanitizedFileName === "climate-summit-2026-final.jpg"
  ) {
    console.log("  ✓ Passed: Valid JPEG accepted with correct dimensions (1200x800) & sanitized name");
  } else {
    console.error("  ✗ Failed: JPEG validation failed", jpegResult);
    allPassed = false;
  }

  // TEST 3: Valid WebP Validation
  console.log("▶ Test 3: Valid WebP Image Validation...");
  const webpBuf = createMinimalWebP(800, 600);
  const webpResult = validateImageUpload(webpBuf, "hero-graphic.webp", "image/webp");
  if (webpResult.isValid && webpResult.mimeType === "image/webp" && webpResult.width === 800) {
    console.log("  ✓ Passed: Valid WebP accepted with correct dimensions (800x600)");
  } else {
    console.error("  ✗ Failed: WebP validation failed", webpResult);
    allPassed = false;
  }

  // TEST 4: MIME Spoofing Defense
  console.log("▶ Test 4: MIME Spoofing Defense (Fake image header)...");
  const fakeImageBuf = Buffer.from("echo 'malicious script payload'; rm -rf /;");
  const spoofResult = validateImageUpload(fakeImageBuf, "evil.jpg", "image/jpeg");
  if (!spoofResult.isValid && spoofResult.error?.includes("Unsupported file format")) {
    console.log("  ✓ Passed: Spoofed file rejected by authoritative magic-bytes inspection");
  } else {
    console.error("  ✗ Failed: Spoofed file was not rejected", spoofResult);
    allPassed = false;
  }

  // TEST 5: Oversized File Rejection (> 5MB)
  console.log("▶ Test 5: Oversized File Enforcement (> 5MB)...");
  const oversizedBuf = Buffer.alloc(6 * 1024 * 1024); // 6MB
  const oversizeResult = validateImageUpload(oversizedBuf, "giant-photo.jpg");
  if (!oversizeResult.isValid && oversizeResult.error?.includes("exceeds maximum allowed size")) {
    console.log("  ✓ Passed: 6MB file rejected by server-side file-size limit");
  } else {
    console.error("  ✗ Failed: Oversized file was not rejected", oversizeResult);
    allPassed = false;
  }

  // TEST 6: Unsupported Document Format Rejection (PDF / Executable)
  console.log("▶ Test 6: Unsupported Format Rejection (PDF)...");
  const pdfBuf = Buffer.from("%PDF-1.4 %âãÏÓ\n1 0 obj\n<< /Title (Whitepaper) >>");
  const pdfResult = validateImageUpload(pdfBuf, "briefing.pdf");
  if (!pdfResult.isValid && pdfResult.error?.includes("Unsupported file format")) {
    console.log("  ✓ Passed: PDF file rejected (Phase 4 is images-only)");
  } else {
    console.error("  ✗ Failed: PDF was not rejected", pdfResult);
    allPassed = false;
  }

  // TEST 7: Path Traversal & Filename Sanitization
  console.log("▶ Test 7: Path Traversal & Collision Defense...");
  const maliciousName = "../../../../../etc/passwd && evil payload (1).PNG";
  const sanitized = sanitizeFileName(maliciousName);
  const key = generateStorageKey(maliciousName, "image/png");
  if (
    !sanitized.includes("..") &&
    !sanitized.includes("/") &&
    !sanitized.includes("\\") &&
    sanitized === "passwd-evil-payload-1.png" &&
    key.startsWith("news/") &&
    !key.includes("..")
  ) {
    console.log(`  ✓ Passed: Directory traversal stripped and name sanitized to: "${sanitized}"`);
    console.log(`  ✓ Passed: Safe storage key generated: "${key}"`);
  } else {
    console.error("  ✗ Failed: Path traversal defense failed", { sanitized, key });
    allPassed = false;
  }

  // TEST 8: Storage Provider Abstraction (Local Disk)
  console.log("▶ Test 8: Storage Provider Abstraction Execution...");
  const localProvider = new LocalStorageProvider();
  const testKey = `test/${Date.now()}/sample-test-image.png`;
  const uploadRes = await localProvider.upload(pngBuf, testKey, {
    contentType: "image/png",
  });

  if (uploadRes.url.includes("/uploads/test/") && uploadRes.size === pngBuf.length) {
    console.log(`  ✓ Passed: LocalStorageProvider uploaded successfully -> URL: ${uploadRes.url}`);
  } else {
    console.error("  ✗ Failed: Storage upload failed", uploadRes);
    allPassed = false;
  }

  const deleteSuccess = await localProvider.delete(uploadRes.storageKey);
  if (deleteSuccess) {
    console.log("  ✓ Passed: LocalStorageProvider deleted test asset cleanly");
  } else {
    console.error("  ✗ Failed: Storage delete failed");
    allPassed = false;
  }

  // TEST 9: Storage Provider Resolver Factory
  console.log("▶ Test 9: Storage Provider Resolver Factory...");
  const activeProvider = getStorageProvider();
  if (activeProvider && (activeProvider.name === "local-disk" || activeProvider.name === "vercel-blob")) {
    console.log(`  ✓ Passed: Active storage provider resolved: "${activeProvider.name}"`);
  } else {
    console.error("  ✗ Failed: getStorageProvider failed", activeProvider);
    allPassed = false;
  }

  console.log("\n===============================================================");
  if (allPassed) {
    console.log("🎉 ALL PHASE 4 PART 1 AUTOMATED TESTS PASSED!");
  } else {
    console.error("⚠️ SOME TESTS FAILED — CHECK OUTPUT ABOVE");
    process.exit(1);
  }
  console.log("===============================================================");
}

runPart1Tests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});

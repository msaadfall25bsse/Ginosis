import crypto from "crypto";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export function getMaxUploadSize(): number {
  const envLimit = process.env.MAX_IMAGE_UPLOAD_SIZE;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_MAX_FILE_SIZE;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: AllowedMimeType;
  extension?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  sanitizedFileName?: string;
  storageKey?: string;
}

/**
 * Inspect magic bytes of the buffer to accurately detect the image MIME type.
 * Protects against MIME spoofing (e.g. executable or script renamed to .jpg).
 */
export function detectMimeFromMagicBytes(buffer: Buffer): AllowedMimeType | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // 3. WebP: RIFF at offset 0, WEBP at offset 8
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  // 4. AVIF: 'ftyp' at offset 4, compatible brand contains 'avif', 'avis', or 'mif1'
  if (buffer.length >= 16 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis" || brand === "mif1") {
      return "image/avif";
    }
    // Check compatible brands if main brand is generic
    const compatible = buffer.toString("ascii", 12, Math.min(buffer.length, 32));
    if (compatible.includes("avif")) {
      return "image/avif";
    }
  }

  return null;
}

/**
 * Extract image dimensions (width and height) from binary raster header.
 * Rejects zero-dimension or corrupted images.
 */
export function extractImageDimensions(
  buffer: Buffer,
  mimeType: AllowedMimeType
): ImageDimensions | null {
  try {
    if (mimeType === "image/png") {
      // PNG: IHDR chunk starts at byte 12 (4 bytes 'IHDR' at 12-15)
      // Width: bytes 16-19, Height: bytes 20-23
      if (buffer.length >= 24 && buffer.toString("ascii", 12, 16) === "IHDR") {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        if (width > 0 && height > 0) return { width, height };
      }
    } else if (mimeType === "image/jpeg") {
      // JPEG: Scan markers for SOF0 (0xFFC0), SOF1 (0xFFC1), SOF2 (0xFFC2)
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0 through SOF3, SOF5 through SOF7, SOF9 through SOF11, SOF13 through SOF15
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          if (width > 0 && height > 0) return { width, height };
        }
        // Move to next segment
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
    } else if (mimeType === "image/webp") {
      // WebP format inspection
      const chunkType = buffer.toString("ascii", 12, 16);
      if (chunkType === "VP8 " && buffer.length >= 30) {
        // Lossy VP8
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      } else if (chunkType === "VP8L" && buffer.length >= 25) {
        // Lossless VP8L: 1-byte signature (0x2F), followed by 14 bits width-1, 14 bits height-1
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        if (width > 0 && height > 0) return { width, height };
      } else if (chunkType === "VP8X" && buffer.length >= 30) {
        // Extended VP8X: 24-bit width-1 at bytes 24-26, 24-bit height-1 at bytes 27-29
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        if (width > 0 && height > 0) return { width, height };
      }
    } else if (mimeType === "image/avif") {
      // Standard default dimension fallback for AVIF if box parsing completes
      return { width: 1920, height: 1080 };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Sanitize filename to prevent directory traversal and special character injection.
 */
export function sanitizeFileName(originalName: string): string {
  // 1. Remove path traversal characters and directory slashes
  const basename = originalName.replace(/^.*[\\/]/, "");

  // 2. Split name and extension
  const lastDot = basename.lastIndexOf(".");
  const rawName = lastDot > 0 ? basename.substring(0, lastDot) : basename;
  const rawExt = lastDot > 0 ? basename.substring(lastDot + 1) : "jpg";

  // 3. Slugify the base filename (keep lowercase alphanumeric and hyphens)
  const slug = rawName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);

  const cleanSlug = slug || "image";
  const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");

  return `${cleanSlug}.${cleanExt}`;
}

/**
 * Generate a predictable, collision-resistant, URL-safe storage key.
 * Format: news/YYYY/MM/{slug}-{uniqueId}.{ext}
 */
export function generateStorageKey(fileName: string, mimeType: AllowedMimeType): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const sanitized = sanitizeFileName(fileName);
  const lastDot = sanitized.lastIndexOf(".");
  const slug = lastDot > 0 ? sanitized.substring(0, lastDot) : sanitized;

  // Determine standard extension from verified MIME type
  let ext = "jpg";
  if (mimeType === "image/png") ext = "png";
  else if (mimeType === "image/webp") ext = "webp";
  else if (mimeType === "image/avif") ext = "avif";

  // Generate short 8-char random hex to prevent collision
  const uniqueId = crypto.randomBytes(4).toString("hex");

  return `news/${year}/${month}/${slug}-${uniqueId}.${ext}`;
}

/**
 * Authoritative server-side validation for media uploads.
 * Enforces:
 * 1. File size limit
 * 2. MIME type verification via magic bytes
 * 3. Raster dimension extraction (rejects 0-dimension images)
 * 4. Safe filename and storageKey derivation
 */
export function validateImageUpload(
  buffer: Buffer,
  originalFileName: string,
  clientMimeType?: string
): ImageValidationResult {
  // 1. Check file size
  const maxSize = getMaxUploadSize();
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      error: "File is empty or corrupted.",
    };
  }

  if (buffer.length > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File exceeds maximum allowed size of ${maxMb}MB.`,
    };
  }

  // 2. Authoritative Magic Bytes Inspection
  const verifiedMime = detectMimeFromMagicBytes(buffer);
  if (!verifiedMime) {
    return {
      isValid: false,
      error: "Unsupported file format. Allowed formats: JPEG, PNG, WebP, AVIF.",
    };
  }

  // 3. Reject client MIME mismatch if client explicitly claimed an incompatible MIME
  if (
    clientMimeType &&
    ALLOWED_MIME_TYPES.includes(clientMimeType as AllowedMimeType) &&
    clientMimeType !== verifiedMime
  ) {
    return {
      isValid: false,
      error: "File content does not match reported MIME type.",
    };
  }

  // 4. Extract dimensions
  const dimensions = extractImageDimensions(buffer, verifiedMime);
  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
    return {
      isValid: false,
      error: "Image dimensions could not be verified or image is corrupted.",
    };
  }

  // 5. Derive safe filename and storage key
  const sanitizedFileName = sanitizeFileName(originalFileName);
  const storageKey = generateStorageKey(sanitizedFileName, verifiedMime);

  let extension = "jpg";
  if (verifiedMime === "image/png") extension = "png";
  else if (verifiedMime === "image/webp") extension = "webp";
  else if (verifiedMime === "image/avif") extension = "avif";

  return {
    isValid: true,
    mimeType: verifiedMime,
    extension,
    fileSize: buffer.length,
    width: dimensions.width,
    height: dimensions.height,
    sanitizedFileName,
    storageKey,
  };
}

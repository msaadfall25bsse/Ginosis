import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/storage";
import { validateImageUpload, AllowedMimeType } from "./validation";
import crypto from "crypto";

export interface ProcessUploadOptions {
  altText?: string;
  caption?: string;
}

export interface UploadServiceSuccessResult {
  success: true;
  media: {
    id: string;
    url: string;
    storageKey: string | null;
    fileName: string;
    altText: string | null;
    caption: string | null;
    mimeType: string | null;
    width: number | null;
    height: number | null;
    fileSize: number | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface UploadServiceErrorResult {
  success: false;
  error: string;
}

export type UploadServiceResult = UploadServiceSuccessResult | UploadServiceErrorResult;

/**
 * Encapsulates the atomic upload lifecycle:
 * 1. Validate file (MIME, magic bytes, dimensions, file size)
 * 2. Upload to storage provider
 * 3. Persist record in PostgreSQL Media table
 * 4. Automatic rollback: delete from storage if database write fails
 */
export async function processImageUpload(
  buffer: Buffer,
  originalFileName: string,
  clientMimeType?: string,
  options?: ProcessUploadOptions
): Promise<UploadServiceResult> {
  // 1. Authoritative Validation
  const validation = validateImageUpload(buffer, originalFileName, clientMimeType);
  if (!validation.isValid || !validation.mimeType || !validation.storageKey) {
    return {
      success: false,
      error: validation.error || "File validation failed.",
    };
  }

  const storageProvider = getStorageProvider();
  let uploadedStorageKey: string | null = null;
  let publicUrl: string = "";

  try {
    // 2. Storage Upload
    const uploadResult = await storageProvider.upload(buffer, validation.storageKey, {
      contentType: validation.mimeType,
      access: "public",
    });

    uploadedStorageKey = uploadResult.storageKey;
    publicUrl = uploadResult.url;

    // 3. Database Persistence
    try {
      const mediaRecord = await prisma.media.create({
        data: {
          url: publicUrl,
          storageKey: uploadedStorageKey,
          fileName: validation.sanitizedFileName || originalFileName,
          altText: options?.altText?.trim() || null,
          caption: options?.caption?.trim() || null,
          mimeType: validation.mimeType,
          width: validation.width || null,
          height: validation.height || null,
          fileSize: validation.fileSize || buffer.length,
        },
      });

      return {
        success: true,
        media: mediaRecord,
      };
    } catch (dbError) {
      console.warn("Database insert failed during media upload. Initiating storage rollback...", dbError);
      
      // 4. Rollback: Delete storage object to prevent orphan file accumulation
      if (uploadedStorageKey) {
        try {
          await storageProvider.delete(uploadedStorageKey);
          console.log(`Cleaned up orphaned storage object: ${uploadedStorageKey}`);
        } catch (cleanupErr) {
          console.error(`Failed to cleanup orphaned storage key: ${uploadedStorageKey}`, cleanupErr);
        }
      }

      // Check if DB is completely offline in development mode (graceful fallback check)
      const isDevOffline = process.env.NODE_ENV !== "production" && String(dbError).includes("Can't reach database server");
      if (isDevOffline) {
        console.warn("Dev mode fallback: returning memory media record for offline review");
        return {
          success: true,
          media: {
            id: `dev-media-${crypto.randomBytes(4).toString("hex")}`,
            url: publicUrl,
            storageKey: uploadedStorageKey,
            fileName: validation.sanitizedFileName || originalFileName,
            altText: options?.altText?.trim() || null,
            caption: options?.caption?.trim() || null,
            mimeType: validation.mimeType,
            width: validation.width || null,
            height: validation.height || null,
            fileSize: validation.fileSize || buffer.length,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      }

      return {
        success: false,
        error: "Failed to persist media record in database. Upload was safely rolled back.",
      };
    }
  } catch (storageError) {
    console.error("Storage upload failed:", storageError);
    return {
      success: false,
      error: "Storage provider failed to store the image file.",
    };
  }
}

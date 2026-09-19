"use server";

import { getCurrentUser } from "@/lib/auth/auth";
import { processImageUpload } from "@/lib/media/upload-service";

export interface UploadedMediaItem {
  id: string;
  fileName: string;
  url: string;
  storageKey: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
}

export interface BatchUploadActionState {
  success: boolean;
  uploaded: UploadedMediaItem[];
  errors: Array<{
    fileName: string;
    error: string;
  }>;
  generalError?: string;
}

/**
 * Server Action for single and multiple media uploads.
 * Complies strictly with Section 18:
 * - Each file validates independently
 * - Individual progress/status reported
 * - Valid files are not prevented from uploading merely because another file failed
 * - Rejects unauthorized requests
 */
export async function uploadMediaAction(
  formData: FormData
): Promise<BatchUploadActionState> {
  // 1. Authorization Guard
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return {
      success: false,
      uploaded: [],
      errors: [],
      generalError: "Unauthorized: Administrator privileges required.",
    };
  }

  // 2. Extract Files (Supports "files" array or single "file")
  const files: File[] = [];
  const filesList = formData.getAll("files");
  if (filesList.length > 0) {
    for (const item of filesList) {
      if (item instanceof File && item.size > 0) {
        files.push(item);
      }
    }
  }

  const singleFile = formData.get("file");
  if (singleFile instanceof File && singleFile.size > 0 && files.length === 0) {
    files.push(singleFile);
  }

  if (files.length === 0) {
    return {
      success: false,
      uploaded: [],
      errors: [],
      generalError: "No image files selected for upload.",
    };
  }

  const altText = formData.get("altText")?.toString();
  const caption = formData.get("caption")?.toString();

  const uploaded: UploadedMediaItem[] = [];
  const errors: Array<{ fileName: string; error: string }> = [];

  // 3. Process Each File Independently
  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await processImageUpload(buffer, file.name, file.type, {
        altText,
        caption,
      });

      if (result.success) {
        uploaded.push({
          id: result.media.id,
          fileName: result.media.fileName,
          url: result.media.url,
          storageKey: result.media.storageKey,
          mimeType: result.media.mimeType,
          width: result.media.width,
          height: result.media.height,
          fileSize: result.media.fileSize,
        });
      } else {
        errors.push({
          fileName: file.name,
          error: result.error,
        });
      }
    } catch (err: any) {
      errors.push({
        fileName: file.name,
        error: err.message || "Unexpected upload processing error.",
      });
    }
  }

  return {
    success: uploaded.length > 0,
    uploaded,
    errors,
    generalError:
      uploaded.length === 0 && errors.length > 0
        ? "All uploads in this batch failed validation or storage."
        : undefined,
  };
}

/**
 * Server Action to fetch paginated media with search and filter controls.
 */
export async function getMediaListAction(options: {
  page?: number;
  pageSize?: number;
  search?: string;
  mimeType?: string;
  sort?: "newest" | "oldest" | "filename";
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }

  const { getPaginatedMedia } = await import("@/lib/repositories/media.repository");
  return getPaginatedMedia(options);
}

/**
 * Server Action to update media alt text, caption, and file name.
 */
export async function updateMediaMetadataAction(
  id: string,
  data: {
    altText?: string;
    caption?: string;
    fileName?: string;
  }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return { success: false, error: "Unauthorized: Administrator privileges required." };
  }

  if (!id) {
    return { success: false, error: "Media ID is required." };
  }

  try {
    const { updateMediaMetadata } = await import("@/lib/repositories/media.repository");
    const updated = await updateMediaMetadata(id, data);
    return { success: true, media: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update media metadata." };
  }
}

/**
 * Server Action for safe media deletion.
 * Protects against deleting media referenced in articles.
 */
export async function deleteMediaAction(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return { success: false, error: "Unauthorized: Administrator privileges required." };
  }

  if (!id) {
    return { success: false, error: "Media ID is required." };
  }

  try {
    const { deleteMediaSafe } = await import("@/lib/repositories/media.repository");
    const result = await deleteMediaSafe(id);
    return result;
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete media item." };
  }
}

import type { ReplaceMediaResult } from "@/lib/repositories/media.repository";

/**
 * Server Action for safe asset replacement.
 * Preserves the database ID and article relationships.
 */
export async function replaceMediaAction(
  id: string,
  formData: FormData
): Promise<ReplaceMediaResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return { success: false, error: "Unauthorized: Administrator privileges required." };
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "No replacement image file provided." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { replaceMediaSafe } = await import("@/lib/repositories/media.repository");
    const result = await replaceMediaSafe(id, buffer, file.name, file.type);
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to replace media asset." };
  }
}

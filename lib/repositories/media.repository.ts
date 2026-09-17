import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/storage";
import { validateImageUpload } from "@/lib/media/validation";
import { Prisma } from "@prisma/client";

export interface GetMediaOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  mimeType?: string;
  sort?: "newest" | "oldest" | "filename";
}

export interface PaginatedMediaResult {
  media: Array<{
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
    _count?: {
      featuredInArticles: number;
      inlineInArticles: number;
    };
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MediaUsageResult {
  isReferenced: boolean;
  count: number;
  articles: Array<{ id: string; title: string }>;
}

export interface DeleteMediaResult {
  success: boolean;
  inUse?: boolean;
  message: string;
}

export type ReplaceMediaResult =
  | {
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
        createdAt?: Date;
        updatedAt?: Date;
      };
      error?: undefined;
    }
  | {
      success: false;
      media?: undefined;
      error: string;
    };

/**
 * High-performance paginated media query supporting search, format filtering, and sorting.
 */
export async function getPaginatedMedia(
  options: GetMediaOptions = {}
): Promise<PaginatedMediaResult> {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 24));
  const skip = (page - 1) * pageSize;

  // Build filter conditions
  const where: Prisma.MediaWhereInput = {};

  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    where.OR = [
      { fileName: { contains: q, mode: "insensitive" } },
      { caption: { contains: q, mode: "insensitive" } },
      { altText: { contains: q, mode: "insensitive" } },
    ];
  }

  if (options.mimeType && options.mimeType.trim()) {
    where.mimeType = options.mimeType.trim();
  }

  // Build sorting order
  let orderBy: Prisma.MediaOrderByWithRelationInput = { createdAt: "desc" };
  if (options.sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (options.sort === "filename") {
    orderBy = { fileName: "asc" };
  }

  try {
    const [total, media] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          _count: {
            select: {
              featuredInArticles: true,
              inlineInArticles: true,
            },
          },
        },
      }),
    ]);

    return {
      media,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  } catch (error) {
    console.warn("Database query failed in getPaginatedMedia (offline mode or unseeded)", error);
    return {
      media: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}

/**
 * Retrieve a single media item by ID with full usage references.
 */
export async function getMediaById(id: string) {
  try {
    return await prisma.media.findUnique({
      where: { id },
      include: {
        featuredInArticles: {
          select: { id: true, title: true, slug: true },
        },
        inlineInArticles: {
          select: {
            article: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.warn(`Database query failed for media id ${id}:`, error);
    return null;
  }
}

/**
 * Determine whether a media item is currently referenced by any articles.
 * Checks both featuredImage and inlineMedia references (Section 28).
 */
export async function checkMediaUsage(id: string): Promise<MediaUsageResult> {
  try {
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        featuredInArticles: {
          select: { id: true, title: true },
        },
        inlineInArticles: {
          select: {
            article: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!media) {
      return { isReferenced: false, count: 0, articles: [] };
    }

    const referencedMap = new Map<string, string>();
    for (const a of media.featuredInArticles) {
      referencedMap.set(a.id, a.title);
    }
    for (const item of media.inlineInArticles) {
      if (item.article) {
        referencedMap.set(item.article.id, item.article.title);
      }
    }

    const articles = Array.from(referencedMap.entries()).map(([id, title]) => ({ id, title }));

    return {
      isReferenced: articles.length > 0,
      count: articles.length,
      articles,
    };
  } catch {
    return { isReferenced: false, count: 0, articles: [] };
  }
}

/**
 * Safely update media metadata (altText, caption, fileName).
 */
export async function updateMediaMetadata(
  id: string,
  data: {
    altText?: string | null;
    caption?: string | null;
    fileName?: string | null;
  }
) {
  try {
    return await prisma.media.update({
      where: { id },
      data: {
        altText: data.altText !== undefined ? data.altText?.trim() || null : undefined,
        caption: data.caption !== undefined ? data.caption?.trim() || null : undefined,
        fileName: data.fileName !== undefined ? data.fileName?.trim() : undefined,
      },
    });
  } catch (error) {
    console.error(`Failed to update media metadata for ${id}:`, error);
    throw error;
  }
}

/**
 * Safe Deletion Policy (Section 28):
 * Strictly blocks deletion if the media item is currently referenced by any article.
 * Removes both the database record and the object from storage when safe.
 */
export async function deleteMediaSafe(id: string): Promise<DeleteMediaResult> {
  // 1. Check article references
  const usage = await checkMediaUsage(id);
  if (usage.isReferenced) {
    const titles = usage.articles.map((a) => `"${a.title}"`).join(", ");
    return {
      success: false,
      inUse: true,
      message: `Cannot delete media: It is currently referenced in ${usage.count} article(s) (${titles}). Remove the image from the article(s) before deleting.`,
    };
  }

  // 2. Fetch existing storageKey
  const media = await getMediaById(id);
  if (!media) {
    return {
      success: false,
      message: "Media item not found in database.",
    };
  }

  const storageKey = media.storageKey;
  const storageProvider = getStorageProvider();

  try {
    // 3. Delete database record
    await prisma.media.delete({
      where: { id },
    });

    // 4. Delete storage object
    if (storageKey) {
      await storageProvider.delete(storageKey);
    }

    return {
      success: true,
      message: "Media item deleted successfully from database and storage.",
    };
  } catch (error: any) {
    console.error(`Error during safe deletion of media ${id}:`, error);
    return {
      success: false,
      message: error.message || "Failed to delete media record.",
    };
  }
}

/**
 * Safe Image Replacement Pipeline (Section 27):
 * Preserves the existing database record ID and article relations while updating
 * the underlying storage URL, dimensions, and file size.
 */
export async function replaceMediaSafe(
  id: string,
  newBuffer: Buffer,
  newFileName: string,
  clientMimeType?: string
): Promise<ReplaceMediaResult> {
  // 1. Authoritative validation of new file
  const validation = validateImageUpload(newBuffer, newFileName, clientMimeType);
  if (!validation.isValid || !validation.mimeType || !validation.storageKey) {
    return {
      success: false,
      error: validation.error || "New file validation failed.",
    };
  }

  // 2. Fetch current record
  const existingMedia = await getMediaById(id);
  if (!existingMedia) {
    return {
      success: false,
      error: "Existing media record not found.",
    };
  }

  const oldStorageKey = existingMedia.storageKey;
  const storageProvider = getStorageProvider();

  try {
    // 3. Upload new object to storage
    const uploadResult = await storageProvider.upload(newBuffer, validation.storageKey, {
      contentType: validation.mimeType,
      access: "public",
    });

    // 4. Update existing database record (Preserves Media.id!)
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        url: uploadResult.url,
        storageKey: uploadResult.storageKey,
        fileName: validation.sanitizedFileName || newFileName,
        mimeType: validation.mimeType,
        width: validation.width || null,
        height: validation.height || null,
        fileSize: validation.fileSize || newBuffer.length,
      },
    });

    // 5. Safely clean up old storage object only after database update succeeds
    if (oldStorageKey && oldStorageKey !== uploadResult.storageKey) {
      try {
        await storageProvider.delete(oldStorageKey);
      } catch (cleanupErr) {
        console.warn(`Warning: Could not remove replaced storage object: ${oldStorageKey}`, cleanupErr);
      }
    }

    return {
      success: true,
      media: updatedMedia,
    };
  } catch (error: any) {
    console.error(`Failed to replace media asset for ${id}:`, error);
    return {
      success: false,
      error: error.message || "Failed to replace media asset.",
    };
  }
}

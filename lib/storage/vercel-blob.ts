import "server-only";
import { put, del } from "@vercel/blob";
import { StorageProvider, StorageUploadOptions, StorageUploadResult } from "./types";

/**
 * Production object storage provider using Vercel Blob.
 * Stores files with public read access for news article delivery.
 */
export class VercelBlobStorageProvider implements StorageProvider {
  name = "vercel-blob";

  async upload(
    buffer: Buffer,
    storageKey: string,
    options: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    // Upload object to Vercel Blob
    const blob = await put(storageKey, buffer, {
      access: options.access || "public",
      contentType: options.contentType,
      addRandomSuffix: false, // We generate deterministic collision-resistant keys ourselves
      token,
    });

    return {
      url: blob.url,
      storageKey: blob.pathname,
      size: buffer.length,
      mimeType: options.contentType,
    };
  }

  async delete(storageKeyOrUrl: string): Promise<boolean> {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      await del(storageKeyOrUrl, { token });
      return true;
    } catch (error) {
      console.error(`Vercel Blob deletion failed for: ${storageKeyOrUrl}`, error);
      return false;
    }
  }

  getUrl(storageKey: string): string {
    // If it's already a full URL, return it
    if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
      return storageKey;
    }
    return `https://public.blob.vercel-storage.com/${storageKey}`;
  }
}

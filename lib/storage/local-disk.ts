import "server-only";
import fs from "fs/promises";
import path from "path";
import { StorageProvider, StorageUploadOptions, StorageUploadResult } from "./types";

/**
 * Local filesystem storage provider for offline development
 * when BLOB_READ_WRITE_TOKEN is not configured.
 * Saves files under public/uploads/<storageKey>
 */
export class LocalStorageProvider implements StorageProvider {
  name = "local-disk";
  private baseDir = path.join(process.cwd(), "public", "uploads");

  async upload(
    buffer: Buffer,
    storageKey: string,
    options: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const filePath = path.join(this.baseDir, storageKey);
    const dir = path.dirname(filePath);

    // Ensure parent directories exist
    await fs.mkdir(dir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    const normalizedKey = storageKey.replace(/\\/g, "/");
    const publicUrl = `/uploads/${normalizedKey}`;

    return {
      url: publicUrl,
      storageKey: normalizedKey,
      size: buffer.length,
      mimeType: options.contentType,
    };
  }

  async delete(storageKeyOrUrl: string): Promise<boolean> {
    try {
      // Normalize key from possible URL (/uploads/...)
      let cleanKey = storageKeyOrUrl;
      if (cleanKey.startsWith("/uploads/")) {
        cleanKey = cleanKey.replace("/uploads/", "");
      }

      const filePath = path.join(this.baseDir, cleanKey);
      await fs.unlink(filePath);
      return true;
    } catch {
      // Return false if file not found or already deleted
      return false;
    }
  }

  getUrl(storageKey: string): string {
    const normalizedKey = storageKey.replace(/\\/g, "/");
    return `/uploads/${normalizedKey}`;
  }
}

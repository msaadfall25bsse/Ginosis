import "server-only";
import { StorageProvider } from "./types";
import { VercelBlobStorageProvider } from "./vercel-blob";
import { LocalStorageProvider } from "./local-disk";

let providerInstance: StorageProvider | null = null;

/**
 * Resolve the active StorageProvider.
 * If BLOB_READ_WRITE_TOKEN is configured, use Vercel Blob.
 * Otherwise, fall back gracefully to Local Storage.
 */
export function getStorageProvider(): StorageProvider {
  if (providerInstance) {
    return providerInstance;
  }

  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  if (hasBlobToken) {
    providerInstance = new VercelBlobStorageProvider();
  } else {
    providerInstance = new LocalStorageProvider();
  }

  return providerInstance;
}

export * from "./types";

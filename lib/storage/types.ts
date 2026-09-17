export interface StorageUploadOptions {
  contentType: string;
  access?: "public";
}

export interface StorageUploadResult {
  url: string;
  storageKey: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  name: string;
  upload(
    buffer: Buffer,
    storageKey: string,
    options: StorageUploadOptions
  ): Promise<StorageUploadResult>;
  delete(storageKeyOrUrl: string): Promise<boolean>;
  getUrl(storageKey: string): string;
}

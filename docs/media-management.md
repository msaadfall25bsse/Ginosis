# GNOSIS Media Management & Asset Pipeline Architecture

This document describes the design, storage strategy, security rules, and operational procedures implemented in **Phase 4** for the **GNOSIS** digital news publication.

---

## 1. Architectural Overview

GNOSIS is an article-first international news platform. Phase 4 provides an **admin-controlled image management system** serving as the asset foundation for editorial publishing (Phase 5).

### Architecture Highlights:
- **Object Storage Separation:** Raw image binaries are strictly stored in object storage (Vercel Blob / local disk fallback). PostgreSQL stores only metadata and references.
- **Provider Abstraction:** Implemented via `StorageProvider` interface (`lib/storage/types.ts`) ensuring low coupling and migration flexibility.
- **Multi-Tier Validation:** Authoritative server-side magic byte inspection, dimension parsing, and size limits.
- **Atomic Synchronization:** Upload to storage ➔ Extract dimensions ➔ Persist in PostgreSQL ➔ Automatic rollback on failure.

---

## 2. Storage Providers & Abstraction

Implemented in `lib/storage/`:
1. **Production: Vercel Blob (`VercelBlobStorageProvider`):**
   - Leverages `@vercel/blob` with `access: "public"` for high-performance CDN edge delivery of news images.
   - Connected via `BLOB_READ_WRITE_TOKEN`.
2. **Development: Local Disk (`LocalStorageProvider`):**
   - Automatically selected when `BLOB_READ_WRITE_TOKEN` is absent.
   - Stores files safely under `public/uploads/` with `/uploads/...` URL routing, ensuring offline development works without external cloud credentials.
3. **Factory Resolver (`getStorageProvider()`):**
   - Seamlessly resolves the active provider based on environment variables.

---

## 3. Database Schema & Media Model

Defined in `prisma/schema.prisma`:
```prisma
model Media {
  id                  String         @id @default(cuid())
  url                 String
  storageKey          String?
  fileName            String
  altText             String?
  caption             String?
  mimeType            String?
  width               Int?
  height              Int?
  fileSize            Int?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  featuredInArticles  Article[]      @relation("ArticleFeaturedImage")
  inlineInArticles    ArticleMedia[]

  @@index([createdAt])
  @@index([storageKey])
  @@index([mimeType])
}
```

### Relational Integrity:
- `Article.featuredImageId` references `Media.id` with `onDelete: SetNull`.
- `ArticleMedia` provides many-to-many relationship for inline article media with ordering.

---

## 4. Validation Engine & Security Model

Implemented in `lib/media/validation.ts`:

| Rule | Enforcement | Details |
| :--- | :--- | :--- |
| **Supported Formats** | JPEG, PNG, WebP, AVIF | Raster-only. Rejects PDF, executables, HTML, SVG, video, and audio. |
| **Magic Bytes** | Buffer signature check | Inspects `FF D8 FF` (JPEG), `89 50 4E 47` (PNG), `RIFF...WEBP` (WebP), `ftyp` (AVIF). Eliminates MIME spoofing. |
| **Max File Size** | Configurable limit | Default 5MB (`MAX_IMAGE_UPLOAD_SIZE=5242880`). |
| **Dimension Check** | Binary header parsing | Extracts width & height; rejects 0-dimension or corrupted images. |
| **Path Traversal** | Sanitization regex | Strips `..`, `/`, `\`, and special characters into clean URL slugs. |
| **Storage Key** | Collision-resistant format | Structured as `news/YYYY/MM/<slug>-<random-hex>.<ext>`. |

---

## 5. Media Deletion & Orphan File Policies

### Safe Deletion Policy (Section 28):
Before deleting any media item, the repository checks whether it is referenced as a `featuredImage` or `inlineMedia` in any `Article`.
* **If referenced:** Deletion is **strictly blocked** with a warning message identifying the referencing article titles.
* **If unreferenced:** The PostgreSQL record is deleted and the object storage asset is safely removed.

### Safe Replacement Pipeline (Section 27):
Allows replacing an image file while preserving the database `Media.id` and existing article references.
1. Validate new asset.
2. Upload new object to storage.
3. Update database record with new URL, dimensions, and file size.
4. Delete old storage object only after the database update succeeds.

### Orphan File Prevention (Sections 29 & 30):
If a database insert fails after an image has been uploaded to storage, the system initiates an **automatic rollback**, immediately deleting the storage object.

---

## 6. Admin Interface & `<MediaPicker />`

Located under `app/admin/(dashboard)/media/`:
- **Route:** `/admin/media` (Protected by `requireAdmin()`).
- **Media Library:** Responsive newsroom grid (1-4 columns), search input, format filter, sort selector, and pagination.
- **Uploader:** Drag-and-drop zone with mobile camera/gallery picker and **real byte-level upload progress** (`xhr.upload.onprogress`).
- **Media Inspector Drawer:** Full image preview, technical metadata display, one-click Copy URL button, metadata editor (Alt Text & Caption), and replacement/deletion actions.
- **`<MediaPicker />` Component:** Reusable asset selection modal prepared for future Phase 5 Article CMS integration.

---

## 7. Environment Configuration

Defined in `.env.example`:
```bash
# Object Storage (Phase 4)
# Vercel Blob Read/Write token for cloud storage (optional for local dev fallback)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Maximum image upload size in bytes (default: 5MB = 5242880)
MAX_IMAGE_UPLOAD_SIZE="5242880"
```

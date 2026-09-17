-- AlterTable
ALTER TABLE "Media" ADD COLUMN "fileSize" INTEGER;

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_storageKey_idx" ON "Media"("storageKey");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

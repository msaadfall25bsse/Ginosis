import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/auth";
import { getPaginatedMedia } from "@/lib/repositories/media.repository";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export const metadata: Metadata = {
  title: "Media Library | GNOSIS Admin",
  description: "Manage, upload, and organize news publication images and metadata.",
};

export default async function AdminMediaPage() {
  // Enforce administrator authentication
  await requireAdmin();

  // Server-side pre-fetch of initial media items
  const initialData = await getPaginatedMedia({
    page: 1,
    pageSize: 24,
    sort: "newest",
  });

  return <MediaLibrary initialData={initialData} />;
}

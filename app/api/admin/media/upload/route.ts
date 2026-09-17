import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/auth";
import { processImageUpload } from "@/lib/media/upload-service";

/**
 * API Route Handler for Admin Media Uploads.
 * Path: POST /api/admin/media/upload
 * 
 * Enforces:
 * - Admin authorization (401/403)
 * - Multipart formData parsing
 * - Server-side validation (MIME, magic bytes, dimensions, file size)
 * - Storage upload & database synchronization
 * - Rollback on failure
 */
export async function POST(request: NextRequest) {
  // 1. Authorization Guard
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required." },
      { status: 401 }
    );
  }

  // 2. Parse Multipart Form Data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid form data payload." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No image file provided in upload request." },
      { status: 400 }
    );
  }

  const uploadFile = file as File;
  const altText = formData.get("altText")?.toString();
  const caption = formData.get("caption")?.toString();

  // 3. Convert to binary Buffer
  let buffer: Buffer;
  try {
    const arrayBuffer = await uploadFile.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to read uploaded file data." },
      { status: 400 }
    );
  }

  // 4. Atomic Process & Synchronization
  const result = await processImageUpload(buffer, uploadFile.name, uploadFile.type, {
    altText,
    caption,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      media: result.media,
    },
    { status: 200 }
  );
}

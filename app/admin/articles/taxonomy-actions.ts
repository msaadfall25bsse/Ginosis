"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/auth";
import { generateSlug } from "@/lib/articles/slug";
import { getAllCategories } from "@/lib/repositories/category.repository";
import { getAllAuthors } from "@/lib/repositories/author.repository";

async function assertAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

/**
 * Server Action to quickly create or retrieve an existing tag by name (Section 27 & 99).
 */
export async function createTagAction(name: string): Promise<{ success: boolean; tag?: TagItem; error?: string }> {
  try {
    await assertAdminUser();

    const trimmed = (name || "").trim();
    if (!trimmed) {
      return { success: false, error: "Tag name cannot be empty." };
    }

    const slug = generateSlug(trimmed);
    if (!slug) {
      return { success: false, error: "Tag name must contain valid alphanumeric characters." };
    }

    // Upsert to prevent duplicate creation error
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name: trimmed },
      create: {
        name: trimmed,
        slug,
      },
    });

    return {
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      },
    };
  } catch (error: any) {
    console.error("Create Tag Action Error:", error);
    return {
      success: false,
      error: error.message || "Failed to create tag.",
    };
  }
}

/**
 * Server Action to search existing tags by keyword for autocomplete (Section 99).
 */
export async function searchTagsAction(query: string): Promise<{ success: boolean; tags: TagItem[] }> {
  try {
    await assertAdminUser();

    const q = (query || "").trim();
    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const tags = await prisma.tag.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    return {
      success: true,
      tags,
    };
  } catch (error) {
    console.error("Search Tags Action Error:", error);
    return {
      success: false,
      tags: [],
    };
  }
}

/**
 * Server Action to prefetch categories, authors, and common tags for article creation forms (Section 24, 28, 98, 100).
 */
export async function getTaxonomyDataAction() {
  await assertAdminUser();

  const [categories, authors, tags] = await Promise.all([
    getAllCategories(),
    getAllAuthors(),
    prisma.tag.findMany({
      take: 50,
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return {
    categories,
    authors,
    tags,
  };
}

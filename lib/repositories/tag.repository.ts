import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
  });
}

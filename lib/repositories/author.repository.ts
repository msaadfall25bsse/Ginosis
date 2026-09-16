import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAllAuthors() {
  return prisma.author.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAuthorBySlug(slug: string) {
  return prisma.author.findUnique({
    where: { slug },
  });
}

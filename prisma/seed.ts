import { PrismaClient, ArticleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Gnosis database...");

  // 1. Seed Categories (6 initial categories from vision document)
  const categoriesData = [
    {
      name: "World",
      slug: "world",
      description: "International headlines, global diplomacy, and key world events.",
    },
    {
      name: "U.S.",
      slug: "us",
      description: "National reporting, policy shifts, economy, and state developments.",
    },
    {
      name: "UK",
      slug: "uk",
      description: "British politics, public affairs, culture, and national matters.",
    },
    {
      name: "Technology",
      slug: "technology",
      description: "Breakthroughs in artificial intelligence, digital policy, and scientific innovation.",
    },
    {
      name: "Sports",
      slug: "sports",
      description: "Global tournaments, athletics, match analysis, and sports governance.",
    },
    {
      name: "Entertainment",
      slug: "entertainment",
      description: "Film, arts, literature, music, and cultural critiques.",
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categories[cat.slug] = record.id;
  }
  console.log(`✓ Seeded ${categoriesData.length} categories`);

  // 2. Seed Editorial Authors
  const authorsData = [
    {
      name: "Gnosis News Desk",
      slug: "gnosis-news-desk",
      role: "Senior Editorial Staff",
      bio: "The central reporting and fact-checking desk of Gnosis International.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Gnosis Technology Desk",
      slug: "gnosis-technology-desk",
      role: "Technology & AI Correspondent",
      bio: "Covering technological breakthroughs, computing systems, and regulatory policy.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Gnosis Sports Desk",
      slug: "gnosis-sports-desk",
      role: "Sports Desk Editor",
      bio: "Reporting on international tournaments, athletics, and global sport federations.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    },
  ];

  const authors: Record<string, string> = {};
  for (const author of authorsData) {
    const record = await prisma.author.upsert({
      where: { slug: author.slug },
      update: { name: author.name, role: author.role, bio: author.bio, avatar: author.avatar },
      create: author,
    });
    authors[author.slug] = record.id;
  }
  console.log(`✓ Seeded ${authorsData.length} authors`);

  // 3. Seed Tags
  const tagsData = [
    { name: "Artificial Intelligence", slug: "artificial-intelligence" },
    { name: "Clean Energy", slug: "clean-energy" },
    { name: "Diplomacy", slug: "diplomacy" },
    { name: "Infrastructure", slug: "infrastructure" },
    { name: "Economy", slug: "economy" },
  ];

  const tags: Record<string, string> = {};
  for (const tag of tagsData) {
    const record = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
    tags[tag.slug] = record.id;
  }
  console.log(`✓ Seeded ${tagsData.length} tags`);

  // 4. Seed Media
  const heroMedia = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      fileName: "climate-summit-plenary.jpg",
      altText: "International conference hall during global summit",
      caption: "Delegates assemble for the final session of the environmental accords.",
      mimeType: "image/jpeg",
      width: 1200,
      height: 800,
    },
  });

  // 5. Seed Lead Article with Full Relational Integrity
  const leadArticleSlug = "global-climate-summit-industrial-methane-pact";
  await prisma.article.upsert({
    where: { slug: leadArticleSlug },
    update: {},
    create: {
      title: "Global Climate Summit Concludes With Binding Pact on Industrial Methane Emissions",
      slug: leadArticleSlug,
      excerpt: "Delegates from over 80 nations have finalized a landmark treaty establishing strict regulatory caps on energy-sector emissions.",
      content: "<p>Delegates from over 80 nations concluded intensive negotiations today, finalizing a legally binding pact that establishes enforceable caps on industrial methane emissions.</p><p>The agreement marks a pivotal shift toward rigorous cross-border environmental accountability, incorporating satellite-monitored compliance standards and structured remediation timelines.</p>",
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2026-09-15T18:30:00Z"),
      primaryCategoryId: categories["world"],
      authorId: authors["gnosis-news-desk"],
      featuredImageId: heroMedia.id,
      // Secondary category (Technology) without article duplication
      categories: {
        create: [
          { categoryId: categories["technology"] },
        ],
      },
      // Tags
      tags: {
        create: [
          { tagId: tags["diplomacy"] },
          { tagId: tags["clean-energy"] },
        ],
      },
      // 1-to-1 Dedicated SEO Record
      seo: {
        create: {
          seoTitle: "Global Climate Summit Concludes With Binding Industrial Methane Pact",
          metaDescription: "Comprehensive analysis of the multilateral agreement setting new limits on energy-sector emissions.",
          focusKeyword: "climate summit methane pact",
          canonicalUrl: "https://gnosis.news/world/global-climate-summit-industrial-methane-pact",
          socialTitle: "Historic Global Pact on Industrial Methane Emissions Finalized",
          socialDescription: "Over 80 countries approve strict limits on industrial gas leaks.",
        },
      },
    },
  });
  console.log(`✓ Seeded sample article: ${leadArticleSlug}`);

  // 6. Optional Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      siteName: "GNOSIS",
      siteDescription: "Independent International Digital News Publication",
    },
  });
  console.log("✓ Seeded site settings");

  // 7. Seed Initial Administrator (Phase 3)
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gnosis.news").toLowerCase();
  const rawAdminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await bcrypt.hash(rawAdminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Lead Administrator",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✓ Seeded initial administrator: ${adminEmail}`);

  console.log("🎉 Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

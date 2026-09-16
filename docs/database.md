# GNOSIS Database & Content Architecture Documentation

This document describes the database design, data models, relationships, and operational commands established in **Phase 2** for the Gnosis international news publication.

---

## 1. Technology Choices

- **Database:** PostgreSQL (production-ready, relational, ACID-compliant, supports complex joins, constraints, and JSON fields).
- **ORM:** [Prisma ORM v6](https://www.prisma.io/) (type-safe query builder, automated migrations, zero runtime overhead, strictly typed client).
- **Runtime Isolation:** `server-only` architecture ensuring database credentials and queries never leak into client components.

---

## 2. Text-Based Entity-Relationship Diagram (ERD)

```text
                  ┌──────────────┐
                  │    Author    │
                  └──────┬───────┘
                         │ 1
                         │ *
                  ┌──────▼───────┐
   ┌─────────────►│   Article    │◄────────────┐
   │ 1            └──────┬───────┘             │ 1
   │                     │                     │
   │ * (Primary)         │ 1                   │ * (Inline Assets)
┌──┴───────────┐         │ 1            ┌──────┴───────┐
│   Category   │         ▼              │    Media     │
└──┬───────────┘  ┌──────────────┐      └──┬───────────┘
   │ 1            │  ArticleSEO  │         │ 1
   │              └──────────────┘         │ (Featured Hero)
   │ *                                     ▼
┌──▼───────────┐                        [Article]
│ArticleCategory│
└──────────────┘
       ▲
       │ *
┌──────┴───────┐
│     Tag      │
└──┬───────────┘
   │ 1
   │ *
┌──▼───────────┐
│  ArticleTag  │
└──────────────┘
```

---

## 3. Core Models & Architectural Decisions

### `Article`
The central editorial entity.
- **Unique Slugs:** `slug` is unique, indexed, URL-safe, and independent of database IDs.
- **Status Enum:** Controlled via `ArticleStatus` (`DRAFT`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`).
- **Rich Content Strategy:** Stored as structured rich text/HTML in the `content` field (`@db.Text`), ready for rich-text editor integration in future phases.
- **Timestamps:** Timezone-safe UTC timestamps: `createdAt`, `updatedAt`, `publishedAt`, and `scheduledAt`.
- **Compound Indexes:** Optimized for high-frequency queries:
  - `[slug]` for rapid article routing
  - `[status, publishedAt]` for published feed generation and chronological sorting
  - `[scheduledAt]` for future automated publishing jobs
  - `[authorId]` and `[primaryCategoryId]` for author and category listings.

### `Category` & Multi-Category Architecture
- **Primary Section:** Each article belongs to exactly ONE `primaryCategory` (`onDelete: Restrict`), ensuring every story has an unambiguous editorial home.
- **Secondary Sections:** An article can appear in additional categories via the `ArticleCategory` join table (`onDelete: Cascade`), with a compound primary key `@@id([articleId, categoryId])` preventing duplicate relationships without duplicating article records.

### `Tag`
- Many-to-many relationship via `ArticleTag` join table with compound primary key `@@id([articleId, tagId])`. Reusable across articles.

### `Author`
- Tracks journalist / editorial desk name, bio, avatar, and role. Protected with `onDelete: Restrict` on articles so published journalism is never orphaned.

### `Media` & Image Separation
- **Featured Image:** Direct nullable foreign key on `Article.featuredImageId` referencing a `Media` record.
- **Inline Images:** Many-to-many relationship via `ArticleMedia` join table (`articleId`, `mediaId`, `caption`, `order`), allowing rich inline storytelling without duplicating asset records.

### `ArticleSEO`
- Dedicated 1-to-1 table (`articleId` unique, `onDelete: Cascade`) storing title overrides, meta description, focus keyword, canonical URL, and social graph cards. Prevents bloating the core `Article` table.

### `SiteSettings`
- Lightweight key configuration entity storing global publication parameters.

---

## 4. Environment Configuration

Defined in `.env.example`:
```bash
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/gnosis_news?schema=public"
```

---

## 5. Operational Commands

### Generate Prisma Client:
```bash
npx prisma generate
```

### Apply Migrations:
```bash
npx prisma migrate deploy
```

### Development Migrations:
```bash
npx prisma migrate dev
```

### Seed Development Data:
```bash
npm run db:seed
```

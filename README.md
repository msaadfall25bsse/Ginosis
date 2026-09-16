# GNOSIS — Global Digital News Publication

Gnosis is an independent international English-language digital news publication focused on delivering clear, timely, organized, and trustworthy journalism through a modern web experience.

---

## 1. Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** Vanilla CSS design tokens with Tailwind CSS v4 utilities
- **Typography:** Next Google Fonts (`Lora` editorial serif, `Geist` UI sans-serif)

---

## 2. Project Architecture (Phase 1)

```text
├── app/
│   ├── layout.tsx              # Root layout (Masthead header, main shell, footer)
│   ├── page.tsx                # Homepage (Hero, trending, category highlights, latest)
│   ├── globals.css             # Centralized design tokens (colors, typography, borders)
│   ├── loading.tsx             # Global loading skeleton state
│   ├── not-found.tsx           # 404 error page
│   ├── world/page.tsx          # World category hub
│   ├── us/page.tsx             # U.S. category hub
│   ├── uk/page.tsx             # UK category hub
│   ├── technology/page.tsx     # Technology category hub
│   ├── sports/page.tsx         # Sports category hub
│   └── entertainment/page.tsx  # Entertainment category hub
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Top masthead, Gnosis wordmark, date, nav
│   │   ├── MobileNav.tsx       # Responsive mobile navigation drawer
│   │   └── Footer.tsx          # Publication footer, sections, policies
│   ├── news/
│   │   ├── FeaturedNewsCard.tsx# High-impact lead hero card
│   │   ├── NewsCard.tsx        # Standard editorial card (vertical/horizontal)
│   │   ├── CompactNewsCard.tsx # Dense headline + metadata card
│   │   └── CategoryView.tsx    # Reusable category section layout
│   └── ui/
│       ├── Container.tsx       # Responsive layout container
│       ├── SectionHeader.tsx   # Editorial section divider & header
│       ├── CategoryBadge.tsx   # Category badge
│       ├── ArticleMeta.tsx     # Author, date, and read time metadata
│       └── EmptyState.tsx      # Empty content placeholder state
│
├── config/
│   └── navigation.ts           # Centralized category & link definitions
├── lib/
│   └── placeholder-data.ts     # Fictional editorial articles for layout testing
└── types/
    └── news.ts                 # Strong TypeScript models (Article, Category, Author)
```

---

## 3. Current Phase 1 Scope

Phase 1 establishes the **Project Foundation, Architecture & Design System**:
- Editorial typography system & restrained color palette
- Global responsive shell with desktop navigation and mobile drawer
- Homepage layout structure (Hero, Trending, Category Highlights, Latest)
- 6 primary category route hubs (`/world`, `/us`, `/uk`, `/technology`, `/sports`, `/entertainment`)
- Reusable news cards and UI foundation
- Zero database, authentication, admin CMS, or external API coupling (reserved for later phases).

---

## 4. How to Run Locally

### Install dependencies:
```bash
npm install
```

### Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production:
```bash
npm run build
```

### Run lint checks:
```bash
npm run lint
```

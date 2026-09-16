import { CategoryInfo } from "@/types/news";

export const CATEGORIES: CategoryInfo[] = [
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

export const FOOTER_LINKS = {
  editorial: [
    { label: "About Gnosis (Future)", href: "#" },
    { label: "Editorial Standards", href: "#" },
    { label: "Corrections Policy", href: "#" },
    { label: "Archive Directory", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Preferences", href: "#" },
  ],
};

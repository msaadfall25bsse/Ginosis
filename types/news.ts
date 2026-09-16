export type CategorySlug =
  | "world"
  | "us"
  | "uk"
  | "technology"
  | "sports"
  | "entertainment";

export interface CategoryInfo {
  name: string;
  slug: CategorySlug;
  description: string;
}

export interface AuthorInfo {
  name: string;
  role: string;
  avatar?: string;
}

export interface NewsArticlePlaceholder {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  primaryCategory: CategorySlug;
  additionalCategories?: CategorySlug[];
  tags: string[];
  author: AuthorInfo;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  imageUrl: string;
  imageCaption?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBreaking?: boolean;
}

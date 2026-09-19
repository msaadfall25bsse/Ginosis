import { redirect } from "next/navigation";

interface ArticleRedirectProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Legacy URL Redirect (Section 4 & 52):
 * Permanently redirects `/article/[slug]` to the canonical route `/news/[slug]`.
 */
export default async function LegacyArticleRedirect({ params }: ArticleRedirectProps) {
  const { slug } = await params;
  redirect(`/news/${slug}`);
}

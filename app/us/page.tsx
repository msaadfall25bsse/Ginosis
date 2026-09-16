import { Metadata } from "next";
import { CategoryView } from "@/components/news/CategoryView";

export const metadata: Metadata = {
  title: "U.S. News",
  description: "United States politics, domestic policies, economic developments, and national reports from GNOSIS.",
};

export default function USCategoryPage() {
  return <CategoryView categorySlug="us" />;
}

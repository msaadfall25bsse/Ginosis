import { Metadata } from "next";
import { CategoryView } from "@/components/news/CategoryView";

export const metadata: Metadata = {
  title: "World News",
  description: "International headlines, global affairs, diplomacy, and crisis coverage from GNOSIS.",
};

export default function WorldCategoryPage() {
  return <CategoryView categorySlug="world" />;
}

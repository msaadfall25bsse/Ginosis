import { Metadata } from "next";
import { CategoryView } from "@/components/news/CategoryView";

export const metadata: Metadata = {
  title: "Technology News",
  description: "Emerging artificial intelligence, computing hardware, science breakthroughs, and digital policy from GNOSIS.",
};

export default function TechnologyCategoryPage() {
  return <CategoryView categorySlug="technology" />;
}

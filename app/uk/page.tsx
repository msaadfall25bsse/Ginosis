import { Metadata } from "next";
import { CategoryView } from "@/components/news/CategoryView";

export const metadata: Metadata = {
  title: "UK News",
  description: "British politics, Westminster reports, economic shifts, and culture from GNOSIS.",
};

export default function UKCategoryPage() {
  return <CategoryView categorySlug="uk" />;
}

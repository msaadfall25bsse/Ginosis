import { Metadata } from "next";
import { CategoryView } from "@/components/news/CategoryView";

export const metadata: Metadata = {
  title: "Entertainment & Culture",
  description: "Arts, cinema, architecture, books, and cultural analysis from GNOSIS.",
};

export default function EntertainmentCategoryPage() {
  return <CategoryView categorySlug="entertainment" />;
}

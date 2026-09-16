import { Metadata } from "next";
import { CategoryView } from "@/components/news/CategoryView";

export const metadata: Metadata = {
  title: "Sports News",
  description: "Global tournaments, athletics, match results, and sports journalism from GNOSIS.",
};

export default function SportsCategoryPage() {
  return <CategoryView categorySlug="sports" />;
}

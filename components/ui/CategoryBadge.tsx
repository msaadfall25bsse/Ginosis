import React from "react";
import Link from "next/link";
import { CategorySlug } from "@/types/news";

interface CategoryBadgeProps {
  category: CategorySlug;
  label?: string;
  href?: string;
  className?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({
  category,
  label,
  href,
  className = "",
  size = "sm",
}: CategoryBadgeProps) {
  const displayLabel = label || category.toUpperCase();
  const sizeClasses =
    size === "sm"
      ? "text-[11px] tracking-wider py-0.5 px-2 font-semibold"
      : "text-xs tracking-wider py-1 px-2.5 font-bold";

  const content = (
    <span
      className={`inline-block uppercase rounded-none transition-colors duration-150 border-l-2 border-red-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${sizeClasses} ${className}`}
    >
      {displayLabel}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-zinc-400"
      >
        {content}
      </Link>
    );
  }

  return content;
}

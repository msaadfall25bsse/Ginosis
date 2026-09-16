import React from "react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
  className?: string;
}

export function SectionHeader({
  title,
  href,
  linkText = "View all",
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-baseline justify-between border-b-2 border-zinc-900 dark:border-zinc-100 pb-2 mb-6 ${className}`}
    >
      <h2 className="text-xl md:text-2xl font-bold tracking-tight uppercase text-zinc-900 dark:text-zinc-100 font-sans">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs uppercase font-semibold tracking-wider text-red-700 dark:text-red-500 hover:underline flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-red-600"
        >
          {linkText}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

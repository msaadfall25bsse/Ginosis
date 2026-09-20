import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface DiscoverySectionProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard Discovery Section Container (Phase 7 Sections 43, 86, 102, 115)
 * Wraps content discovery blocks with semantic HTML headings and accessible landmarks.
 */
export function DiscoverySection({
  title,
  subtitle,
  href,
  linkText,
  children,
  className = "",
}: DiscoverySectionProps) {
  return (
    <section aria-label={title} className={`py-6 sm:py-8 ${className}`}>
      <div className="mb-4">
        <SectionHeader
          title={title}
          href={href}
          linkText={linkText}
        />
        {subtitle && (
          <p className="-mt-3 mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}

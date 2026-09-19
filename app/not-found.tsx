import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <span className="text-xs uppercase font-bold tracking-widest text-red-700 dark:text-red-500">
        404 Error
      </span>
      <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-editorial">
        Story or Page Not Found
      </h1>
      <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
        The article or editorial section you are looking for has been moved, archived, or is no longer available.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-block text-xs uppercase font-bold tracking-wider bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 hover:bg-red-700 dark:hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          Return to Homepage
        </Link>
      </div>

      {/* Category Navigation Paths (Section 41) */}
      <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-zinc-500 block mb-4">
          Browse Editorial Sections
        </span>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold uppercase tracking-wider">
          <Link href="/world" className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            World
          </Link>
          <Link href="/us" className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            U.S.
          </Link>
          <Link href="/uk" className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            U.K.
          </Link>
          <Link href="/technology" className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            Technology
          </Link>
          <Link href="/sports" className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            Sports
          </Link>
          <Link href="/entertainment" className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            Entertainment
          </Link>
        </div>
      </div>
    </Container>
  );
}


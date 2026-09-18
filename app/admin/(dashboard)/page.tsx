import { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ArticleStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin Dashboard | GNOSIS",
  description: "GNOSIS Editorial Administration Console",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  // Query basic editorial counts (Section 120) with graceful fallback
  let articleCounts = {
    total: 0,
    draft: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
  };
  let mediaCount = 0;

  try {
    const [total, draft, published, scheduled, archived, mediaTotal] =
      await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
        prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
        prisma.article.count({ where: { status: ArticleStatus.SCHEDULED } }),
        prisma.article.count({ where: { status: ArticleStatus.ARCHIVED } }),
        prisma.media.count(),
      ]);

    articleCounts = { total, draft, published, scheduled, archived };
    mediaCount = mediaTotal;
  } catch {
    // Graceful fallback if database server is initializing
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Status Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-700 dark:text-red-500">
              Newsroom Workspace • Phase 5 Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-editorial mt-1">
              Welcome, {user?.name || "Administrator"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Gnosis Newsroom & Editorial Operations Console
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              Role: {user?.role || "ADMIN"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Section 120: Dashboard Article Summary */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
              Editorial Content Overview (Section 120)
            </h2>
            <div className="flex gap-2">
              <Link
                href="/admin/articles/new"
                className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                + New Article
              </Link>
              <Link
                href="/admin/articles"
                className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                View Articles
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-2xl font-black font-editorial text-zinc-900 dark:text-zinc-100 block">
                {articleCounts.total}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Total Articles
              </span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-2xl font-black font-editorial text-emerald-600 dark:text-emerald-400 block">
                {articleCounts.published}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Published
              </span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-2xl font-black font-editorial text-amber-600 dark:text-amber-400 block">
                {articleCounts.draft}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Drafts
              </span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-2xl font-black font-editorial text-blue-600 dark:text-blue-400 block">
                {articleCounts.scheduled}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Scheduled
              </span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
              <span className="text-2xl font-black font-editorial text-zinc-500 block">
                {articleCounts.archived}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Archived
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational Modules Overview */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-sans">
          Operational Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Article CMS Active Module */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Content Management
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                  Phase 5 Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-2">
                Article Editor & CMS
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Full editorial writing desk, rich text authoring, category taxonomy, and publishing lifecycle controls (Draft, Schedule, Publish, Archive).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <Link
                href="/admin/articles"
                className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
              >
                Open Workspace →
              </Link>
              <Link
                href="/admin/articles/new"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                + New Article
              </Link>
            </div>
          </div>

          {/* Media Library Active Module */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Asset Pipeline
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                  Phase 4 Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-2">
                Media & Image Library
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Centralized media management ({mediaCount} assets), drag-and-drop batch uploader, metadata inspector, safe asset replacement, and deletion protection.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/admin/media"
                className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
              >
                Open Media Library →
              </Link>
            </div>
          </div>

          {/* Settings / Analytics Placeholder */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Configuration
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5">
                  Future Phases
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-2">
                System & SEO Settings
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Site-wide publication metadata, Google News sitemap configurations, newsroom analytics, and security policy management.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400 italic">
                Scheduled for later phases
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

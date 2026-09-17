import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | GNOSIS",
  description: "GNOSIS Editorial Administration Console",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Status Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-700 dark:text-red-500">
              Session Authenticated • Phase 3 Foundation
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

        {/* System Architecture Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Data Architecture
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              PostgreSQL + Prisma ORM
            </span>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Session Security
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Encrypted HttpOnly Cookie (8h)
            </span>
          </div>
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Protection Layer
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Middleware + Server Guard
            </span>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Modules Placeholders (Section 42 & 43 Requirements) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-sans">
          Editorial Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Article CMS Placeholder */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Content Management
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5">
                  Phase 5
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-2">
                Article Editor & CMS
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Full-featured editorial writing desk, rich text authoring, multi-category assignment, and publishing lifecycle controls (Draft, Schedule, Publish, Archive).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400 italic">
                Scheduled for Phase 5 implementation
              </span>
            </div>
          </div>

          {/* Media Library Placeholder */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Asset Pipeline
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5">
                  Phase 4
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-editorial mb-2">
                Media & Image Management
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Media library dashboard, image upload pipeline, thumbnail generation, accessibility alt-text management, and inline story asset attachment.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-400 italic">
                Scheduled for Phase 4 implementation
              </span>
            </div>
          </div>

          {/* Settings / Analytics Placeholder */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
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

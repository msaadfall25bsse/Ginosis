import { Metadata } from "next";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | GNOSIS",
  description: "Secure administrative login portal for GNOSIS editorial staff.",
};

export default async function AdminLoginPage() {
  // If an active admin is already authenticated, redirect straight to dashboard
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen bg-[#f7f7f8] dark:bg-[#0c0c0e] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group focus:outline-none">
            <span className="font-editorial text-3xl sm:text-4xl font-black tracking-widest text-zinc-950 dark:text-zinc-50 uppercase select-none">
              GNOSIS
            </span>
          </Link>
          <div className="mt-2 text-xs uppercase tracking-widest font-bold text-red-700 dark:text-red-500">
            Editorial Administration
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Authorized publication staff only
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
          <LoginForm />
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <span aria-hidden="true">←</span>
            <span>Return to Gnosis Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

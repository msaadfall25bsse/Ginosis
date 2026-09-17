import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | GNOSIS",
  description: "GNOSIS Editorial Administration Dashboard",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-editorial text-zinc-900 dark:text-zinc-100">
        GNOSIS Administration
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Welcome, {user?.name || "Administrator"} ({user?.email})
      </p>
    </div>
  );
}

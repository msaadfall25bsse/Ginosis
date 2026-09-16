import React from "react";
import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="py-12 animate-pulse space-y-8">
      {/* Top placeholder banner */}
      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-1/4 rounded-xs" />

      {/* Hero grid placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 w-3/4 rounded-xs" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 w-full rounded-xs" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xs" />
        </div>
      </div>
    </Container>
  );
}

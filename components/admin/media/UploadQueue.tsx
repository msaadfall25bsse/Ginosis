"use client";

import React from "react";

export interface QueueItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  media?: any;
}

interface UploadQueueProps {
  queue: QueueItem[];
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function UploadQueue({ queue, onRetry, onRemove }: UploadQueueProps) {
  if (queue.length === 0) return null;

  const total = queue.length;
  const completed = queue.filter((i) => i.status === "success").length;
  const errors = queue.filter((i) => i.status === "error").length;
  const inProgress = queue.filter((i) => i.status === "uploading").length;

  const overallProgress = Math.round(
    queue.reduce((acc, item) => acc + item.progress, 0) / total
  );

  return (
    <div className="space-y-4">
      {/* Batch Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
        <div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block">
            Upload Queue ({completed + errors} of {total} processed)
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {inProgress > 0 ? `Uploading ${inProgress} item(s)...` : "Queue processing idle"}
          </span>
        </div>

        {/* Real Progress Counter */}
        <div className="flex items-center gap-3">
          <div className="w-28 sm:w-36 h-2 bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-150"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            {overallProgress}%
          </span>
        </div>
      </div>

      {/* Individual File Rows */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {queue.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                {/* Status Indicator Icon */}
                {item.status === "uploading" && (
                  <svg
                    className="animate-spin w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {item.status === "success" && (
                  <svg
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {item.status === "error" && (
                  <svg
                    className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {item.status === "pending" && (
                  <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                )}

                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {item.file.name}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                  ({formatBytes(item.file.size)})
                </span>
              </div>

              {/* Status Action or Progress */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status === "uploading" && (
                  <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
                    {item.progress}%
                  </span>
                )}
                {item.status === "error" && onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(item.id)}
                    className="px-2 py-0.5 text-[11px] font-bold uppercase bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-colors"
                  >
                    Retry
                  </button>
                )}
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
                    title="Remove from queue"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Individual Progress Bar */}
            {item.status === "uploading" && (
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-100"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}

            {/* Error Message */}
            {item.status === "error" && item.error && (
              <p className="text-[11px] text-red-600 dark:text-red-400">
                {item.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

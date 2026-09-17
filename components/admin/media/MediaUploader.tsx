"use client";

import React, { useState, useRef } from "react";
import { UploadQueue, QueueItem } from "./UploadQueue";

interface MediaUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export function MediaUploader({
  isOpen,
  onClose,
  onUploadComplete,
}: MediaUploaderProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Real upload via XMLHttpRequest for actual progress events (Section 19)
  function uploadSingleFile(queueId: string, file: File) {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === queueId ? { ...item, status: "uploading", progress: 0, error: undefined } : item
      )
    );

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    // Track Real Upload Progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setQueue((prev) =>
          prev.map((item) =>
            item.id === queueId ? { ...item, progress: percent } : item
          )
        );
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === queueId
                ? { ...item, status: "success", progress: 100, media: data.media }
                : item
            )
          );
          onUploadComplete?.();
        } else {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === queueId
                ? {
                    ...item,
                    status: "error",
                    error: data.error || `Upload failed with status ${xhr.status}`,
                  }
                : item
            )
          );
        }
      } catch {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? { ...item, status: "error", error: "Server response parse error" }
              : item
          )
        );
      }
    };

    xhr.onerror = () => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? { ...item, status: "error", error: "Network connection interrupted." }
            : item
        )
      );
    };

    xhr.open("POST", "/api/admin/media/upload");
    xhr.send(formData);
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newItems: QueueItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      progress: 0,
      status: "pending",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    // Kick off uploads
    newItems.forEach((item) => {
      uploadSingleFile(item.id, item.file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRetry(queueId: string) {
    const item = queue.find((i) => i.id === queueId);
    if (item) {
      uploadSingleFile(queueId, item.file);
    }
  }

  function handleRemove(queueId: string) {
    setQueue((prev) => prev.filter((i) => i.id !== queueId));
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2
              id="media-upload-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-editorial"
            >
              Upload Editorial Media
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Raster formats only (JPEG, PNG, WebP, AVIF) • Max 5MB per image
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none"
            aria-label="Close upload dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px] ${
              isDragging
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/20"
            }`}
          >
            <svg
              className="w-10 h-10 text-zinc-400 dark:text-zinc-500 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
              Drag & drop images here, or browse files
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Select one or multiple images simultaneously
            </span>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* Active Upload Queue */}
          <UploadQueue queue={queue} onRetry={handleRetry} onRemove={handleRemove} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            {queue.some((i) => i.status === "uploading") ? "Dismiss to Background" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ImagePlus, RefreshCw } from "lucide-react";
import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { usePortraitify } from "@/lib/store";
import { cn } from "@/lib/utils";

const MAX_SIZE = 20 * 1024 * 1024;

export default function UploadZone() {
  const openCrop = usePortraitify((s) => s.openCrop);
  const imageStatus = usePortraitify((s) => s.imageStatus);
  const fileName = usePortraitify((s) => s.fileName);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      const file = accepted[0] ?? rejected[0]?.file;
      if (!file) return;
      openCrop(URL.createObjectURL(file), file.name);
    },
    [openCrop]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: MAX_SIZE,
    multiple: false,
    noClick: imageStatus === "ready",
    noKeyboard: imageStatus === "ready",
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "group flex min-h-[118px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#0A0A0A]/25 bg-transparent px-4 py-5 text-center transition-colors duration-200 hover:border-[#0A0A0A]/60 hover:bg-[#0A0A0A]/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20",
          isDragActive && "border-[#0A0A0A] bg-[#0A0A0A]/[0.04]",
          imageStatus === "ready" && "!cursor-default"
        )}
      >
        <input {...getInputProps()} aria-label="Upload a photo" />
        <ImagePlus
          size={18}
          strokeWidth={1.5}
          className="text-[#0A0A0A]/45 transition-colors duration-200 group-hover:text-[#0A0A0A]"
        />
        {isDragActive ? (
          <p className="text-xs font-medium text-[#0A0A0A]">Release to load photo</p>
        ) : (
          <>
            <p className="text-xs font-medium text-[#0A0A0A]">
              Drop a photo, or click to browse
            </p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-[#0A0A0A]/35">
              JPG / PNG / WEBP · PROCESSED LOCALLY
            </p>
          </>
        )}
      </div>

      {imageStatus === "ready" && fileName && (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs text-[#0A0A0A]">{fileName}</p>
            <p className="font-mono text-[9px] tracking-[0.16em] text-[#0A0A0A]/35">
              SOURCE COMMITTED
            </p>
          </div>
          <button
            type="button"
            onClick={open}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-white px-3 text-[11px] text-[#0A0A0A] transition-colors duration-200 hover:bg-[#0A0A0A] hover:text-white"
          >
            <RefreshCw size={11} strokeWidth={1.5} />
            Replace
          </button>
        </div>
      )}
    </div>
  );
}

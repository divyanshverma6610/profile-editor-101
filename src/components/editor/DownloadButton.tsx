"use client";

import { Download, FileCode2 } from "lucide-react";
import { useState } from "react";
import { buildSvg, effectById, paintCanvas } from "@/lib/effects";
import { exportFileName, makeInkSampler, sourceStore, triggerDownload } from "@/lib/imageUtils";
import { usePortraitify } from "@/lib/store";

const EXPORT_SIZE = 1080;

/**
 * Renders the current effect at export resolution offscreen and downloads it.
 * PNG always (1080×1080, Instagram-ready); SVG when the effect's geometry
 * compiles to vector-safe primitives.
 */
export default function DownloadButton() {
  const effect = usePortraitify((s) => s.effect);
  const params = usePortraitify((s) => s.params[s.effect]);
  const imageStatus = usePortraitify((s) => s.imageStatus);
  const [busy, setBusy] = useState<"png" | "svg" | null>(null);

  const ready = imageStatus === "ready" && !!sourceStore.current;
  const def = effectById(effect);

  const run = (kind: "png" | "svg") => {
    const src = sourceStore.current;
    if (!src || busy) return;
    setBusy(kind);
    // Let the button paint its busy state before the synchronous render.
    window.setTimeout(() => {
      try {
        const ink = makeInkSampler(src, params);
        const prims = def.build(EXPORT_SIZE, ink, params);
        if (kind === "png") {
          const canvas = document.createElement("canvas");
          canvas.width = EXPORT_SIZE;
          canvas.height = EXPORT_SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas 2D unavailable");
          paintCanvas(ctx, prims, EXPORT_SIZE);
          canvas.toBlob((blob) => {
            if (blob) triggerDownload(blob, exportFileName(effect, "png"));
            setBusy(null);
          }, "image/png");
        } else {
          const svg = buildSvg(prims, EXPORT_SIZE);
          triggerDownload(new Blob([svg], { type: "image/svg+xml" }), exportFileName(effect, "svg"));
          setBusy(null);
        }
      } catch {
        setBusy(null);
      }
    }, 40);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => run("png")}
        disabled={!ready || busy !== null}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0A0A0A] text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0A0A0A]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/30 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Download size={15} strokeWidth={1.5} />
        {busy === "png" ? "Rendering…" : "Download PNG"}
      </button>

      {def.svg && (
        <button
          type="button"
          onClick={() => run("svg")}
          disabled={!ready || busy !== null}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-[#E5E5E5] bg-white text-xs font-medium text-[#0A0A0A] transition-colors duration-200 hover:border-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <FileCode2 size={13} strokeWidth={1.5} />
          {busy === "svg" ? "Rendering…" : "Download SVG"}
        </button>
      )}

      <p className="pt-1 text-center font-mono text-[9px] tracking-[0.16em] text-[#0A0A0A]/35">
        {def.svg ? "PNG 1080×1080 · SVG VECTOR · " : "PNG 1080×1080 · "}
        portraitify-{effect}-…
      </p>
    </div>
  );
}

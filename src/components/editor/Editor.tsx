"use client";

import { useEffect, useRef } from "react";
import ControlPanel from "@/components/editor/ControlPanel";
import CropModal from "@/components/editor/CropModal";
import PreviewCanvas from "@/components/editor/PreviewCanvas";
import Header from "@/components/Header";
import { loadImage, luminanceCover, sourceStore } from "@/lib/imageUtils";
import { usePortraitify } from "@/lib/store";

export default function Editor() {
  const booted = useRef(false);

  // Warm start: load the bundled demo portrait so the canvas is alive on
  // first paint — and cached for offline launches by the service worker.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const { beginImage, commitImage, failImage } = usePortraitify.getState();
    beginImage();
    fetch("/demo-image.jpg")
      .then((r) => {
        if (!r.ok) throw new Error("demo missing");
        return r.blob();
      })
      .then((blob) => loadImage(URL.createObjectURL(blob)))
      .then((img) => {
        sourceStore.current = luminanceCover(img);
        commitImage("demo-image.jpg");
      })
      .catch(() => failImage());
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#FAFAFA] text-[#0A0A0A]">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(380px,40%)_1fr]">
        {/* Live preview — on top on mobile, right rail on desktop */}
        <section className="order-1 h-[44dvh] max-h-[480px] shrink-0 border-b border-[#E5E5E5] lg:order-2 lg:h-auto lg:max-h-none lg:border-b-0">
          <PreviewCanvas />
        </section>

        {/* Controls — left rail on desktop, sheet below on mobile */}
        <aside className="order-2 min-h-0 flex-1 overflow-y-auto overscroll-contain lg:order-1 lg:border-r lg:border-[#E5E5E5]">
          <ControlPanel />
        </aside>
      </main>

      <footer className="flex h-11 shrink-0 items-center justify-between border-t border-[#E5E5E5] px-4 sm:px-6">
        <p className="truncate text-[11px] text-[#0A0A0A]/50">
          Made with care. All processing happens in your browser.
        </p>
        <p className="hidden font-mono text-[9px] tracking-[0.2em] text-[#0A0A0A]/35 sm:block">
          PWA · OFFLINE-READY
        </p>
      </footer>

      <CropModal />
    </div>
  );
}

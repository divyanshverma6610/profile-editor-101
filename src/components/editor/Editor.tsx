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
    // Mobile: the document scrolls naturally — no nested scrollers, no
    // locked heights. Desktop (lg+): fixed split-pane, internal scrolling.
    <div className="flex min-h-dvh flex-col bg-[#FAFAFA] text-[#0A0A0A] lg:h-dvh lg:overflow-hidden">
      <Header />

      <main className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[minmax(380px,40%)_1fr]">
        {/* Live preview — top sheet on mobile, right rail on desktop */}
        <section className="order-1 h-[44dvh] min-h-[320px] max-h-[520px] shrink-0 border-b border-[#E5E5E5] lg:order-2 lg:h-auto lg:min-h-0 lg:max-h-none lg:border-b-0">
          <PreviewCanvas />
        </section>

        {/* Controls — natural page flow on mobile, internal scroll on desktop */}
        <aside className="order-2 lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-[#E5E5E5]">
          <ControlPanel />
        </aside>
      </main>

      <footer className="flex shrink-0 items-center justify-between border-t border-[#E5E5E5] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:h-11 lg:py-0 lg:pb-0">
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

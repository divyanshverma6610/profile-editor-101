"use client";

import type P5Type from "p5";
import { ImageOff, Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EFFECTS, effectIndex, PAPER } from "@/lib/effects";
import { paintWithP5 } from "@/lib/effects/p5painter";
import { makeInkSampler, sourceStore } from "@/lib/imageUtils";
import { usePortraitify } from "@/lib/store";

/**
 * Live preview. A single p5 instance (instance mode) owns the canvas and
 * runs a continuous frame loop. Any parameter/effect/source change marks
 * the renderer dirty; the very next animation frame (~16ms) rebuilds the
 * geometry from the cached luminance field and repaints — so dragging a
 * slider updates the portrait in real time, coalesced to one frame each.
 */
export default function PreviewCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<P5Type | null>(null);
  const sizeRef = useRef(420);
  const dirtyRef = useRef(true);

  const [size, setSize] = useState(0);
  const [mounted, setMounted] = useState(false);

  const effect = usePortraitify((s) => s.effect);
  const params = usePortraitify((s) => s.params[s.effect]);
  const version = usePortraitify((s) => s.version);
  const imageStatus = usePortraitify((s) => s.imageStatus);

  sizeRef.current = size || sizeRef.current;

  // The frame loop always reads the freshest state through this ref.
  const stateRef = useRef({ effect, params, version });
  stateRef.current = { effect, params, version };

  // Spin up the p5 instance once (client-only, dynamically imported).
  useEffect(() => {
    let alive = true;
    let instance: P5Type | null = null;
    (async () => {
      const { default: P5 } = await import("p5");
      if (!alive || !hostRef.current) return;
      instance = new P5((p) => {
        p.setup = () => {
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(sizeRef.current, sizeRef.current);
          // Continuous loop — draw() no-ops unless a change is pending.
        };
        p.draw = () => {
          if (!dirtyRef.current) return;
          dirtyRef.current = false;
          const src = sourceStore.current;
          if (!src) {
            p.push();
            p.background(PAPER);
            p.pop();
            return;
          }
          const s = stateRef.current;
          const def = EFFECTS[effectIndex(s.effect)];
          const ink = makeInkSampler(src, s.params);
          const prims = def.build(sizeRef.current, ink, s.params);
          paintWithP5(p, prims);
        };
      }, hostRef.current);
      p5Ref.current = instance;
      setMounted(true);
    })();
    return () => {
      alive = false;
      instance?.remove();
      p5Ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track the available area; the preview is a centered square ≤ 600px.
  useLayoutEffect(() => {
    if (!areaRef.current) return;
    const el = areaRef.current;
    const measure = () => {
      const s = Math.min(el.clientWidth, el.clientHeight) - 56;
      setSize(Math.max(220, Math.min(600, Math.floor(s))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Resize the live canvas when the square size changes.
  useEffect(() => {
    if (p5Ref.current && size > 0) {
      sizeRef.current = size;
      p5Ref.current.resizeCanvas(size, size);
    }
  }, [size]);

  // Mark dirty synchronously on any change — the frame loop picks it up
  // on the next animation frame, so updates feel immediate while dragging.
  useEffect(() => {
    if (!mounted || imageStatus !== "ready") return;
    dirtyRef.current = true;
  }, [mounted, effect, params, version, size, imageStatus]);

  const def = EFFECTS[effectIndex(effect)];
  const box = size || 0;

  return (
    <div ref={areaRef} className="flex h-full w-full flex-col items-center justify-center px-6 py-6">
      <div style={{ width: box }} className="max-w-full">
        <div className="mb-2.5 flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/50">
            {String(effectIndex(effect) + 1).padStart(2, "0")}/{String(EFFECTS.length).padStart(2, "0")}
            <span className="mx-2 text-[#0A0A0A]/25">/</span>
            {def.label}
          </p>
          <p className="font-mono text-[10px] tabular-nums tracking-[0.14em] text-[#0A0A0A]/35">
            {box}×{box}
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border border-[#E5E5E5] bg-white"
          style={{ width: box, height: box }}
        >
          {/* Pointer-events disabled: the preview is display-only, so touch
              gestures pass straight through to native page scrolling. This
              also stops p5's canvas touch handlers from swallowing swipes. */}
          <div
            ref={hostRef}
            className="pointer-events-none absolute inset-0 [touch-action:pan-y] [&>canvas]:block [&>canvas]:!h-full [&>canvas]:!w-full"
          />
          {imageStatus !== "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
              {imageStatus === "loading" ? (
                <>
                  <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-[#0A0A0A]/50" />
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#0A0A0A]/40">
                    PROCESSING SOURCE…
                  </p>
                </>
              ) : (
                <>
                  <ImageOff size={18} strokeWidth={1.5} className="text-[#0A0A0A]/30" />
                  <p className="font-mono text-[10px] tracking-[0.2em] text-[#0A0A0A]/40">
                    UPLOAD A PHOTO TO BEGIN
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#0A0A0A]/35">
            RENDERED LOCALLY · LIVE
          </p>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#0A0A0A]/35">
            EXPORT · 1080×1080 PNG{def.svg ? " / SVG" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

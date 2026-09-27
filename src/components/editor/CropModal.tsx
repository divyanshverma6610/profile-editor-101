"use client";

import { Check, Scan, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  loadImage,
  luminanceFromCrop,
  sourceStore,
  PROCESS_RES,
} from "@/lib/imageUtils";
import { usePortraitify } from "@/lib/store";

/**
 * 1:1 crop editor. The image is cover-fitted into a square stage; the user
 * drags to pan and zooms with a slider. Applying commits a downscaled
 * luminance field to sourceStore — the single source of truth for effects.
 */
export default function CropModal() {
  const pending = usePortraitify((s) => s.pendingSource);
  const closeCrop = usePortraitify((s) => s.closeCrop);
  const commitImage = usePortraitify((s) => s.commitImage);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number } | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [stage, setStage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Load the pending image.
  useEffect(() => {
    setImg(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (!pending) return;
    let alive = true;
    loadImage(pending.url)
      .then((el) => alive && setImg(el))
      .catch(() => alive && closeCrop());
    return () => {
      alive = false;
    };
  }, [pending, closeCrop]);

  // Measure the stage.
  useLayoutEffect(() => {
    if (!pending || !stageRef.current) return;
    const el = stageRef.current;
    const measure = () => setStage(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pending]);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCrop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, closeCrop]);

  const iw = img?.naturalWidth ?? 0;
  const ih = img?.naturalHeight ?? 0;
  const cover = iw && ih && stage ? Math.max(stage / iw, stage / ih) : 1;
  const k = cover * zoom;

  const clampOffset = useCallback(
    (x: number, y: number, kk: number) => {
      if (!iw || !ih || !stage) return { x: 0, y: 0 };
      const mx = Math.max(0, (iw * kk - stage) / 2);
      const my = Math.max(0, (ih * kk - stage) / 2);
      return { x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
    },
    [iw, ih, stage]
  );

  if (!pending) return null;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX - offset.x, py: e.clientY - offset.y };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const next = clampOffset(e.clientX - dragRef.current.px, e.clientY - dragRef.current.py, k);
    setOffset(next);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const apply = () => {
    if (!img || !stage) return;
    const side = stage / k;
    const sx = iw / 2 - (stage / 2 + offset.x) / k;
    const sy = ih / 2 - (stage / 2 + offset.y) / k;
    try {
      sourceStore.current = luminanceFromCrop(img, sx, sy, side, PROCESS_RES);
      commitImage(pending.name);
    } finally {
      closeCrop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="max-h-[92dvh] w-full max-w-[520px] overflow-y-auto overscroll-contain rounded-xl border border-[#E5E5E5] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
            Adjust crop — 1:1
          </p>
          <button
            type="button"
            aria-label="Cancel"
            onClick={closeCrop}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#0A0A0A]/50 transition-colors duration-200 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative mx-auto mt-4 aspect-square w-full max-w-[400px] touch-none select-none overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]"
          style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
        >
          {img && stage > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pending.url}
              alt="Crop source"
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                width: iw * k,
                height: ih * k,
                left: stage / 2 + offset.x - (iw * k) / 2,
                top: stage / 2 + offset.y - (ih * k) / 2,
              }}
            />
          )}
          {/* rule-of-thirds overlay */}
          <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-difference">
            <div className="absolute left-1/3 top-0 h-full w-px bg-white/70" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-white/70" />
            <div className="absolute left-0 top-1/3 h-px w-full bg-white/70" />
            <div className="absolute left-0 top-2/3 h-px w-full bg-white/70" />
            <div className="absolute inset-2 rounded-md border border-white/50" />
          </div>
          {!img && (
            <div className="absolute inset-0 grid place-items-center">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#0A0A0A]/40">
                LOADING…
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-4">
          <span className="w-12 font-mono text-[10px] tracking-[0.18em] text-[#0A0A0A]/45">
            ZOOM
          </span>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={([z]) => {
              const kk = cover * z;
              setZoom(z);
              setOffset((o) => clampOffset(o.x, o.y, kk));
            }}
          />
          <span className="w-10 text-right font-mono text-[10px] text-[#0A0A0A]/45">
            {zoom.toFixed(2)}×
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E5E5E5] px-4 text-xs text-[#0A0A0A] transition-colors duration-200 hover:bg-[#0A0A0A]/5"
          >
            <Scan size={13} strokeWidth={1.5} />
            Center
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={!img || !stage}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0A0A0A] px-5 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#0A0A0A]/85 disabled:opacity-40"
          >
            <Check size={13} strokeWidth={1.5} />
            Apply crop
          </button>
        </div>
      </div>
    </div>
  );
}

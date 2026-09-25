import type { EffectParams, InkSampler } from "./effects";
import { clamp01 } from "./utils";

/**
 * Source images are rasterized once into a downscaled luminance field.
 * Every effect then samples this field — recomputing only happens when a
 * new image is committed, never when sliders move.
 */
export interface SourceLuminance {
  data: Float32Array;
  res: number;
}

export const PROCESS_RES = 400;

/** Module-level cache: heavy pixel data stays out of React state. */
export const sourceStore: { current: SourceLuminance | null } = {
  current: null,
};

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image"));
    img.src = url;
  });
}

/** Extract a luminance field from a square source rect of `img`. */
export function luminanceFromCrop(
  img: CanvasImageSource,
  sx: number,
  sy: number,
  side: number,
  res: number = PROCESS_RES
): SourceLuminance {
  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, side, side, 0, 0, res, res);
  const raw = ctx.getImageData(0, 0, res, res).data;
  const data = new Float32Array(res * res);
  for (let i = 0; i < res * res; i++) {
    const r = raw[i * 4];
    const g = raw[i * 4 + 1];
    const b = raw[i * 4 + 2];
    // Rec. 601 luminance, normalized to 0 (black) .. 1 (white).
    data[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  return { data, res };
}

/** Center-square cover crop — used for the bundled demo and quick apply. */
export function luminanceCover(
  img: HTMLImageElement,
  res: number = PROCESS_RES
): SourceLuminance {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const side = Math.min(w, h);
  return luminanceFromCrop(img, (w - side) / 2, (h - side) / 2, side, res);
}

/**
 * Bake contrast + inversion into a sampler that returns ink amount
 * (0 = paper, 1 = solid ink) at normalized coordinates, bilinear-interpolated.
 */
export function makeInkSampler(src: SourceLuminance, params: EffectParams): InkSampler {
  const { data, res } = src;
  const k = 1 + (params.contrast / 100) * 2.6;
  const invert = params.invert;

  const at = (x: number, y: number) => {
    const fx = Math.min(res - 1.001, Math.max(0, x));
    const fy = Math.min(res - 1.001, Math.max(0, y));
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const i00 = y0 * res + x0;
    const i10 = i00 + 1;
    const i01 = i00 + res;
    const i11 = i01 + 1;
    const top = data[i00] * (1 - tx) + data[i10] * tx;
    const bottom = data[i01] * (1 - tx) + data[i11] * tx;
    return top * (1 - ty) + bottom * ty;
  };

  return (nx, ny) => {
    let l = at(nx * (res - 1), ny * (res - 1));
    l = clamp01(0.5 + (l - 0.5) * k);
    return invert ? l : 1 - l;
  };
}

/** Timestamped export basename per the product spec. */
export function exportFileName(effect: string, ext: "png" | "svg"): string {
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `portraitify-${effect}-${ts}.${ext}`;
}

export function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

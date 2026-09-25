import type { Prim } from "./primitives";
import type { EffectParams, InkSampler } from "./types";

const SCREEN_ANGLE = (26 * Math.PI) / 180;

/**
 * Newspaper halftone — a dot screen rotated by 26°, sampled in the rotated
 * frame but read against the source image in its original orientation.
 */
export function buildHalftone(size: number, ink: InkSampler, p: EffectParams): Prim[] {
  const t = (p.density - 20) / 180;
  const cols = Math.round(22 + t * 62); // 22 → 84 cells per side
  const cell = size / cols;
  const gain = 0.16 + p.strokeWeight * 0.135;

  const cx = size / 2;
  const cy = size / 2;
  const cos = Math.cos(SCREEN_ANGLE);
  const sin = Math.sin(SCREEN_ANGLE);
  const half = size * 0.78; // covers the rotated bounding box

  const prims: Prim[] = [];
  for (let gy = -half; gy <= half; gy += cell) {
    for (let gx = -half; gx <= half; gx += cell) {
      const x = cx + gx * cos - gy * sin;
      const y = cy + gx * sin + gy * cos;
      if (x < 0 || x > size || y < 0 || y > size) continue;
      const d = ink(x / size, y / size);
      const r = Math.min(Math.pow(d, 0.85) * cell * gain, cell * 0.78);
      if (r > cell * 0.05) prims.push({ kind: "circle", x, y, r });
    }
  }
  return prims;
}

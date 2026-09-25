import type { Prim } from "./primitives";
import type { EffectParams, InkSampler } from "./types";

/**
 * Stipple grid — dot radius scales with local darkness, like a hand-made
 * stipple portrait.
 */
export function buildDots(size: number, ink: InkSampler, p: EffectParams): Prim[] {
  const t = (p.density - 20) / 180;
  const cols = Math.round(24 + t * 66); // 24 → 90 cells per side
  const cell = size / cols;
  const gain = 0.15 + p.strokeWeight * 0.13; // radius gain from weight

  const prims: Prim[] = [];
  for (let gy = 0; gy < cols; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const x = (gx + 0.5) * cell;
      const y = (gy + 0.5) * cell;
      const d = ink(x / size, y / size);
      const r = Math.min(Math.pow(d, 0.8) * cell * gain, cell * 0.72);
      if (r > cell * 0.04) prims.push({ kind: "circle", x, y, r });
    }
  }
  return prims;
}

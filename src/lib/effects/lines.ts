import type { Prim } from "./primitives";
import type { EffectParams, InkSampler } from "./types";

/**
 * "Joy Division" ridges — horizontal scanlines displaced upward by the
 * darkness beneath them. Each row draws an occlusion band so nearer
 * ridges overlap farther ones, producing the classic pulsar terrain.
 */
export function buildLines(size: number, ink: InkSampler, p: EffectParams): Prim[] {
  const t = (p.density - 20) / 180;
  const rows = Math.round(14 + t * 58); // 14 → 72 rows
  const rowH = size / rows;
  const stepX = Math.max(2, size / 300);
  const amp = rowH * 2.4 * (0.55 + 0.12 * p.strokeWeight);

  const prims: Prim[] = [];
  for (let i = 0; i < rows; i++) {
    const yBase = (i + 0.85) * rowH;
    const ny = yBase / size;
    const pts: number[] = [];
    for (let x = 0; x <= size + stepX * 0.5; x += stepX) {
      const cx = Math.min(x, size);
      const d = ink(cx / size, ny);
      pts.push(cx, yBase - d * amp);
    }
    prims.push({ kind: "band", pts, w: p.strokeWeight, base: size + 2 });
  }
  return prims;
}

import type { Prim } from "./primitives";
import type { EffectParams, InkSampler } from "./types";

/**
 * Concentric rings pushed outward by local darkness — a radial waveform
 * that maps the face into topographic contours.
 */
export function buildWaveform(size: number, ink: InkSampler, p: EffectParams): Prim[] {
  const t = (p.density - 20) / 180;
  const rings = Math.round(9 + t * 37); // 9 → 46 rings
  const maxR = size * 0.44;
  const spacing = maxR / rings;
  const amp = spacing * 1.35 * (0.55 + 0.12 * p.strokeWeight);
  const cx = size / 2;
  const cy = size / 2;

  const prims: Prim[] = [];
  for (let j = 0; j < rings; j++) {
    const r0 = spacing * (j + 0.55);
    const steps = Math.max(56, Math.round((Math.PI * 2 * r0) / 3));
    const pts: number[] = [];
    for (let k = 0; k < steps; k++) {
      const theta = (k / steps) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const d = ink((cx + r0 * cosT) / size, (cy + r0 * sinT) / size);
      const r = r0 + d * amp;
      pts.push(cx + r * cosT, cy + r * sinT);
    }
    prims.push({ kind: "polyline", pts, w: p.strokeWeight, close: true });
  }
  return prims;
}

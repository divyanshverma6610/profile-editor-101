import type { Prim } from "./primitives";
import type { EffectParams, InkSampler } from "./types";

/**
 * Archimedean spiral (r = a·θ) radiating from the image center.
 * Stroke width at each point follows local darkness: dark features carve
 * thick ink, highlights fall back to a hairline.
 */
export function buildSpiral(size: number, ink: InkSampler, p: EffectParams): Prim[] {
  const t = (p.density - 20) / 180; // 0..1
  const turns = 4 + t * 20; // 4 → 24 revolutions
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.47;
  const a = maxR / (turns * Math.PI * 2);
  const ds = Math.max(1.4, size / 420); // arc-length step in px

  const pts: number[] = [];
  const ws: number[] = [];

  let theta = 0;
  let r = 0;
  const guard = 24000;
  while (r < maxR && pts.length / 2 < guard) {
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    const d = ink(x / size, y / size);
    pts.push(x, y);
    ws.push(Math.max(0.25, p.strokeWeight * (0.22 + d * d * 2.6)));
    theta += ds / Math.max(r, a * 1.6);
    r = a * theta;
  }

  return [{ kind: "varline", pts, ws }];
}

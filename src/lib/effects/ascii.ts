import type { Prim } from "./primitives";
import type { EffectParams, InkSampler } from "./types";

/** Light → dark ramp. Index 0 stays empty so highlights read as paper. */
const RAMP = [" ", ".", ":", "-", "=", "+", "*", "#", "@"];

/**
 * Typewriter portrait — source luminance mapped onto a density-ordered
 * glyph ramp, set in monospace.
 */
export function buildAscii(size: number, ink: InkSampler, p: EffectParams): Prim[] {
  const t = (p.density - 20) / 180;
  const cols = Math.round(30 + t * 80); // 30 → 110 columns
  const cell = size / cols;
  const px = Math.min(cell * (0.5 + p.strokeWeight * 0.34), cell * 1.55);

  const prims: Prim[] = [];
  for (let gy = 0; gy < cols; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const x = (gx + 0.5) * cell;
      const y = (gy + 0.5) * cell;
      const d = ink(x / size, y / size);
      const idx = Math.min(RAMP.length - 1, Math.round(d * (RAMP.length - 1)));
      const ch = RAMP[idx];
      if (ch !== " ") prims.push({ kind: "text", x, y, ch, px });
    }
  }
  return prims;
}

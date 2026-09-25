export type EffectId =
  | "spiral"
  | "lines"
  | "dots"
  | "halftone"
  | "waveform"
  | "ascii";

export interface EffectParams {
  /** 20 – 200 */
  density: number;
  /** 0.5 – 5 */
  strokeWeight: number;
  /** 0 – 100 */
  contrast: number;
  invert: boolean;
}

/**
 * Returns the "ink amount" (0 = paper, 1 = solid ink) at normalized
 * coordinates (0..1 across the square canvas). Contrast and inversion are
 * already baked in by the sampler factory.
 */
export type InkSampler = (nx: number, ny: number) => number;

export const INK = "#0A0A0A";
export const PAPER = "#FFFFFF";

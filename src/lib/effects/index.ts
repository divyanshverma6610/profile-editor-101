import { buildAscii } from "./ascii";
import { buildDots } from "./dots";
import { buildHalftone } from "./halftone";
import { buildLines } from "./lines";
import type { Prim } from "./primitives";
import { buildSpiral } from "./spiral";
import type { EffectId, EffectParams, InkSampler } from "./types";
import { buildWaveform } from "./waveform";

export interface EffectDef {
  id: EffectId;
  label: string;
  /** Whether the effect compiles to SVG-safe primitives. */
  svg: boolean;
  build: (size: number, ink: InkSampler, p: EffectParams) => Prim[];
}

export const EFFECTS: EffectDef[] = [
  { id: "spiral", label: "Spiral", svg: false, build: buildSpiral },
  { id: "lines", label: "Lines", svg: true, build: buildLines },
  { id: "dots", label: "Dots", svg: true, build: buildDots },
  { id: "halftone", label: "Halftone", svg: true, build: buildHalftone },
  { id: "waveform", label: "Waveform", svg: true, build: buildWaveform },
  { id: "ascii", label: "ASCII", svg: true, build: buildAscii },
];

export const effectById = (id: EffectId): EffectDef =>
  EFFECTS.find((e) => e.id === id) ?? EFFECTS[0];

export const effectIndex = (id: EffectId): number =>
  EFFECTS.findIndex((e) => e.id === id);

export * from "./types";
export { buildSvg, paintCanvas } from "./primitives";
export type { Prim } from "./primitives";

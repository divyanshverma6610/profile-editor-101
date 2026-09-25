import { create } from "zustand";
import type { EffectId, EffectParams } from "./effects";

const DEFAULTS: Record<EffectId, EffectParams> = {
  spiral: { density: 96, strokeWeight: 1.6, contrast: 25, invert: false },
  lines: { density: 110, strokeWeight: 1.4, contrast: 25, invert: false },
  dots: { density: 82, strokeWeight: 1.8, contrast: 25, invert: false },
  halftone: { density: 92, strokeWeight: 1.6, contrast: 25, invert: false },
  waveform: { density: 100, strokeWeight: 1.4, contrast: 25, invert: false },
  ascii: { density: 74, strokeWeight: 1.2, contrast: 25, invert: false },
};

export type ImageStatus = "empty" | "loading" | "ready";

export interface PendingSource {
  url: string;
  name: string;
}

interface PortraitifyState {
  effect: EffectId;
  params: Record<EffectId, EffectParams>;
  setEffect: (effect: EffectId) => void;
  setNumericParam: (key: "density" | "strokeWeight" | "contrast", value: number) => void;
  toggleInvert: () => void;
  resetParams: () => void;

  /** Bumped whenever a new source image is committed to sourceStore. */
  version: number;
  imageStatus: ImageStatus;
  fileName: string | null;
  beginImage: () => void;
  commitImage: (name: string) => void;
  failImage: () => void;

  pendingSource: PendingSource | null;
  openCrop: (url: string, name: string) => void;
  closeCrop: () => void;

  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;
}

export const usePortraitify = create<PortraitifyState>()((set, get) => ({
  effect: "spiral",
  params: DEFAULTS,
  setEffect: (effect) => set({ effect }),
  setNumericParam: (key, value) => {
    const { effect, params } = get();
    set({ params: { ...params, [effect]: { ...params[effect], [key]: value } } });
  },
  toggleInvert: () => {
    const { effect, params } = get();
    set({
      params: {
        ...params,
        [effect]: { ...params[effect], invert: !params[effect].invert },
      },
    });
  },
  resetParams: () => {
    const { effect, params } = get();
    set({ params: { ...params, [effect]: { ...DEFAULTS[effect] } } });
  },

  version: 0,
  imageStatus: "empty",
  fileName: null,
  beginImage: () => set({ imageStatus: "loading" }),
  commitImage: (name) =>
    set((s) => ({ version: s.version + 1, imageStatus: "ready", fileName: name })),
  failImage: () => set({ imageStatus: "empty" }),

  pendingSource: null,
  openCrop: (url, name) => set({ pendingSource: { url, name } }),
  closeCrop: () => {
    const pending = get().pendingSource;
    if (pending) URL.revokeObjectURL(pending.url);
    set({ pendingSource: null });
  },

  aboutOpen: false,
  setAboutOpen: (open) => set({ aboutOpen: open }),
}));

"use client";

import { RotateCcw } from "lucide-react";
import DownloadButton from "@/components/editor/DownloadButton";
import EffectTabs from "@/components/editor/EffectTabs";
import UploadZone from "@/components/editor/UploadZone";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { usePortraitify } from "@/lib/store";

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[9px] tracking-[0.18em] text-[#0A0A0A]/30">{index}</span>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
        {children}
      </h2>
    </div>
  );
}

function ParamRow({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[13px] text-[#0A0A0A]">{label}</label>
        <span className="font-mono text-[11px] tabular-nums text-[#0A0A0A]/50">{display}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] tabular-nums text-[#0A0A0A]/30">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function ControlPanel() {
  const effect = usePortraitify((s) => s.effect);
  const params = usePortraitify((s) => s.params[s.effect]);
  const setNumericParam = usePortraitify((s) => s.setNumericParam);
  const toggleInvert = usePortraitify((s) => s.toggleInvert);
  const resetParams = usePortraitify((s) => s.resetParams);

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 bg-[#FAFAFA] px-5 pt-4 sm:px-6">
        <EffectTabs />
      </div>

      <div className="flex-1 space-y-8 px-5 py-6 sm:px-6">
        <section className="space-y-3">
          <SectionLabel index="01">Source</SectionLabel>
          <UploadZone />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionLabel index="02">Parameters</SectionLabel>
            <button
              type="button"
              onClick={resetParams}
              className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/45 transition-colors duration-200 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]"
            >
              <RotateCcw size={11} strokeWidth={1.5} />
              Reset
            </button>
          </div>

          <ParamRow
            label="Density"
            value={params.density}
            display={String(Math.round(params.density))}
            min={20}
            max={200}
            step={1}
            onChange={(v) => setNumericParam("density", v)}
          />
          <ParamRow
            label="Stroke weight"
            value={params.strokeWeight}
            display={params.strokeWeight.toFixed(1)}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(v) => setNumericParam("strokeWeight", v)}
          />
          <ParamRow
            label="Contrast"
            value={params.contrast}
            display={`${Math.round(params.contrast)}%`}
            min={0}
            max={100}
            step={1}
            onChange={(v) => setNumericParam("contrast", v)}
          />

          <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4">
            <div>
              <p className="text-[13px] text-[#0A0A0A]">Invert tones</p>
              <p className="mt-0.5 font-mono text-[9px] tracking-[0.14em] text-[#0A0A0A]/35">
                SWAP INK &amp; PAPER
              </p>
            </div>
            <Switch
              checked={params.invert}
              onCheckedChange={toggleInvert}
              aria-label="Invert tones"
            />
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-[#E5E5E5] bg-[#FAFAFA]/95 px-5 pb-5 pt-4 backdrop-blur-sm sm:px-6">
        <div className="mb-3">
          <SectionLabel index="03">Export</SectionLabel>
        </div>
        <DownloadButton />
      </div>
    </div>
  );
}

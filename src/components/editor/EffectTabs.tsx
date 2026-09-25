"use client";

import { EFFECTS } from "@/lib/effects";
import { usePortraitify } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Underline-style effect switcher, mono labels with position indices. */
export default function EffectTabs() {
  const effect = usePortraitify((s) => s.effect);
  const setEffect = usePortraitify((s) => s.setEffect);

  return (
    <div
      role="tablist"
      aria-label="Effect"
      className="flex gap-5 overflow-x-auto border-b border-[#E5E5E5] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {EFFECTS.map((def, i) => {
        const active = def.id === effect;
        return (
          <button
            key={def.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => setEffect(def.id)}
            className={cn(
              "group relative -mb-px shrink-0 pb-2.5 pt-1 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200",
              active ? "text-[#0A0A0A]" : "text-[#0A0A0A]/35 hover:text-[#0A0A0A]/70"
            )}
          >
            <span className="mr-1.5 text-[9px] text-[#0A0A0A]/30">
              {String(i + 1).padStart(2, "0")}
            </span>
            {def.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 bg-[#0A0A0A] transition-opacity duration-200",
                active ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { ArrowDownToLine, Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * Header install affordance.
 * Hidden when the app is already installed or the platform cannot prompt.
 * On iOS Safari it reveals manual Add-to-Home-Screen instructions.
 */
export default function InstallButton() {
  const install = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showIosHelp) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowIosHelp(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [showIosHelp]);

  if (install.status === "installed" || install.status === "unavailable") {
    return null;
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (install.status === "can-install") void install.promptInstall();
          else setShowIosHelp((v) => !v);
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#0A0A0A] px-3.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#0A0A0A]/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/30"
      >
        <ArrowDownToLine size={13} strokeWidth={1.5} />
        <span>Install App</span>
      </button>

      {showIosHelp && install.status === "ios" && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#E5E5E5] bg-white p-4 text-left shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/50">
            Install on iOS
          </p>
          <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#0A0A0A]/80">
            <li className="flex items-start gap-2">
              <span className="font-mono text-[10px] text-[#0A0A0A]/40">01</span>
              <span className="flex items-center gap-1">
                Tap the <Share size={12} strokeWidth={1.5} className="inline" /> Share
                button in Safari
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-[10px] text-[#0A0A0A]/40">02</span>
              <span>Scroll down and choose “Add to Home Screen”</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-[10px] text-[#0A0A0A]/40">03</span>
              <span>Confirm with “Add” — Portraitify runs offline</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

"use client";

import { Github, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import InstallButton from "@/components/pwa/InstallButton";
import { usePortraitify } from "@/lib/store";

export default function Header() {
  const aboutOpen = usePortraitify((s) => s.aboutOpen);
  const setAboutOpen = usePortraitify((s) => s.setAboutOpen);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen, setAboutOpen]);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-[#FAFAFA]/90 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icons/icon-192x192.png"
            alt="Portraitify logo"
            width={22}
            height={22}
            className="rounded-[5px]"
            priority
          />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
            Portraitify
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.18em] text-[#0A0A0A]/35 sm:inline">
            ALGORITHMIC PROFILE ART
          </span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0A0A0A]/60 transition-colors duration-200 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]"
          >
            <Github size={16} strokeWidth={1.5} />
          </a>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="h-8 rounded-full px-3 text-[13px] text-[#0A0A0A]/70 transition-colors duration-200 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]"
          >
            About
          </button>
          <div className="mx-1 hidden h-4 w-px bg-[#E5E5E5] sm:block" />
          <InstallButton />
        </nav>
      </header>

      {aboutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setAboutOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="About Portraitify"
            className="w-full max-w-md rounded-xl border border-[#E5E5E5] bg-white p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45">
                About
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setAboutOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#0A0A0A]/50 transition-colors duration-200 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0A0A0A]">
              Photos in. Algorithms out.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#0A0A0A]/70">
              Portraitify re-carves any portrait into six generative styles —
              spiral hatching, Joy Division ridges, stipple dots, newspaper
              halftone, radial waveform and monospace type — and exports an
              Instagram-ready 1080×1080 PNG.
            </p>
            <div className="mt-5 space-y-2 border-t border-[#E5E5E5] pt-4">
              {[
                ["PRIVACY", "Every pixel is processed locally in your browser. Nothing is uploaded, ever."],
                ["OFFLINE", "A progressive web app — install it and create without a connection."],
                ["STACK", "Next.js · p5.js · Canvas 2D · Zustand · Tailwind"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] tracking-[0.18em] text-[#0A0A0A]/40">
                    {k}
                  </span>
                  <span className="text-xs leading-relaxed text-[#0A0A0A]/70">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

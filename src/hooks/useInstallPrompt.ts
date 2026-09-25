"use client";

import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type InstallState =
  | { status: "unavailable" }
  | { status: "can-install"; promptInstall: () => Promise<void> }
  | { status: "ios"; }
  | { status: "installed" };

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iDevice = /iphone|ipad|ipod/i.test(ua);
  const touchMac =
    navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1;
  return iDevice || touchMac;
}

function inStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Tracks PWA installability:
 *  - captures `beforeinstallprompt` (Chromium / Android)
 *  - detects iOS Safari (manual Add-to-Home-Screen flow)
 *  - hides entirely once installed or running standalone
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() =>
    typeof window === "undefined" ? false : inStandalone()
  );
  const [ios] = useState<boolean>(() => (typeof window === "undefined" ? false : isIos()));

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    const media = window.matchMedia("(display-mode: standalone)");
    const onMode = (e: MediaQueryListEvent) => {
      if (e.matches) setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    media.addEventListener("change", onMode);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      media.removeEventListener("change", onMode);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setDeferred(null);
  }, [deferred]);

  if (installed) return { status: "installed" } as const;
  if (deferred) return { status: "can-install", promptInstall } as const;
  if (ios) return { status: "ios" } as const;
  return { status: "unavailable" } as const;
}

"use client";

import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __pwaInstall?: { prompt: BeforeInstallPromptEvent | null };
  }
}

export type InstallState =
  | { status: "unavailable" }
  | { status: "can-install"; promptInstall: () => Promise<void> }
  | { status: "ios" }
  | { status: "installed" };

function isIos(): boolean {
  const ua = navigator.userAgent;
  const iDevice = /iphone|ipad|ipod/i.test(ua);
  const touchMac =
    navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1;
  return iDevice || touchMac;
}

function inStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Tracks PWA installability. The actual `beforeinstallprompt` event is
 * captured pre-hydration by an inline script (see layout.tsx) and stashed
 * on `window.__pwaInstall` — this hook simply observes that stash, so the
 * install button works regardless of when the event fired.
 *
 * All window access happens after mount: SSR and the first client render
 * both return "unavailable", keeping hydration identical.
 */
export function useInstallPrompt(): InstallState {
  const [mounted, setMounted] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);

  useEffect(() => {
    setIsIosDevice(isIos());
    setInstalled(inStandalone());
    setHasPrompt(!!window.__pwaInstall?.prompt);
    setMounted(true);

    const onAvailable = () => setHasPrompt(true);
    const onInstalled = () => {
      setInstalled(true);
      setHasPrompt(false);
    };
    // Fallback: if the inline capture script was bypassed, catch the
    // native event here too (and feed the stash so promptInstall works).
    const onNativePrompt = (e: Event) => {
      e.preventDefault();
      window.__pwaInstall = { prompt: e as BeforeInstallPromptEvent };
      setHasPrompt(true);
    };

    const media = window.matchMedia("(display-mode: standalone)");
    const onMode = (e: MediaQueryListEvent) => {
      if (e.matches) onInstalled();
    };

    window.addEventListener("pwa-install-available", onAvailable);
    window.addEventListener("pwa-installed", onInstalled);
    window.addEventListener("beforeinstallprompt", onNativePrompt);
    window.addEventListener("appinstalled", onInstalled);
    media.addEventListener("change", onMode);
    return () => {
      window.removeEventListener("pwa-install-available", onAvailable);
      window.removeEventListener("pwa-installed", onInstalled);
      window.removeEventListener("beforeinstallprompt", onNativePrompt);
      window.removeEventListener("appinstalled", onInstalled);
      media.removeEventListener("change", onMode);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const deferred = window.__pwaInstall?.prompt;
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      window.__pwaInstall = { prompt: null };
      setHasPrompt(false);
    }
  }, []);

  if (!mounted) return { status: "unavailable" };
  if (installed) return { status: "installed" };
  if (hasPrompt) return { status: "can-install", promptInstall };
  if (isIosDevice) return { status: "ios" };
  return { status: "unavailable" };
}

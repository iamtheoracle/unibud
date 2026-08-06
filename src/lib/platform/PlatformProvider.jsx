import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

/**
 * PlatformProvider — makes UNIBUD feel first-party on every platform.
 *
 * Detects the device, input modality, orientation and the OS accessibility
 * settings (reduced motion, high contrast, reduced transparency, color
 * scheme, dynamic type) and reflects them on <html> as classes + data
 * attributes. CSS then auto-adapts every workspace — no per-screen work.
 *
 * Exposes `usePlatform()` so components can branch on device/pointer when
 * they genuinely need to (e.g. a desktop dock vs. mobile tab bar).
 */

const PlatformContext = createContext(null);

const mq = (q) => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q) : null);
const mql = (q) => !!mq(q)?.matches;
const ls = (k) => {
  try { return localStorage.getItem(k); } catch { return null; }
};

function platform() {
  const u = (typeof navigator !== "undefined" ? navigator.userAgent || "" : "");
  if (/iPhone|iPad|iPod/i.test(u)) return "ios";
  if (/Android/i.test(u)) return "android";
  if (/Mac/i.test(u)) return "macos";
  if (/Win/i.test(u)) return "windows";
  if (/Linux/i.test(u)) return "linux";
  return "web";
}

function deviceType(w, h, pointer) {
  if (pointer === "fine" && w >= 1024) return "desktop";
  const max = Math.max(w, h);
  if (max >= 1024) return "tablet";
  return "phone";
}

function read() {
  const w = typeof window !== "undefined" ? window.innerWidth : 390;
  const h = typeof window !== "undefined" ? window.innerHeight : 844;
  const pointer = mql("(pointer: fine)") ? "fine" : "coarse";
  return {
    platform: platform(),
    device: deviceType(w, h, pointer),
    width: w,
    height: h,
    orientation: w >= h ? "landscape" : "portrait",
    pointer,
    coarsePointer: pointer === "coarse",
    finePointer: pointer === "fine",
    reduceMotion: mql("(prefers-reduced-motion: reduce)") || ls("ux_reduce_motion") === "1",
    highContrast: mql("(prefers-contrast: more)") || mql("(prefers-contrast: forced)"),
    reduceTransparency: mql("(prefers-reduced-transparency: reduce)"),
    dark: mql("(prefers-color-scheme: dark)"),
    largeText: ls("ux_large_text") === "1",
  };
}

export function PlatformProvider({ children }) {
  const [state, setState] = useState(read);

  // Reflect the current environment onto <html> as classes + data attrs.
  useEffect(() => {
    const el = document.documentElement;
    // Re-read user UX prefs fresh so toggles from elsewhere stay in sync.
    const reduceMotion = mql("(prefers-reduced-motion: reduce)") || ls("ux_reduce_motion") === "1";
    const largeText = ls("ux_large_text") === "1";
    el.classList.toggle("reduce-motion", reduceMotion);
    el.classList.toggle("ux-large-text", largeText);
    el.classList.toggle("high-contrast", !!state.highContrast);
    el.classList.toggle("reduce-transparency", !!state.reduceTransparency);
    el.dataset.platform = state.platform;
    el.dataset.device = state.device;
    el.dataset.pointer = state.pointer;
    el.dataset.orientation = state.orientation;
  }, [state]);

  // Listen to device + OS setting changes.
  useEffect(() => {
    const onChange = () => setState(read());
    const queries = [
      "(prefers-reduced-motion: reduce)",
      "(prefers-contrast: more)",
      "(prefers-contrast: forced)",
      "(prefers-reduced-transparency: reduce)",
      "(prefers-color-scheme: dark)",
      "(pointer: fine)",
      "(orientation: landscape)",
    ];
    const media = queries.map(mq).filter(Boolean);
    media.forEach((m) => m.addEventListener("change", onChange));
    window.addEventListener("resize", onChange, { passive: true });
    window.addEventListener("orientationchange", onChange, { passive: true });
    return () => {
      media.forEach((m) => m.removeEventListener("change", onChange));
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  const setUxPref = (key, val) => {
    try { localStorage.setItem(key, val ? "1" : "0"); } catch {}
    setState(read());
  };

  const value = useMemo(
    () => ({
      ...state,
      isPhone: state.device === "phone",
      isTablet: state.device === "tablet",
      isDesktop: state.device === "desktop",
      setReduceMotion: (v) => setUxPref("ux_reduce_motion", v),
      setLargeText: (v) => setUxPref("ux_large_text", v),
    }),
    [state]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export const usePlatform = () => useContext(PlatformContext);
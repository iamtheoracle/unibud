import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const WindowManagerContext = createContext(null);

const STORAGE_KEY = "unibud_desktop_windows";
const BASE_Z = 100;

function loadWindows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveWindows(windows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
  } catch {
    /* ignore */
  }
}

/**
 * WindowManagerProvider — manages floating desktop windows.
 * Each window: { id, module, title, x, y, width, height, isMinimized, isMaximized, zIndex }
 */
export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState(loadWindows);
  const [topZ, setTopZ] = useState(BASE_Z + 100);

  useEffect(() => {
    saveWindows(windows);
  }, [windows]);

  const openWindow = useCallback((module, title, opts = {}) => {
    const id = module + "_" + Date.now();
    setWindows((prev) => {
      // If a window for this module already exists, focus it
      const existing = prev.find((w) => w.module === module && !w.isMinimized);
      if (existing) {
        const newZ = topZ + 1;
        setTopZ(newZ);
        return prev.map((w) => (w.id === existing.id ? { ...w, zIndex: newZ, isMinimized: false } : w));
      }
      const newZ = topZ + 1;
      setTopZ(newZ);
      const count = prev.length;
      const offset = count * 28;
      return [
        ...prev,
        {
          id,
          module,
          title,
          x: opts.x ?? 120 + offset,
          y: opts.y ?? 80 + offset,
          width: opts.width ?? 640,
          height: opts.height ?? 480,
          isMinimized: false,
          isMaximized: opts.maximize ?? false,
          zIndex: newZ,
        },
      ];
    });
    return id;
  }, [topZ]);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id) => {
    setWindows((prev) => {
      const newZ = topZ + 1;
      setTopZ(newZ);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w));
    });
  }, [topZ]);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
  }, []);

  const toggleMaximize = useCallback((id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  }, []);

  const updateWindowPosition = useCallback((id, x, y) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const updateWindowSize = useCallback((id, width, height) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)));
  }, []);

  const updateWindow = useCallback((id, patch) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const value = {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    updateWindowPosition,
    updateWindowSize,
    updateWindow,
  };

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) return null;
  return ctx;
}
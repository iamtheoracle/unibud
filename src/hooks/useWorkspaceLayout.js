import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "unibud-workspace-layout";

const DEFAULT_LAYOUT = {
  viewMode: "comfortable", // "compact" | "comfortable" | "expanded"
  navPosition: "top", // "top" (future: "side", "bottom")
  hiddenModules: [], // module ids the user has hidden
  pinnedTools: [], // tool ids the user has pinned
  boardMode: "floating", // "bubble" | "floating" | "panel" | "fullscreen"
  boardLocked: false,
  boardSize: { w: 380, h: 520 },
  boardPos: { x: 40, y: 80 },
  customNav: [], // user-reordered nav items
  dashboardWidgets: [], // user-selected dashboard widgets
};

/**
 * useWorkspaceLayout — user customization hook.
 *
 * Lets users personalize their workspace:
 * - Resize panels (compact / comfortable / expanded)
 * - Move floating windows (position saved)
 * - Pin tools
 * - Hide modules
 * - Customize navigation order
 * - Save workspace layouts
 *
 * All preferences persist to localStorage.
 */
export function useWorkspaceLayout() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setLayout({ ...DEFAULT_LAYOUT, ...saved });
    } catch {}
  }, []);

  const update = useCallback((updates) => {
    setLayout((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setViewMode = useCallback((mode) => update({ viewMode: mode }), [update]);

  const toggleModule = useCallback((moduleId) => {
    setLayout((prev) => {
      const hidden = prev.hiddenModules.includes(moduleId)
        ? prev.hiddenModules.filter((id) => id !== moduleId)
        : [...prev.hiddenModules, moduleId];
      const next = { ...prev, hiddenModules: hidden };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const togglePin = useCallback((toolId) => {
    setLayout((prev) => {
      const pinned = prev.pinnedTools.includes(toolId)
        ? prev.pinnedTools.filter((id) => id !== toolId)
        : [...prev.pinnedTools, toolId];
      const next = { ...prev, pinnedTools: pinned };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reorderNav = useCallback((newOrder) => update({ customNav: newOrder }), [update]);

  const resetLayout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLayout(DEFAULT_LAYOUT);
  }, []);

  const isModuleHidden = useCallback((moduleId) => layout.hiddenModules.includes(moduleId), [layout.hiddenModules]);
  const isToolPinned = useCallback((toolId) => layout.pinnedTools.includes(toolId), [layout.pinnedTools]);

  return {
    layout,
    update,
    setViewMode,
    toggleModule,
    togglePin,
    reorderNav,
    resetLayout,
    isModuleHidden,
    isToolPinned,
  };
}
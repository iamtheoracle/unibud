import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AmbientModeContext = createContext(null);

/**
 * Ambient modes — each defines a mood that subtly shifts the environment.
 * Components consume the current mode to adapt their styling.
 */
export const AMBIENT_MODES = {
  default: {
    id: "default",
    label: "Default",
    glow: "hsl(0 0% 100% / 0.04)",
    accent: "hsl(0 0% 100%)",
    intensity: 0.5,
  },
  study: {
    id: "study",
    label: "Study Focus",
    glow: "hsl(217 91% 60% / 0.06)",
    accent: "hsl(217 91% 60%)",
    intensity: 0.3,
    dim: true,
  },
  music: {
    id: "music",
    label: "Music",
    glow: "hsl(142 71% 45% / 0.08)",
    accent: "hsl(142 71% 45%)",
    intensity: 0.8,
    pulse: true,
  },
  events: {
    id: "events",
    label: "Events",
    glow: "hsl(24 90% 55% / 0.08)",
    accent: "hsl(24 90% 55%)",
    intensity: 0.9,
    energetic: true,
  },
  night: {
    id: "night",
    label: "Night",
    glow: "hsl(280 65% 60% / 0.05)",
    accent: "hsl(280 65% 60%)",
    intensity: 0.2,
    cinematic: true,
  },
  ai: {
    id: "ai",
    label: "AI Mode",
    glow: "hsl(0 0% 100% / 0.03)",
    accent: "hsl(0 0% 100%)",
    intensity: 0.15,
    minimal: true,
  },
  community: {
    id: "community",
    label: "Community",
    glow: "hsl(251 90% 67% / 0.07)",
    accent: "hsl(251 90% 67%)",
    intensity: 0.7,
    vibrant: true,
  },
  immersive: {
    id: "immersive",
    label: "Immersive",
    glow: "hsl(0 0% 100% / 0.02)",
    accent: "hsl(0 0% 100%)",
    intensity: 0.1,
    dimBackground: true,
  },
};

/**
 * AmbientModeProvider — manages the ambient mood of the entire OS.
 * The mode subtly shifts background lighting and component behavior.
 */
export function AmbientModeProvider({ children }) {
  const [mode, setMode] = useState("default");
  const [autoMode, setAutoMode] = useState(true);

  // Auto-detect night mode based on time
  useEffect(() => {
    if (!autoMode) return;
    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 21 || hour < 6) {
        setMode((prev) => (prev === "default" ? "night" : prev));
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [autoMode]);

  // Apply ambient glow to body via CSS variable
  useEffect(() => {
    const config = AMBIENT_MODES[mode] || AMBIENT_MODES.default;
    document.documentElement.style.setProperty("--ambient-glow", config.glow);
    document.documentElement.style.setProperty("--ambient-intensity", String(config.intensity));
    document.documentElement.setAttribute("data-ambient", mode);
  }, [mode]);

  const setAmbientMode = useCallback((newMode) => {
    if (AMBIENT_MODES[newMode]) {
      setMode(newMode);
      setAutoMode(false);
    }
  }, []);

  const value = {
    mode,
    config: AMBIENT_MODES[mode] || AMBIENT_MODES.default,
    setMode: setAmbientMode,
    autoMode,
    setAutoMode,
  };

  return <AmbientModeContext.Provider value={value}>{children}</AmbientModeContext.Provider>;
}

export function useAmbientMode() {
  const ctx = useContext(AmbientModeContext);
  if (!ctx) return { mode: "default", config: AMBIENT_MODES.default, setMode: () => {}, autoMode: true, setAutoMode: () => {} };
  return ctx;
}
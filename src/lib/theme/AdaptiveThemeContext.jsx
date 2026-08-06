import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdaptiveThemeContext = createContext(null);

/**
 * Adaptive accent colors — automatically shift based on the current context.
 * Each context maps to a primary accent that subtly tints the UI.
 */
export const CONTEXT_THEMES = {
  default: {
    id: "default",
    primary: "0 0% 100%",
    accent: "0 0% 100%",
    glow: "hsl(0 0% 100% / 0.04)",
    label: "Default",
  },
  study: {
    id: "study",
    primary: "217 91% 60%",
    accent: "217 91% 60%",
    glow: "hsl(217 91% 60% / 0.06)",
    label: "Study",
  },
  events: {
    id: "events",
    primary: "24 90% 55%",
    accent: "24 90% 55%",
    glow: "hsl(24 90% 55% / 0.07)",
    label: "Events",
  },
  music: {
    id: "music",
    primary: "280 65% 60%",
    accent: "280 65% 60%",
    glow: "hsl(280 65% 60% / 0.06)",
    label: "Music",
  },
  sports: {
    id: "sports",
    primary: "142 71% 45%",
    accent: "142 71% 45%",
    glow: "hsl(142 71% 45% / 0.06)",
    label: "Sports",
  },
  marketplace: {
    id: "marketplace",
    primary: "46 74% 55%",
    accent: "46 74% 55%",
    glow: "hsl(46 74% 55% / 0.06)",
    label: "Marketplace",
  },
  career: {
    id: "career",
    primary: "251 90% 67%",
    accent: "251 90% 67%",
    glow: "hsl(251 90% 67% / 0.06)",
    label: "Career",
  },
  social: {
    id: "social",
    primary: "330 75% 55%",
    accent: "330 75% 55%",
    glow: "hsl(330 75% 55% / 0.06)",
    label: "Social",
  },
  finance: {
    id: "finance",
    primary: "160 70% 45%",
    accent: "160 70% 45%",
    glow: "hsl(160 70% 45% / 0.05)",
    label: "Finance",
  },
  live: {
    id: "live",
    primary: "0 84% 60%",
    accent: "0 84% 60%",
    glow: "hsl(0 84% 60% / 0.07)",
    label: "Live",
  },
};

/**
 * AdaptiveThemeProvider — manages context-aware accent colors.
 * Automatically shifts UI accent based on the current workspace/feature.
 */
export function AdaptiveThemeProvider({ children }) {
  const [context, setContext] = useState("default");
  const theme = CONTEXT_THEMES[context] || CONTEXT_THEMES.default;

  // Apply accent to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty("--adaptive-primary", theme.primary);
    document.documentElement.style.setProperty("--adaptive-accent", theme.accent);
    document.documentElement.style.setProperty("--adaptive-glow", theme.glow);
    document.documentElement.setAttribute("data-context", context);
  }, [context]);

  const setAdaptiveContext = useCallback((ctx) => {
    if (CONTEXT_THEMES[ctx]) setContext(ctx);
  }, []);

  return (
    <AdaptiveThemeContext.Provider value={{ context, theme, setContext: setAdaptiveContext }}>
      {children}
    </AdaptiveThemeContext.Provider>
  );
}

export function useAdaptiveTheme() {
  const ctx = useContext(AdaptiveThemeContext);
  if (!ctx) return { context: "default", theme: CONTEXT_THEMES.default, setContext: () => {} };
  return ctx;
}
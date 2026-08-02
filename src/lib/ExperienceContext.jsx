import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * ExperienceContext — the single Academic | Social context for UNIBUD.
 *
 * One product. The selected context changes *content* (feeds, widgets,
 * recommendations, emphasis) — never navigation. The bottom dock stays
 * Campus · Quad · Connect · Me in both modes.
 *
 * Persisted to localStorage so the choice survives sessions. Pure client
 * state — no new entity, no backend change, no removed capability.
 */
const Ctx = createContext(null);
const STORAGE_KEY = "unibud.experienceMode";
export const EXPERIENCE_MODES = ["academic", "social"];

export function useExperience() {
  const v = useContext(Ctx);
  return v || { mode: "academic", setMode: () => {}, modes: EXPERIENCE_MODES };
}

export function ExperienceProvider({ children }) {
  const [mode, setModeState] = useState("academic");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem(STORAGE_KEY);
      if (m && EXPERIENCE_MODES.includes(m)) setModeState(m);
    } catch {}
    setLoaded(true);
  }, []);

  const setMode = (m) => {
    if (!EXPERIENCE_MODES.includes(m)) return;
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  };

  useEffect(() => {
    if (loaded) {
      document.documentElement.setAttribute("data-exp", mode);
    }
  }, [mode, loaded]);

  return (
    <Ctx.Provider value={{ mode, setMode, modes: EXPERIENCE_MODES, loaded }}>
      {children}
    </Ctx.Provider>
  );
}
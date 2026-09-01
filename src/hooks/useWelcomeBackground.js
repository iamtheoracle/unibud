import { useState, useEffect } from "react";
import { WELCOME_BACKGROUNDS, regionForCountry } from "@/data/welcomeBackgrounds";

/**
 * Picks a single welcome background for the entire app session.
 *
 *  • The chosen background is cached in sessionStorage so it never changes
 *    while the user is using the app — only after a full close / reopen.
 *  • Recently shown backgrounds (tracked in localStorage) are avoided so the
 *    same image doesn't repeat back-to-back across sessions.
 *  • If the user has selected a country (persisted in localStorage from
 *    onboarding), backgrounds tagged with that region are prioritised.
 *  • The image is preloaded before reporting `loaded`, so there is no flash.
 */
const SESSION_KEY = "unibud_welcome_bg";
const RECENT_KEY = "unibud_welcome_recent";
const COUNTRY_KEY = "unibud_selected_country";
const RECENT_LIMIT = 4;

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function pickBackground(country) {
  const recent = readJSON(RECENT_KEY, []);
  const region = regionForCountry(country);

  // Prioritise country-specific backgrounds when available.
  let pool = region
    ? WELCOME_BACKGROUNDS.filter((b) => b.regions.includes(region))
    : [];

  // Fall back to the full global rotation.
  if (pool.length === 0) {
    pool = WELCOME_BACKGROUNDS.slice();
  }

  // Avoid recently shown, unless that would leave nothing.
  let fresh = pool.filter((b) => !recent.includes(b.id));
  if (fresh.length === 0) fresh = pool;

  const chosen = fresh[Math.floor(Math.random() * fresh.length)];

  // Update recent list (LRU of ids).
  const nextRecent = [chosen.id, ...recent.filter((id) => id !== chosen.id)].slice(0, RECENT_LIMIT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));
  } catch {
    /* storage may be unavailable */
  }

  return chosen;
}

function resolveBackground() {
  // Session cache — stable for the whole tab session.
  try {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const match = WELCOME_BACKGROUNDS.find((b) => b.id === parsed.id);
      if (match) return match;
    }
  } catch {
    /* ignore */
  }

  let country = null;
  try {
    country = localStorage.getItem(COUNTRY_KEY) || null;
  } catch {
    country = null;
  }

  const chosen = pickBackground(country);
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: chosen.id }));
  } catch {
    /* ignore */
  }
  return chosen;
}

export function useWelcomeBackground() {
  const [state, setState] = useState(() => ({
    background: resolveBackground(),
    loaded: false,
  }));

  useEffect(() => {
    const bg = state.background;
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active) setState((s) => ({ ...s, loaded: true }));
    };
    img.onerror = () => {
      // Still mark loaded so we don't block the UI on a failed image.
      if (active) setState((s) => ({ ...s, loaded: true }));
    };
    img.src = bg.url;
    return () => {
      active = false;
    };
  }, []);

  return {
    background: state.background,
    loaded: state.loaded,
    tone: state.background.tone,
  };
}
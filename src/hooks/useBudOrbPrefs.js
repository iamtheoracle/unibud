import { useState, useEffect, useCallback } from "react";

const KEY = "budOrbPrefs";
const DEFAULTS = {
  side: "right",        // "left" | "right"
  height: 144,          // bottom offset in px — clears the EcosystemRail
  autoHide: false,     // step aside when idle
  compact: false,      // smaller orb
  dockX: null,         // persisted drag position (absolute px)
  dockY: null,
};

/**
 * useBudOrbPrefs — persisted customization for the floating Bud orb.
 * Lives in localStorage so Bud feels personal across sessions.
 */
export function useBudOrbPrefs() {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const update = useCallback((patch) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULTS);
    try { localStorage.setItem(KEY, JSON.stringify(DEFAULTS)); } catch {}
  }, []);

  return { prefs, update, reset };
}
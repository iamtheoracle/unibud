import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "unibud_recent_views";
const MAX_ITEMS = 8;

/**
 * useRecentViews — tracks recently visited pages in localStorage.
 * Provides a list of recent views and a function to record new visits.
 * Powers "Continue where you left off" and "Recently viewed" surfaces.
 */
export function useRecentViews() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const record = useCallback((path, label, icon) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.path !== path);
      const next = [{ path, label, icon, ts: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecent([]);
  }, []);

  return { recent, record, clear };
}
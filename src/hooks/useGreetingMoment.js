import { useState, useEffect } from "react";

const KEY = "unibud.home.lastVisit";
// Show the full greeting again if it's been at least this long since the last visit.
const WELCOME_BACK_GAP_MS = 1000 * 60 * 60 * 4;

/**
 * useGreetingMoment — decides whether the Campus header should show the full
 * greeting or a compact, info-first header.
 *
 * The greeting only appears at meaningful moments:
 *   • First launch of the day
 *   • Returning after many hours
 *   (Birthday / semester start / graduation triggers can be added as profile
 *    data becomes available.)
 *
 * Otherwise Campus prioritizes useful information over a repeated greeting.
 * Last-visit time is tracked in localStorage, computed synchronously so
 * there's no greeting flash on repeat visits.
 */
export function useGreetingMoment() {
  const [state] = useState(() => {
    let last = null;
    try {
      last = JSON.parse(localStorage.getItem(KEY));
    } catch {
      last = null;
    }
    const now = Date.now();
    const todayStr = new Date().toDateString();
    if (!last || last.date !== todayStr) return { show: true, reason: "firstOfDay" };
    if (now - last.ts > WELCOME_BACK_GAP_MS) return { show: true, reason: "welcomeBack" };
    return { show: false, reason: null };
  });

  useEffect(() => {
    const now = Date.now();
    const todayStr = new Date().toDateString();
    try {
      localStorage.setItem(KEY, JSON.stringify({ ts: now, date: todayStr }));
    } catch {
      /* ignore */
    }
  }, []);

  return state;
}
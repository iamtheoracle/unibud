import { useRef, useCallback } from "react";

const STORAGE_KEY = "unibud_playback_progress";

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Remembers video playback position in localStorage.
 * Throttled to save every 5 seconds to avoid excessive writes.
 */
export function usePlaybackProgress(videoId) {
  const lastSaveRef = useRef(0);

  const getProgress = useCallback(() => {
    if (!videoId) return 0;
    const data = getAll();
    return data[videoId] || 0;
  }, [videoId]);

  const saveProgress = useCallback((currentTime) => {
    if (!videoId) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 5000) return;
    lastSaveRef.current = now;
    try {
      const data = getAll();
      data[videoId] = currentTime;
      const keys = Object.keys(data);
      if (keys.length > 100) {
        delete data[keys[0]];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [videoId]);

  const clearProgress = useCallback(() => {
    if (!videoId) return;
    try {
      const data = getAll();
      delete data[videoId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [videoId]);

  return { getProgress, saveProgress, clearProgress };
}
import { useState, useCallback } from "react";

const STORAGE_KEY = "unibud_seen_stories";

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Tracks which stories the current user has seen.
 * Stored locally for instant UI feedback; server-side StoryView for author analytics.
 */
export function useStorySeen() {
  const [seenMap, setSeenMap] = useState(() => getAll());

  const isSeen = useCallback((storyId) => !!seenMap[storyId], [seenMap]);

  const markSeen = useCallback((storyId) => {
    setSeenMap((prev) => {
      if (prev[storyId]) return prev;
      const next = { ...prev, [storyId]: Date.now() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { isSeen, markSeen, seenMap };
}
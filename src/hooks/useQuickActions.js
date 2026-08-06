import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "unibud_quick_actions_v1";

const DEFAULT_STATE = {
  usage: {},    // { actionId: count }
  pinned: [],   // [actionId, ...]
};

/**
 * useQuickActions — tracks which creation actions a student uses
 * most frequently, and which they've pinned. Returns actions sorted
 * by pinned-first, then usage-count-descending.
 *
 * No demo data — usage starts empty and grows from real interactions.
 */
export function useQuickActions(allActions) {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setState({
        usage: saved.usage || {},
        pinned: saved.pinned || [],
      });
    } catch {}
  }, []);

  const persist = useCallback((newState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  }, []);

  const trackUsage = useCallback((actionId) => {
    setState((prev) => {
      const newState = {
        usage: { ...prev.usage, [actionId]: (prev.usage[actionId] || 0) + 1 },
        pinned: prev.pinned,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {}
      return newState;
    });
  }, []);

  const togglePin = useCallback((actionId) => {
    setState((prev) => {
      const newState = {
        usage: prev.usage,
        pinned: prev.pinned.includes(actionId)
          ? prev.pinned.filter((id) => id !== actionId)
          : [...prev.pinned, actionId],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {}
      return newState;
    });
  }, []);

  // Sort: pinned first (in pin order), then by usage count desc, then default order
  const sorted = [...allActions].sort((a, b) => {
    const aPinned = state.pinned.includes(a.id);
    const bPinned = state.pinned.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    if (aPinned && bPinned) {
      return state.pinned.indexOf(a.id) - state.pinned.indexOf(b.id);
    }
    const aUsage = state.usage[a.id] || 0;
    const bUsage = state.usage[b.id] || 0;
    return bUsage - aUsage;
  });

  return { sorted, pinned: state.pinned, trackUsage, togglePin };
}
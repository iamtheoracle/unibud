import { useState, useEffect, useCallback, useMemo } from "react";
import { NEWS_SUBCATEGORIES } from "@/components/news/newsConstants";

const STORAGE_KEY = "news_preferences_v1";
const DEFAULT_STATE = {
  followed: ["campus", "education", "technology"],
  hidden: [],
  pinned: ["campus"],
  order: NEWS_SUBCATEGORIES.map((s) => s.id),
};

export function useNewsPreferences() {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setState({
        followed: saved.followed || DEFAULT_STATE.followed,
        hidden: saved.hidden || [],
        pinned: saved.pinned || DEFAULT_STATE.pinned,
        order: saved.order?.length ? saved.order : DEFAULT_STATE.order,
      });
    } catch {}
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggleFollow = useCallback((id) => {
    persist((prev) => ({
      ...prev,
      followed: prev.followed.includes(id)
        ? prev.followed.filter((x) => x !== id)
        : [...prev.followed, id],
    }));
  }, [persist]);

  const togglePin = useCallback((id) => {
    persist((prev) => ({
      ...prev,
      pinned: prev.pinned.includes(id)
        ? prev.pinned.filter((x) => x !== id)
        : [...prev.pinned, id],
    }));
  }, [persist]);

  const toggleHidden = useCallback((id) => {
    persist((prev) => ({
      ...prev,
      hidden: prev.hidden.includes(id)
        ? prev.hidden.filter((x) => x !== id)
        : [...prev.hidden, id],
    }));
  }, [persist]);

  const reorder = useCallback((fromId, toId) => {
    persist((prev) => {
      const order = [...prev.order];
      const fromIdx = order.indexOf(fromId);
      const toIdx = order.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, fromId);
      return { ...prev, order };
    });
  }, [persist]);

  const visibleSubcategories = useMemo(() => {
    return state.order
      .filter((id) => !state.hidden.includes(id))
      .map((id) => NEWS_SUBCATEGORIES.find((s) => s.id === id))
      .filter(Boolean)
      .sort((a, b) => {
        const aP = state.pinned.includes(a.id);
        const bP = state.pinned.includes(b.id);
        if (aP !== bP) return aP ? -1 : 1;
        const aF = state.followed.includes(a.id);
        const bF = state.followed.includes(b.id);
        if (aF !== bF) return aF ? -1 : 1;
        return 0;
      });
  }, [state.order, state.hidden, state.pinned, state.followed]);

  return {
    followed: state.followed,
    hidden: state.hidden,
    pinned: state.pinned,
    visibleSubcategories,
    toggleFollow,
    togglePin,
    toggleHidden,
    reorder,
  };
}
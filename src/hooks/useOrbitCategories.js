import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles, GraduationCap, School, Users, Heart, UserCheck,
  Calendar, ShoppingBag, Newspaper, Music, Trophy, Film,
  Gamepad2, Cpu, Briefcase, Shirt, Camera, HandHeart, Target,
} from "lucide-react";

const STORAGE_KEY = "orbit_categories_v1";

export const ORBIT_CATEGORIES = [
  { id: "foryou",       label: "For You",      icon: Sparkles },
  { id: "academic",     label: "Academic",     icon: GraduationCap },
  { id: "campus",       label: "Campus",       icon: School },
  { id: "communities",  label: "Communities",  icon: Users },
  { id: "following",    label: "Following",   icon: Heart },
  { id: "friends",      label: "Friends",      icon: UserCheck },
  { id: "events",       label: "Events",       icon: Calendar },
  { id: "marketplace",  label: "Marketplace",  icon: ShoppingBag },
  { id: "news",         label: "News",         icon: Newspaper },
  { id: "music",        label: "Music",        icon: Music },
  { id: "sports",       label: "Sports",       icon: Trophy },
  { id: "movies_tv",    label: "Movies & TV",  icon: Film },
  { id: "gaming",       label: "Gaming",       icon: Gamepad2 },
  { id: "technology",   label: "Technology",   icon: Cpu },
  { id: "business",     label: "Business",     icon: Briefcase },
  { id: "fashion",      label: "Fashion",      icon: Shirt },
  { id: "photography",  label: "Photography",  icon: Camera },
  { id: "faith",        label: "Faith",        icon: HandHeart },
  { id: "challenges",   label: "Challenges",   icon: Target },
];

const DEFAULT_ORDER = ORBIT_CATEGORIES.map((c) => c.id);
const DEFAULT_STATE = {
  order: DEFAULT_ORDER,
  hidden: [],
  favorites: ["foryou"],
  visitCounts: {},
};

/**
 * useOrbitCategories — personalization for the Orbit category bar.
 * Remembers: preferred order, hidden categories, favourites, most visited.
 * All persisted to localStorage. No demo data.
 */
export function useOrbitCategories() {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setState({
        order: saved.order?.length ? saved.order : DEFAULT_ORDER,
        hidden: saved.hidden || [],
        favorites: saved.favorites || ["foryou"],
        visitCounts: saved.visitCounts || {},
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

  const trackVisit = useCallback((catId) => {
    persist((prev) => ({
      ...prev,
      visitCounts: { ...prev.visitCounts, [catId]: (prev.visitCounts[catId] || 0) + 1 },
    }));
  }, [persist]);

  const toggleHidden = useCallback((catId) => {
    persist((prev) => ({
      ...prev,
      hidden: prev.hidden.includes(catId)
        ? prev.hidden.filter((id) => id !== catId)
        : [...prev.hidden, catId],
    }));
  }, [persist]);

  const toggleFavorite = useCallback((catId) => {
    persist((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(catId)
        ? prev.favorites.filter((id) => id !== catId)
        : [...prev.favorites, catId],
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

  const reset = useCallback(() => { persist(DEFAULT_STATE); }, [persist]);

  const visibleCategories = useMemo(() => {
    return state.order
      .filter((id) => !state.hidden.includes(id))
      .map((id) => ORBIT_CATEGORIES.find((c) => c.id === id))
      .filter(Boolean);
  }, [state.order, state.hidden]);

  return {
    visibleCategories,
    hidden: state.hidden,
    favorites: state.favorites,
    visitCounts: state.visitCounts,
    trackVisit,
    toggleHidden,
    toggleFavorite,
    reorder,
    reset,
  };
}
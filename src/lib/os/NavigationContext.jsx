import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getPrimaryTabs, getDestinationByRoute } from "@/lib/navigation/registry";

const NavigationContext = createContext(null);
const STORAGE_KEY = "unibud:nav-active-tab";

/**
 * UNIBUD Navigation OS v5 — Single unified navigation model.
 *
 * Five primary destinations: Square · Quad · Connect · Me
 * (Bud lives inside Me as Bud Home, never as a nav tab.)
 *
 * The old two-world model (social/academics) is retired.
 * Context (academic/social/hybrid) still affects module priority
 * but no longer changes which tabs are visible.
 */

/** The four visible tabs (Bud is not a tab). */
export const PRIMARY_TABS = getPrimaryTabs();

/** Default home for new / unauthenticated users. */
export const DEFAULT_HOME = "/square";

/**
 * @deprecated Use PRIMARY_TABS directly.
 * Kept for any code that still references WORLDS to ease the migration.
 */
export const WORLDS = {
  social: {
    id: "social",
    label: "Social",
    home: "/square",
    tabs: PRIMARY_TABS,
  },
  academics: {
    id: "academics",
    label: "Academics",
    home: "/quad",
    tabs: PRIMARY_TABS,
  },
};

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Active destination ID, persisted across sessions
  const [activeDestId, setActiveDestId] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && PRIMARY_TABS.some((t) => t.id === stored)) return stored;
    }
    return "square";
  });

  // Keep activeDestId in sync when the user navigates via URL / back button
  useEffect(() => {
    const dest = getDestinationByRoute(location.pathname);
    if (dest && dest.id !== activeDestId) {
      setActiveDestId(dest.id);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, activeDestId);
    }
  }, [activeDestId]);

  /** Navigate to a destination by ID. */
  const navigateTo = useCallback((destId) => {
    const tab = PRIMARY_TABS.find((t) => t.id === destId);
    if (!tab) return;
    setActiveDestId(destId);
    navigate(tab.to);
  }, [navigate]);

  /**
   * @deprecated Use navigateTo(destId) instead.
   * Shim for legacy code that calls switchWorld("social" | "academics").
   */
  const switchWorld = useCallback((worldId) => {
    if (worldId === "academics") {
      navigateTo("quad");
    } else {
      navigateTo("square");
    }
  }, [navigateTo]);

  const value = {
    // New API
    tabs: PRIMARY_TABS,
    activeDestId,
    activeDest: PRIMARY_TABS.find((t) => t.id === activeDestId) || PRIMARY_TABS[0],
    navigateTo,

    // Legacy compat
    worldId: activeDestId === "quad" ? "academics" : "social",
    world: WORLDS[activeDestId === "quad" ? "academics" : "social"],
    isSocial: activeDestId !== "quad",
    isAcademics: activeDestId === "quad",
    switchWorld,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
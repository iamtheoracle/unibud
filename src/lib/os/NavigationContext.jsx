import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NavigationContext = createContext(null);
const STORAGE_KEY = "unibud:nav-world";

/**
 * The two operating worlds of UNIBUD OS.
 *
 * Each world has its own bottom navigation, home route, and module context.
 * Me is permanently fixed in both worlds (always bottom-right).
 * Connect exists in both worlds — its content adapts.
 * Bud is global and never appears in navigation.
 */
export const WORLDS = {
  social: {
    id: "social",
    label: "Social",
    home: "/square",
    tabs: [
      { id: "square", label: "Square", to: "/square", icon: "LayoutGrid" },
      { id: "discover", label: "Discover", to: "/discover", icon: "Compass" },
      { id: "connect", label: "Connect", to: "/connect", icon: "MessageCircle" },
      { id: "me", label: "Me", to: "/me", icon: "User" },
    ],
  },
  academics: {
    id: "academics",
    label: "Academics",
    home: "/campus",
    tabs: [
      { id: "campus", label: "Campus", to: "/campus", icon: "GraduationCap" },
      { id: "quad", label: "Quad", to: "/quad", icon: "Grid3x3" },
      { id: "connect", label: "Connect", to: "/connect", icon: "MessageCircle" },
      { id: "me", label: "Me", to: "/me", icon: "User" },
    ],
  },
};

export function NavigationProvider({ children }) {
  const navigate = useNavigate();

  const [worldId, setWorldId] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && WORLDS[stored]) return stored;
    }
    return "social";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, worldId);
    }
  }, [worldId]);

  const switchWorld = useCallback((newWorldId) => {
    if (!WORLDS[newWorldId] || newWorldId === worldId) return;
    setWorldId(newWorldId);
    navigate(WORLDS[newWorldId].home);
  }, [worldId, navigate]);

  const world = WORLDS[worldId];

  const value = {
    worldId,
    world,
    tabs: world.tabs,
    isSocial: worldId === "social",
    isAcademics: worldId === "academics",
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
/**
 * UNIBUD Navigation OS — Navigation Analytics React Provider
 *
 * Wraps the app to automatically track route changes.
 * Pure analytics functions live in navigationAnalyticsStore.js.
 */

import React, { createContext, useContext, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getDestinationByRoute } from "@/lib/navigation/registry";
import {
  recordRouteVisit,
  recordTabDuration,
  recordTabVisit,
  recordCommandBarOpen,
  recordDeepLinkOpen,
  recordBackNavigation,
  getAnalyticsData,
  getNavEvents,
} from "@/lib/navigation/navigationAnalyticsStore";

const NavAnalyticsContext = createContext(null);

export function NavigationAnalyticsProvider({ children }) {
  const location = useLocation();
  const enterTimeRef = useRef(Date.now());
  const prevPathRef = useRef(null);
  const prevDestRef = useRef(null);

  useEffect(() => {
    const dest = getDestinationByRoute(location.pathname);
    const destId = dest?.id;

    if (prevDestRef.current && prevPathRef.current) {
      const durationMs = Date.now() - enterTimeRef.current;
      recordTabDuration(prevDestRef.current, durationMs);
    }

    if (destId) {
      recordRouteVisit(destId, location.pathname);
    }

    enterTimeRef.current = Date.now();
    prevPathRef.current = location.pathname;
    prevDestRef.current = destId;
  }, [location.pathname]);

  const value = {
    recordTabVisit,
    recordCommandBarOpen,
    recordDeepLinkOpen,
    recordBackNavigation,
    getAnalyticsData,
    getNavEvents,
  };

  return (
    <NavAnalyticsContext.Provider value={value}>
      {children}
    </NavAnalyticsContext.Provider>
  );
}

export function useNavigationAnalytics() {
  const ctx = useContext(NavAnalyticsContext);
  if (!ctx) {
    return {
      recordTabVisit: () => {},
      recordCommandBarOpen: () => {},
      recordDeepLinkOpen: () => {},
      recordBackNavigation: () => {},
      getAnalyticsData: () => ({}),
      getNavEvents: () => [],
    };
  }
  return ctx;
}

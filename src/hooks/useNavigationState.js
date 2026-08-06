/**
 * useNavigationState — React hook for the Navigation State Manager
 *
 * Tracks route changes, records them per-destination, and provides
 * per-tab back navigation independent of the browser's history.
 *
 * Usage:
 *   const { goBack } = useNavigationState();
 */

import { useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  recordNavigation,
  recordScrollPosition,
  popBackStack,
} from "@/lib/navigation/navigationStateManager";
import { getDestinationByRoute } from "@/lib/navigation/registry";

const SCROLL_DEBOUNCE_MS = 300;

/**
 * @returns {{
 *   goBack: (destinationId: string) => void
 * }}
 */
export function useNavigationState() {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollTimerRef = useRef(null);

  // Record every route change
  useEffect(() => {
    const dest = getDestinationByRoute(location.pathname);
    if (!dest) return;
    recordNavigation(dest.id, location.pathname, 0);
  }, [location.pathname]);

  // Debounced scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const dest = getDestinationByRoute(location.pathname);
        if (dest) {
          recordScrollPosition(dest.id, window.scrollY);
        }
      }, SCROLL_DEBOUNCE_MS);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [location.pathname]);

  /**
   * Go back within a destination's own back stack.
   * Falls back to browser history if the stack is empty.
   *
   * @param {string} destinationId
   */
  const goBack = useCallback(
    (destinationId) => {
      const target = popBackStack(destinationId);
      if (target) {
        navigate(target);
      } else {
        navigate(-1);
      }
    },
    [navigate]
  );

  return { goBack };
}

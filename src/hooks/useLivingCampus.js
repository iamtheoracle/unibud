import { useEffect, useRef } from "react";
import { runLivingCampusCycle } from "@/lib/livingcampus/engine";

const CYCLE_INTERVAL = 3 * 60 * 1000; // 3 minutes
const INITIAL_DELAY = 15 * 1000; // 15 seconds — wait for page to settle

/**
 * useLivingCampus — React hook that continuously runs the Living Campus Engine.
 *
 * - Initial cycle runs after a 15-second delay (avoids slowing page load)
 * - Subsequent cycles run every 3 minutes
 * - Each cycle generates 0-3 pieces of new activity + organic engagement
 * - Activity is time-aware (morning/afternoon/evening/night/weekend)
 * - Respects user's automation preferences (can be disabled in settings)
 *
 * Integrated in AppShell so it runs globally across all authenticated screens.
 */
export function useLivingCampus() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Initial cycle after a short delay
    const initialTimer = setTimeout(() => {
      runLivingCampusCycle().catch(() => {});
    }, INITIAL_DELAY);

    // Periodic cycles
    const interval = setInterval(() => {
      runLivingCampusCycle().catch(() => {});
    }, CYCLE_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      mounted.current = false;
    };
  }, []);
}
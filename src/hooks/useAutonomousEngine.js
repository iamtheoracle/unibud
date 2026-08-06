import { useState, useEffect, useRef, useCallback } from "react";
import { runAutonomousChecks, createNotificationsForInsights } from "@/lib/autonomous/engine";
import { loadPreferences } from "@/lib/autonomous/preferences";

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * useAutonomousEngine — React hook that runs the autonomous intelligence engine.
 *
 * - Runs periodic checks (every 5 minutes when the app is open)
 * - Generates proactive insights from academic, campus, wellness, and safety data
 * - Creates notifications for new critical/high-severity insights
 * - Provides insights to the UI for optional display
 *
 * Integrated in AppShell so it runs globally across all authenticated screens.
 */
export function useAutonomousEngine() {
  const [insights, setInsights] = useState([]);
  const [running, setRunning] = useState(false);
  const [preferences, setPreferences] = useState(loadPreferences());
  const seenIds = useRef(new Set());

  const runChecks = useCallback(async () => {
    setRunning(true);
    try {
      const results = await runAutonomousChecks();
      // Create notifications for new critical/high insights
      await createNotificationsForInsights(results, seenIds.current);
      // Update seen set
      seenIds.current = new Set(results.map((i) => i.id));
      setInsights(results);
    } catch {
      // Silent — engine errors should never disrupt the user
    } finally {
      setRunning(false);
    }
  }, []);

  // Run on mount + periodic refresh
  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [runChecks]);

  // Re-run when preferences change (e.g., user enables a new automation)
  const refreshPreferences = useCallback(() => {
    setPreferences(loadPreferences());
    runChecks();
  }, [runChecks]);

  return {
    insights,
    running,
    preferences,
    runChecks,
    refreshPreferences,
  };
}
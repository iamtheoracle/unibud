import { useState, useEffect, useRef, useCallback } from "react";
import { runSelfHealingScan } from "@/lib/selfhealing/detectionEngine";
import { repairAllIssues } from "@/lib/selfhealing/repairEngine";
import { getIssueType } from "@/lib/selfhealing/issueRegistry";

const SCAN_INTERVAL = 3 * 60 * 1000; // 3 minutes
const MAX_ISSUES_IN_MEMORY = 100;

/**
 * useSelfHealingEngine — React hook that continuously runs the self-healing
 * detection engine, automatically repairs recoverable issues, and tracks
 * platform health.
 *
 * Integrated in AppShell so it runs globally across all authenticated screens.
 */
export function useSelfHealingEngine() {
  const [issues, setIssues] = useState([]);
  const [health, setHealth] = useState({ score: 100, status: "healthy" });
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [repairLog, setRepairLog] = useState([]);
  const seenIds = useRef(new Set());

  const computeHealth = useCallback((detectedIssues) => {
    if (detectedIssues.length === 0) {
      return { score: 100, status: "healthy" };
    }
    const critical = detectedIssues.filter((i) => i.severity === "critical").length;
    const high = detectedIssues.filter((i) => i.severity === "high").length;
    const medium = detectedIssues.filter((i) => i.severity === "medium").length;
    const low = detectedIssues.filter((i) => i.severity === "low").length;

    const score = Math.max(0, 100 - critical * 25 - high * 10 - medium * 5 - low * 1);
    const status = score >= 90 ? "healthy" : score >= 70 ? "degraded" : score >= 40 ? "warning" : "critical";
    return { score, status, counts: { critical, high, medium, low } };
  }, []);

  const runScan = useCallback(async () => {
    setScanning(true);
    try {
      const detected = await runSelfHealingScan();

      // Track new issues for repair
      const newIssues = detected.filter((i) => !seenIds.current.has(i.id));
      seenIds.current = new Set(detected.map((i) => i.id));

      // Auto-repair new repairable issues
      if (newIssues.length > 0) {
        const repairs = await repairAllIssues(newIssues);
        if (repairs.length > 0) {
          setRepairLog((prev) => [...repairs, ...prev].slice(0, MAX_ISSUES_IN_MEMORY));
          // Re-scan to see if repairs resolved issues
          const reDetected = await runSelfHealingScan();
          setIssues(reDetected.slice(0, MAX_ISSUES_IN_MEMORY));
          setHealth(computeHealth(reDetected));
        } else {
          setIssues(detected.slice(0, MAX_ISSUES_IN_MEMORY));
          setHealth(computeHealth(detected));
        }
      } else {
        setIssues(detected.slice(0, MAX_ISSUES_IN_MEMORY));
        setHealth(computeHealth(detected));
      }

      setLastScan(new Date().toISOString());
    } catch {
      // Silent — self-healing errors should never disrupt users
    } finally {
      setScanning(false);
    }
  }, [computeHealth]);

  // Run on mount + periodic scan
  useEffect(() => {
    // Track session start time for long-session detection
    if (typeof window !== "undefined" && !window.__bud_open_since) {
      window.__bud_open_since = Date.now();
    }

    // Expose query client for cache invalidation in repair engine
    if (typeof window !== "undefined") {
      import("@/lib/query-client").then((mod) => {
        window.__bud_query_client = mod.queryClientInstance;
      }).catch(() => {});
    }

    runScan();
    const interval = setInterval(runScan, SCAN_INTERVAL);
    return () => clearInterval(interval);
  }, [runScan]);

  // Listen for online/offline events to trigger immediate scan
  useEffect(() => {
    const handleOnline = () => runScan();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [runScan]);

  return {
    issues,
    health,
    scanning,
    lastScan,
    repairLog,
    runScan,
  };
}
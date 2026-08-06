import React from "react";
import SelfHealingDashboard from "@/components/selfhealing/SelfHealingDashboard";
import { useSelfHealingEngine } from "@/hooks/useSelfHealingEngine";

/**
 * SelfHealing — admin page wrapping the self-healing dashboard.
 * Shows live platform health, detected issues, repair log, and metrics.
 *
 * Route: /self-healing (protected — admin only via OracleWorkspaceGuard)
 */
export default function SelfHealing() {
  const { issues, health, scanning, lastScan, repairLog, runScan } = useSelfHealingEngine();

  return (
    <SelfHealingDashboard
      issues={issues}
      health={health}
      scanning={scanning}
      lastScan={lastScan}
      repairLog={repairLog}
      onRefresh={runScan}
    />
  );
}
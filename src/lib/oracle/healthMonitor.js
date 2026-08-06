/**
 * Platform Health Monitor
 *
 * Oracle continuously monitors all platform services, detects issues early,
 * and generates corrective action recommendations. This module defines
 * the service registry, health check logic, and issue detection rules.
 */

import { PLATFORM_SERVICES } from "./orchestrationEngine";

// ─── Health Status ───────────────────────────────────────────────────────
export const HEALTH_STATUS = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  CRITICAL: "critical",
  UNKNOWN: "unknown",
};

// ─── Health Check Definitions ─────────────────────────────────────────────
// Each check defines what entity/data to examine and what constitutes an issue.
export const HEALTH_CHECKS = [
  {
    id: "crash_volume",
    service: "api",
    label: "Crash Report Volume",
    description: "Monitors crash reports for spikes indicating system instability",
    severity: "critical",
    check: (crashReports) => {
      const recent = crashReports.filter(r => {
        const age = Date.now() - new Date(r.created_date).getTime();
        return age < 3600000; // last hour
      });
      if (recent.length > 20) return { status: HEALTH_STATUS.CRITICAL, value: recent.length, message: `${recent.length} crashes in the last hour` };
      if (recent.length > 5) return { status: HEALTH_STATUS.DEGRADED, value: recent.length, message: `${recent.length} crashes in the last hour` };
      return { status: HEALTH_STATUS.HEALTHY, value: recent.length, message: "No crash spikes" };
    },
  },
  {
    id: "security_events",
    service: "auth",
    label: "Security Events",
    description: "Tracks security-related events for anomalies",
    severity: "critical",
    check: (securityEvents) => {
      const critical = securityEvents.filter(e => e.severity === "critical");
      if (critical.length > 0) return { status: HEALTH_STATUS.CRITICAL, value: critical.length, message: `${critical.length} critical security events` };
      return { status: HEALTH_STATUS.HEALTHY, value: 0, message: "No critical security events" };
    },
  },
  {
    id: "ai_service_errors",
    service: "ai",
    label: "AI Service Health",
    description: "Monitors AI service metrics for failures or degradation",
    severity: "high",
    check: (aiMetrics) => {
      const errors = aiMetrics.filter(m => m.status === "error");
      if (errors.length > 10) return { status: HEALTH_STATUS.CRITICAL, value: errors.length, message: `${errors.length} AI service errors` };
      if (errors.length > 3) return { status: HEALTH_STATUS.DEGRADED, value: errors.length, message: `${errors.length} AI service errors` };
      return { status: HEALTH_STATUS.HEALTHY, value: 0, message: "AI services operating normally" };
    },
  },
  {
    id: "provider_health",
    service: "banking",
    label: "Provider Connectivity",
    description: "Checks external provider connections",
    severity: "high",
    check: (providerLogs) => {
      const failures = providerLogs.filter(l => l.status === "error");
      if (failures.length > 15) return { status: HEALTH_STATUS.CRITICAL, value: failures.length, message: `${failures.length} provider failures` };
      if (failures.length > 5) return { status: HEALTH_STATUS.DEGRADED, value: failures.length, message: `${failures.length} provider failures` };
      return { status: HEALTH_STATUS.HEALTHY, value: 0, message: "All providers reachable" };
    },
  },
  {
    id: "automation_failures",
    service: "notifications",
    label: "Automation Health",
    description: "Monitors automation run success rates",
    severity: "medium",
    check: (automationRuns) => {
      const failed = automationRuns.filter(r => r.status === "failed");
      const total = automationRuns.length;
      const rate = total > 0 ? (failed.length / total) * 100 : 0;
      if (rate > 30) return { status: HEALTH_STATUS.CRITICAL, value: `${rate.toFixed(0)}%`, message: `${rate.toFixed(0)}% automation failure rate` };
      if (rate > 10) return { status: HEALTH_STATUS.DEGRADED, value: `${rate.toFixed(0)}%`, message: `${rate.toFixed(0)}% automation failure rate` };
      return { status: HEALTH_STATUS.HEALTHY, value: `${rate.toFixed(0)}%`, message: "Automations running normally" };
    },
  },
];

/**
 * Run all health checks against fetched data.
 * Returns a structured health report.
 */
export function runHealthChecks(data) {
  const results = HEALTH_CHECKS.map(check => {
    const checkData = data[check.id] || [];
    const result = check.check(checkData);
    return {
      id: check.id,
      service: check.service,
      label: check.label,
      description: check.description,
      severity: check.severity,
      ...result,
    };
  });

  const services = PLATFORM_SERVICES.map(service => {
    const serviceChecks = results.filter(r => r.service === service.id);
    const hasCritical = serviceChecks.some(r => r.status === HEALTH_STATUS.CRITICAL);
    const hasDegraded = serviceChecks.some(r => r.status === HEALTH_STATUS.DEGRADED);
    const status = hasCritical ? HEALTH_STATUS.CRITICAL : hasDegraded ? HEALTH_STATUS.DEGRADED : HEALTH_STATUS.HEALTHY;
    return { ...service, status, checks: serviceChecks };
  });

  const overallStatus = services.some(s => s.status === HEALTH_STATUS.CRITICAL)
    ? HEALTH_STATUS.CRITICAL
    : services.some(s => s.status === HEALTH_STATUS.DEGRADED)
    ? HEALTH_STATUS.DEGRADED
    : HEALTH_STATUS.HEALTHY;

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    services,
    checks: results,
    criticalCount: results.filter(r => r.status === HEALTH_STATUS.CRITICAL).length,
    degradedCount: results.filter(r => r.status === HEALTH_STATUS.DEGRADED).length,
    healthyCount: results.filter(r => r.status === HEALTH_STATUS.HEALTHY).length,
  };
}
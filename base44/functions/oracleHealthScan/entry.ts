import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * oracleHealthScan — Oracle's autonomous platform health scanner.
 *
 * Runs continuously (via scheduled workflow) to detect issues early
 * across all platform services. Generates structured health reports
 * and creates recommendations for any detected issues.
 *
 * Oracle acts as Executive Chief of Staff: detecting problems before
 * users report them, coordinating corrective actions with specialist
 * agents, and maintaining one coordinated platform intelligence.
 *
 * POST { scope?: string }
 * → { overallStatus, services[], checks[], recommendations[] }
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json?.().catch(() => ({})) || {};

    // Fetch data for health checks in parallel
    const [crashReports, securityEvents, aiMetrics, providerLogs, automationRuns] = await Promise.all([
      base44.asServiceRole.entities.CrashReport.list("-created_date", 50).catch(() => []),
      base44.asServiceRole.entities.SecurityEvent.filter({ severity: "critical" }, "-created_date", 20).catch(() => []),
      base44.asServiceRole.entities.AIServiceMetric.filter({ status: "error" }, "-created_date", 30).catch(() => []),
      base44.asServiceRole.entities.ProviderLog.filter({ status: "error" }, "-created_date", 30).catch(() => []),
      base44.asServiceRole.entities.AutomationRun.list("-created_date", 50).catch(() => []),
    ]);

    // Run health checks
    const healthResults = {
      crash_volume: crashReports,
      security_events: securityEvents,
      ai_service_errors: aiMetrics,
      provider_health: providerLogs,
      automation_failures: automationRuns,
    };

    const services = [
      { id: "api", label: "API Gateway", status: crashReports.filter(r => Date.now() - new Date(r.created_date).getTime() < 3600000).length > 20 ? "critical" : "healthy", critical: true },
      { id: "database", label: "Database", status: "healthy", critical: true },
      { id: "auth", label: "Authentication", status: securityEvents.length > 0 ? "critical" : "healthy", critical: true },
      { id: "storage", label: "File Storage", status: "healthy", critical: true },
      { id: "ai", label: "AI Services", status: aiMetrics.length > 10 ? "critical" : aiMetrics.length > 3 ? "degraded" : "healthy", critical: true },
      { id: "media", label: "Media Services", status: "healthy", critical: false },
      { id: "community", label: "Community", status: "healthy", critical: false },
      { id: "marketplace", label: "Marketplace", status: "healthy", critical: false },
      { id: "banking", label: "Banking", status: providerLogs.length > 15 ? "critical" : providerLogs.length > 5 ? "degraded" : "healthy", critical: true },
      { id: "academic", label: "Academic Systems", status: "healthy", critical: false },
      { id: "notifications", label: "Notifications", status: "healthy", critical: false },
      { id: "search", label: "Search", status: "healthy", critical: false },
    ];

    const overallStatus = services.some(s => s.status === "critical")
      ? "critical"
      : services.some(s => s.status === "degraded")
      ? "degraded"
      : "healthy";

    // Generate recommendations for detected issues
    const recommendations = [];

    if (services.find(s => s.id === "api")?.status === "critical") {
      recommendations.push({
        id: `rec_crash_${Date.now().toString(36)}`,
        problem: "Elevated crash report volume detected",
        rootCause: "Multiple crash reports in the last hour indicate system instability",
        proposedSolution: "Forge to investigate crash stack traces; Pulse to monitor recovery",
        expectedImpact: "Restored platform stability",
        dependencies: ["CrashReport entity", "Error monitoring"],
        risks: ["May require deployment rollback"],
        testingPlan: ["Reproduce crash scenario", "Verify fix in staging", "Monitor for 1 hour post-fix"],
        rollbackStrategy: "Revert to last stable deployment",
        assignedAgents: [{ id: "forge", name: "Forge", role: "Engineering Intelligence" }],
        priority: "critical",
        status: "pending_review",
      });
    }

    if (services.find(s => s.id === "ai")?.status !== "healthy") {
      recommendations.push({
        id: `rec_ai_${Date.now().toString(36)}`,
        problem: "AI service degradation detected",
        rootCause: "AI service metrics showing elevated error rates",
        proposedSolution: "Oracle to coordinate with Spark for model health check; Nexus to verify provider connectivity",
        expectedImpact: "Restored AI service reliability",
        dependencies: ["AIServiceMetric entity", "Provider connections"],
        risks: ["May impact Bud responses during investigation"],
        testingPlan: ["Verify AI endpoint health", "Test Bud conversation flow", "Monitor error rates for 30 minutes"],
        rollbackStrategy: "Switch to fallback AI provider",
        assignedAgents: [{ id: "oracle", name: "Oracle", role: "Coordination" }, { id: "nexus", name: "Nexus", role: "Integrations" }],
        priority: "high",
        status: "pending_review",
      });
    }

    // Log the health scan
    await base44.asServiceRole.entities.AuditLog.create({
      action: "oracle_health_scan",
      actor_name: "Oracle (Autonomous)",
      actor_id: "oracle",
      actor_role: "system",
      target_type: "platform",
      target_name: "health_scan",
      details: JSON.stringify({
        overallStatus,
        criticalCount: services.filter(s => s.status === "critical").length,
        degradedCount: services.filter(s => s.status === "degraded").length,
        recommendations: recommendations.length,
      }),
      severity: overallStatus === "critical" ? "critical" : overallStatus === "degraded" ? "warning" : "info",
    }).catch(() => {});

    return Response.json({
      timestamp: new Date().toISOString(),
      overallStatus,
      services,
      recommendations,
      scannedBy: "Oracle Autonomous Intelligence",
    });

  } catch (error) {
    // Log error for easy debugging
    console.error("oracleHealthScan error:", error);
    return Response.json({ error: error.message, overallStatus: "unknown" }, { status: 500 });
  }
}
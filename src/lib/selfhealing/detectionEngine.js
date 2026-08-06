import { base44 } from "@/api/base44Client";
import { getIssueType, severityRank } from "./issueRegistry";

/**
 * Self-Healing Detection Engine
 *
 * Continuously scans the platform for issues across UI, API, data, performance,
 * security, and infrastructure. Returns a prioritized list of detected issues.
 *
 * Each detection function is independent and fault-tolerant — one failing check
 * never blocks others.
 */

const SCAN_BATCH_SIZE = 20;
const SLOW_PAGE_THRESHOLD_MS = 3000;

/**
 * Main entry point — runs all detection scans in parallel.
 * @returns {Promise<Array>} Detected issues sorted by severity
 */
export async function runSelfHealingScan() {
  const scans = [
    scanApiHealth,
    scanDataHealth,
    scanAiHealth,
    scanPerformance,
    scanNotifications,
    scanRealtime,
    scanAuth,
    scanStorage,
  ];

  const results = await Promise.allSettled(scans.map((s) => s()));
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

// ── API Health ──

async function scanApiHealth() {
  const issues = [];
  const entities = ["Assignment", "Course", "Exam", "QuadPost", "Notification", "CalendarEvent", "CampusEvent", "TaskManagement"];
  const checks = entities.map(async (name) => {
    const start = performance.now();
    try {
      await base44.entities[name]?.list?.("-created_date", 1);
      const elapsed = performance.now() - start;
      if (elapsed > SLOW_PAGE_THRESHOLD_MS) {
        issues.push({
          id: `slow_query_${name}`,
          type: "slow_query",
          severity: "medium",
          title: `Slow query: ${name}`,
          message: `Entity query took ${Math.round(elapsed)}ms (threshold: ${SLOW_PAGE_THRESHOLD_MS}ms)`,
          source: name,
          repairable: true,
          repairStrategy: "refresh_cache",
        });
      }
    } catch (err) {
      issues.push({
        id: `failed_api_${name}`,
        type: "failed_api_call",
        severity: "high",
        title: `API failure: ${name}`,
        message: err?.message || "Entity query failed",
        source: name,
        repairable: true,
        repairStrategy: "retry",
      });
    }
  });
  await Promise.allSettled(checks);
  return issues;
}

// ── Data Health ──

async function scanDataHealth() {
  const issues = [];

  // Check for duplicate assignments (same title)
  try {
    const assignments = await base44.entities.Assignment.list("-created_date", SCAN_BATCH_SIZE);
    if (assignments?.length) {
      const titles = {};
      for (const a of assignments) {
        if (a.title) {
          titles[a.title] = (titles[a.title] || 0) + 1;
        }
      }
      for (const [title, count] of Object.entries(titles)) {
        if (count > 1) {
          issues.push({
            id: `duplicate_data_assignment_${title}`,
            type: "duplicate_data",
            severity: "low",
            title: `Duplicate assignments: "${title.slice(0, 30)}"`,
            message: `${count} records with the same title detected.`,
            source: "Assignment",
            repairable: true,
            repairStrategy: "remove_duplicates",
          });
        }
      }
    }
  } catch {}

  // Check for corrupted data (missing required fields)
  try {
    const posts = await base44.entities.QuadPost.list("-created_date", SCAN_BATCH_SIZE);
    if (posts?.length) {
      const corrupted = posts.filter((p) => !p.content || !p.author_name);
      if (corrupted.length > 0) {
        issues.push({
          id: "corrupted_quadpost",
          type: "corrupted_data",
          severity: "medium",
          title: `${corrupted.length} corrupted posts`,
          message: "Some posts are missing required fields (content or author).",
          source: "QuadPost",
          repairable: true,
          repairStrategy: "repair_data",
        });
      }
    }
  } catch {}

  return issues;
}

// ── AI Health ──

async function scanAiHealth() {
  const issues = [];
  try {
    const start = performance.now();
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: "Respond with: OK",
    });
    const elapsed = performance.now() - start;
    const response = typeof res === "string" ? res : res?.response || res?.text;

    if (!response) {
      issues.push({
        id: "ai_no_response",
        type: "failed_ai_response",
        severity: "high",
        title: "AI not responding",
        message: "InvokeLLM returned an empty response.",
        source: "Core.InvokeLLM",
        repairable: true,
        repairStrategy: "retry",
      });
    }

    if (elapsed > 5000) {
      issues.push({
        id: "ai_slow_response",
        type: "performance_regression",
        severity: "medium",
        title: "AI response latency high",
        message: `InvokeLLM took ${Math.round(elapsed)}ms (threshold: 5000ms)`,
        source: "Core.InvokeLLM",
        repairable: false,
      });
    }
  } catch (err) {
    issues.push({
      id: "ai_failure",
      type: "failed_ai_response",
      severity: "high",
      title: "AI service failure",
      message: err?.message || "InvokeLLM threw an error",
      source: "Core.InvokeLLM",
      repairable: true,
      repairStrategy: "retry",
    });
  }
  return issues;
}

// ── Performance ──

function scanPerformance() {
  const issues = [];

  // Check memory usage (if available)
  if (typeof performance !== "undefined" && performance.memory) {
    const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
    const limitMB = performance.memory.jsHeapSizeLimit / (1024 * 1024);
    const pct = (usedMB / limitMB) * 100;

    if (pct > 80) {
      issues.push({
        id: "memory_high",
        type: "memory_leak",
        severity: "high",
        title: "High memory usage",
        message: `JS heap at ${pct.toFixed(1)}% (${Math.round(usedMB)}MB / ${Math.round(limitMB)}MB)`,
        source: "runtime",
        repairable: false,
      });
    }
  }

  // Check for long-running timers (potential leak indicator)
  // This is a heuristic — if the page has been open for a very long time
  if (typeof window !== "undefined" && window.__bud_open_since) {
    const openHours = (Date.now() - window.__bud_open_since) / (1000 * 60 * 60);
    if (openHours > 6) {
      issues.push({
        id: "long_session",
        type: "performance_regression",
        severity: "low",
        title: "Long session detected",
        message: `App has been running for ${openHours.toFixed(1)} hours. Consider refreshing.`,
        source: "runtime",
        repairable: false,
      });
    }
  }

  return issues;
}

// ── Notifications ──

async function scanNotifications() {
  const issues = [];
  try {
    const unread = await base44.entities.Notification.filter(
      { is_read: false, dismissed: false },
      "-created_date",
      50
    );
    if (unread?.length > 30) {
      issues.push({
        id: "notification_backlog",
        type: "failed_notification",
        severity: "medium",
        title: "Notification backlog",
        message: `${unread.length} unread notifications. Delivery may be delayed.`,
        source: "Notification",
        repairable: false,
      });
    }
  } catch {}
  return issues;
}

// ── Realtime ──

function scanRealtime() {
  const issues = [];
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    issues.push({
      id: "offline",
      type: "broken_realtime",
      severity: "medium",
      title: "Device offline",
      message: "Realtime subscriptions are paused. Data may be stale.",
      source: "network",
      repairable: true,
      repairStrategy: "resubscribe",
    });
  }
  return issues;
}

// ── Auth Health ──

async function scanAuth() {
  const issues = [];
  try {
    const start = performance.now();
    await base44.auth.isAuthenticated();
    const elapsed = performance.now() - start;
    if (elapsed > 2000) {
      issues.push({
        id: "auth_slow",
        type: "auth_health",
        severity: "medium",
        title: "Authentication slow",
        message: `Auth check took ${Math.round(elapsed)}ms`,
        source: "auth",
        repairable: false,
      });
    }
  } catch (err) {
    issues.push({
      id: "auth_failure",
      type: "auth_health",
      severity: "critical",
      title: "Authentication service down",
      message: err?.message || "Auth check failed",
      source: "auth",
      repairable: true,
      repairStrategy: "reconnect",
    });
  }
  return issues;
}

// ── Storage ──

function scanStorage() {
  const issues = [];
  if (typeof localStorage !== "undefined") {
    try {
      // Test read/write
      const testKey = "__bud_storage_test";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
    } catch {
      issues.push({
        id: "storage_full",
        type: "storage_issue",
        severity: "medium",
        title: "Local storage unavailable",
        message: "Cannot write to localStorage. Cache and preferences may not persist.",
        source: "storage",
        repairable: true,
        repairStrategy: "refresh_cache",
      });
    }

    // Check storage size
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        total += (localStorage.getItem(key) || "").length;
      }
      const sizeKB = total / 1024;
      if (sizeKB > 4000) {
        issues.push({
          id: "storage_bloat",
          type: "storage_issue",
          severity: "low",
          title: "Local storage bloat",
          message: `localStorage is ${Math.round(sizeKB)}KB. Consider clearing old cache.`,
          source: "storage",
          repairable: true,
          repairStrategy: "refresh_cache",
        });
      }
    } catch {}
  }
  return issues;
}
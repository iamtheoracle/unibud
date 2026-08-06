/**
 * Self-Healing Issue Registry — all detectable issue types with their
 * severity, category, and repair strategy.
 *
 * Each issue type has a unique key used for deduplication and tracking.
 */

export const ISSUE_CATEGORIES = [
  { id: "ui", label: "UI & Components", icon: "Layout" },
  { id: "navigation", label: "Navigation", icon: "Navigation" },
  { id: "api", label: "API & Backend", icon: "Server" },
  { id: "data", label: "Data & Database", icon: "Database" },
  { id: "ai", label: "AI & Intelligence", icon: "Brain" },
  { id: "performance", label: "Performance", icon: "Gauge" },
  { id: "security", label: "Security", icon: "Shield" },
  { id: "accessibility", label: "Accessibility", icon: "Accessibility" },
  { id: "notification", label: "Notifications", icon: "Bell" },
  { id: "infrastructure", label: "Infrastructure", icon: "Cloud" },
];

export const ISSUE_TYPES = {
  // ── UI & Components ──
  broken_button: { category: "ui", severity: "high", label: "Broken Button", repairable: false },
  empty_screen: { category: "ui", severity: "medium", label: "Empty Screen", repairable: false },
  empty_list: { category: "ui", severity: "low", label: "Empty List", repairable: false },
  ui_inconsistency: { category: "ui", severity: "low", label: "UI Inconsistency", repairable: false },
  missing_icon: { category: "ui", severity: "low", label: "Missing Icon", repairable: false },
  missing_image: { category: "ui", severity: "low", label: "Missing Image", repairable: false },
  broken_upload: { category: "ui", severity: "high", label: "Broken Upload", repairable: true },
  broken_download: { category: "ui", severity: "high", label: "Broken Download", repairable: true },
  duplicate_component: { category: "ui", severity: "medium", label: "Duplicate Component", repairable: false },
  missing_translation: { category: "ui", severity: "low", label: "Missing Translation", repairable: false },

  // ── Navigation ──
  broken_link: { category: "navigation", severity: "high", label: "Broken Link", repairable: false },
  dead_navigation: { category: "navigation", severity: "high", label: "Dead Navigation", repairable: false },

  // ── API & Backend ──
  failed_api_call: { category: "api", severity: "high", label: "Failed API Call", repairable: true },
  missing_backend_connection: { category: "api", severity: "critical", label: "Missing Backend Connection", repairable: true },
  failed_ai_response: { category: "api", severity: "high", label: "Failed AI Response", repairable: true },

  // ── Data & Database ──
  slow_query: { category: "data", severity: "medium", label: "Slow Query", repairable: true },
  duplicate_data: { category: "data", severity: "medium", label: "Duplicate Data", repairable: true },
  corrupted_data: { category: "data", severity: "high", label: "Corrupted Data", repairable: true },
  broken_realtime: { category: "data", severity: "medium", label: "Broken Realtime Subscription", repairable: true },

  // ── Performance ──
  slow_page: { category: "performance", severity: "medium", label: "Slow Page", repairable: false },
  memory_leak: { category: "performance", severity: "high", label: "Memory Leak", repairable: false },
  performance_regression: { category: "performance", severity: "medium", label: "Performance Regression", repairable: false },

  // ── Security ──
  security_vulnerability: { category: "security", severity: "critical", label: "Security Vulnerability", repairable: false },
  missing_permission: { category: "security", severity: "high", label: "Missing Permission", repairable: false },

  // ── Accessibility ──
  accessibility_violation: { category: "accessibility", severity: "medium", label: "Accessibility Violation", repairable: false },

  // ── Notifications ──
  failed_notification: { category: "notification", severity: "medium", label: "Failed Notification", repairable: true },

  // ── Infrastructure ──
  failed_job: { category: "infrastructure", severity: "high", label: "Failed Background Job", repairable: true },
  storage_issue: { category: "infrastructure", severity: "medium", label: "Storage Issue", repairable: true },
  auth_health: { category: "infrastructure", severity: "critical", label: "Authentication Issue", repairable: true },
};

export const REPAIR_STRATEGIES = {
  retry: "Retry Failed Operation",
  reconnect: "Restore Connection",
  rebuild_index: "Rebuild Search Index",
  refresh_cache: "Refresh Cache",
  compress_media: "Compress Media",
  repair_data: "Repair Corrupted Data",
  remove_duplicates: "Remove Duplicate Records",
  recover_upload: "Recover Interrupted Upload",
  restart_job: "Restart Failed Job",
  resubscribe: "Reconnect Realtime Subscription",
};

export function getIssueType(key) {
  return ISSUE_TYPES[key] || { category: "unknown", severity: "low", label: key, repairable: false };
}

export function severityRank(s) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s] || 0;
}
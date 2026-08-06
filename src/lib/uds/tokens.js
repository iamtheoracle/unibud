/**
 * UNIBUD Design System (UDS) v1.0 — token reference.
 * The single source of truth for spacing, radius, typography, color, motion,
 * Bud emotions, and dashboard roles. Components must derive values from here.
 */

/** 8-point spacing scale (px). No arbitrary spacing. */
export const SPACING = {
  4: "4px", 8: "8px", 12: "12px", 16: "16px", 20: "20px",
  24: "24px", 32: "32px", 40: "40px", 48: "48px", 64: "64px",
  80: "80px", 96: "96px", 128: "128px",
};

/** Border radius scale. */
export const RADIUS = { sm: 12, md: 20, lg: 28, xl: 36, pill: 9999 };

/** Type scale (px). Supports Dynamic Type via CSS variables. */
export const TYPE_SCALE = {
  display: 34, heading: 22, title: 18, subtitle: 15,
  body: 14, caption: 12, label: 11, micro: 10,
};

/** Semantic color tokens (never use hardcoded colors). */
export const SEMANTIC_COLORS = [
  "primary", "secondary", "muted", "accent",
  "success", "warning", "error", "information", "destructive",
];

/** Default motion easing. */
export const EASE = [0.16, 1, 0.3, 1];

/** Bud emotion system. Spark stays invisible. */
export const BUD_EMOTIONS = [
  "idle", "thinking", "listening", "speaking", "celebrating", "encouraging",
];

/** Standardized dashboard roles. */
export const DASHBOARD_ROLES = [
  "student", "institution", "lecturer",
  "operator", "management", "architect", "oracle",
];
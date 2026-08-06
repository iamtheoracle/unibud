/**
 * Shared notification helpers used by every reminder / engine backend function.
 * Keeps the notification payload shape consistent and centralises dedup,
 * quiet-hours, preference and Bud-tone logic so the engine stays declarative.
 */

export function buildNotification({ title, message, type = "reminder", icon = "Bell", link = "/", priority = "normal", category, dedup_key, source, action }) {
  return { title, message, type, icon, link, priority, category, dedup_key, source, action };
}

/** True if a notification with this dedup_key already exists in the recent list (sync, in-memory check). */
export function alreadyNotified(recentNotifs, uid, key) {
  if (!key) return false;
  return (recentNotifs || []).some((n) => n?.dedup_key === key && (!uid || n?.user_id === uid));
}

/** Merge a NotificationPreference record into a normalized prefs object (defaults on null). */
export function mergePrefs(p) {
  return {
    enabled: p?.enabled ?? true,
    categories: p?.categories || {},
    delivery: p?.delivery || {},
    quiet_hours_start: p?.quiet_hours_start,
    quiet_hours_end: p?.quiet_hours_end,
    study_hours_start: p?.study_hours_start,
    study_hours_end: p?.study_hours_end,
    reminder_frequency: p?.reminder_frequency || "balanced",
    reminder_timing: p?.reminder_timing || "standard",
    weekend_enabled: p?.weekend_enabled ?? true,
    bud_tone: p?.bud_tone || "calm",
    muted_categories: p?.muted_categories || [],
    digest_mode: p?.digest_mode ?? true,
    min_priority_to_alert: p?.min_priority_to_alert || "normal",
    cross_app_enabled: p?.cross_app_enabled,
    push_permission_granted: p?.push_permission_granted,
  };
}

/** True when the user has enabled the given notification category. */
export function categoryEnabled(prefs, category) {
  if (!prefs) return true;
  if (prefs.enabled === false) return false;
  if (Array.isArray(prefs.muted_categories) && prefs.muted_categories.includes(category)) return false;
  return (prefs.categories || {})[category] !== false;
}

/** True when "now" (in tz) is Saturday or Sunday. */
export function isWeekend(tz = "UTC") {
  try {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
    const day = d.getDay();
    return day === 0 || day === 6;
  } catch {
    return false;
  }
}

/** True when a notification should be delivered now, respecting quiet hours / weekend / digest / min-priority. */
export function shouldDeliverNow(prefs, tz, priority) {
  const p = PRIORITY_RANK[priority] ?? PRIORITY_RANK.normal;
  if (p >= PRIORITY_RANK.critical) return true;
  if (inQuietHours(prefs)) return false;
  if (prefs?.weekend_enabled === false && isWeekend(tz)) return false;
  if (prefs?.digest_mode && p < PRIORITY_RANK.high) return false;
  const minRank = PRIORITY_RANK[prefs?.min_priority_to_alert] ?? PRIORITY_RANK.normal;
  return p >= minRank;
}

/** True when the user's reminder-timing preference permits this stage. */
export function stageAllowed(prefs, stage) {
  const timing = prefs?.reminder_timing || "standard";
  if (timing === "early") return true;
  if (timing === "standard") return stage <= 72;
  return stage <= 24; // last_minute
}

/** Returns the stage whose window h currently falls within (±tolerance), or null. */
export function currentStage(h, stages, tolerance = 0.5) {
  if (h == null || h < 0 || !Array.isArray(stages)) return null;
  for (const s of [...stages].sort((a, b) => b - a)) {
    if (h >= s - tolerance && h <= s + tolerance) return s;
  }
  return null;
}

/** Human label for a stage (hours before due). */
export function stageLabel(stage) {
  if (stage >= 168) return "7 days";
  if (stage >= 120) return "5 days";
  if (stage >= 72) return "3 days";
  if (stage >= 48) return "2 days";
  if (stage >= 24) return "a day";
  if (stage >= 6) return "6 hours";
  if (stage >= 2) return "2 hours";
  if (stage >= 1) return "1 hour";
  return "soon";
}

/** Pick a phrase matching the user's Bud tone (calm / encouraging / direct). */
export function budPhrase(prefs, supportive, playful, formal) {
  const tone = prefs?.bud_tone || "calm";
  if (tone === "encouraging") return playful;
  if (tone === "direct") return formal;
  return supportive;
}

/** Reminder lead-time stages per entity (hours before due). */
export const ASSIGNMENT_STAGES = [168, 72, 24, 6, 1];
export const EXAM_STAGES = [168, 72, 24, 2];
export const TASK_STAGES = [24, 6, 1];
export const EVENT_STAGES = [24, 1];
export const CAREER_STAGES = [72, 24];

/** Hours from now until an ISO date (or null if missing/invalid). */
export function hoursUntil(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return (t - Date.now()) / (1000 * 60 * 60);
}

/** Short readable label for an ISO date/time, used inside message bodies. */
export function shortWhen(iso, includeTime = false) {
  if (!iso) return "soon";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "soon";
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!includeTime) return date;
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

/** The 9 notification categories the Bud engine produces. */
export const NOTIFICATION_CATEGORIES = [
  "assignment", "exam", "timetable", "event", "streak",
  "campus", "community", "career", "bud",
];

/** Default assignment lead times in hours: 7d, 3d, 24h, 6h, 1h. */
export const DEFAULT_LEADS = [168, 72, 24, 6, 1];

/** Lead sets per reminder-frequency preference. */
export const FREQUENCY_LEADS = {
  minimal: [168, 24, 1],
  balanced: [168, 72, 24, 6, 1],
  frequent: [168, 120, 72, 48, 24, 12, 6, 3, 1],
};

export const PRIORITY_RANK = { silent: 0, low: 1, normal: 2, high: 3, critical: 4 };

/** Stable dedup key — combined with user_id at emit time for per-user uniqueness. */
export function dedupKey(category, entityId, lead) {
  return `bud:${category}:${entityId || "x"}:${lead}`;
}

/** Resolve the active lead set for a user (explicit overrides frequency). */
export function leadsFor(prefs) {
  if (Array.isArray(prefs?.assignment_lead_hours) && prefs.assignment_lead_hours.length) {
    return prefs.assignment_lead_hours;
  }
  const freq = prefs?.reminder_frequency || "balanced";
  return FREQUENCY_LEADS[freq] || FREQUENCY_LEADS.balanced;
}

/** True when "now" falls inside the user's quiet-hours window (handles midnight wrap). */
export function inQuietHours(prefs, now = new Date()) {
  const start = prefs?.quiet_hours_start;
  const end = prefs?.quiet_hours_end;
  if (!start || !end || start === end) return false;
  const toMin = (t) => {
    const [h, m] = String(t).split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = toMin(start);
  const e = toMin(end);
  if (s < e) return cur >= s && cur < e;
  return cur >= s || cur < e; // wraps midnight
}

export function isCategoryMuted(prefs, category) {
  return Array.isArray(prefs?.muted_categories) && prefs.muted_categories.includes(category);
}

export function passesMinPriority(notifPriority, minToAlert) {
  return (PRIORITY_RANK[notifPriority] ?? 2) >= (PRIORITY_RANK[minToAlert] ?? 2);
}

/** Bud voice presets — lightly reshape a message to match the chosen tone. */
export const BUD_TONES = {
  supportive: { label: "Supportive", hint: "Warm, encouraging, no pressure." },
  playful: { label: "Playful", hint: "Light, friendly, a little energy." },
  formal: { label: "Formal", hint: "Calm, clear, no slang." },
  concise: { label: "Concise", hint: "Short, to the point." },
};

export function applyBudTone(message, tone = "supportive") {
  if (!message) return message;
  const t = tone || "supportive";
  if (t === "concise") return String(message).split(/(?<=[.!?])\s/)[0];
  if (t === "playful") return "Hey! " + message;
  if (t === "formal") {
    const m = String(message).trim();
    return /[.!?]$/.test(m) ? m : m + ".";
  }
  return message; // supportive
}
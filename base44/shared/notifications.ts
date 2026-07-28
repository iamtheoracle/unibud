/**
 * Shared notification helpers used by every reminder / engine backend function.
 * Keeps the notification payload shape consistent and centralises dedup,
 * quiet-hours, preference and Bud-tone logic so the engine stays declarative.
 */

export function buildNotification({ title, message, type = "reminder", icon = "Bell", link = "/" }) {
  return { title, message, type, icon, link };
}

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
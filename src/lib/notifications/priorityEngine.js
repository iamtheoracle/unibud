/**
 * Smart Notification Prioritization Engine for UNIBUD.
 *
 * Pure functions — no side effects. Scores every notification by urgency,
 * relevance, age and the user's preferences, then decides whether to show,
 * group (digest), delay (quiet hours) or mute it — preventing overload.
 *
 * Spark consumes this to order the unified notification stream and Bud uses
 * it to compile a calm daily digest.
 */

export const PRIORITY_WEIGHT = { critical: 100, high: 70, normal: 40, low: 15, silent: 0 };

export const CATEGORY_RELEVANCE = {
  academic: 0.95,
  reminder: 0.9,
  task: 0.85,
  emergency: 1.0,
  achievement: 0.6,
  bud: 0.5,
  system: 0.45,
  campus: 0.6,
  social: 0.4,
  comment: 0.35,
  mention: 0.5,
  reply: 0.4,
  message: 0.45,
  marketplace: 0.3,
  library: 0.4,
  transport: 0.5,
  opportunity: 0.45,
  study_group: 0.6,
  assignment: 0.9,
  timetable: 0.7,
};

export function inQuietHours(now, prefs) {
  if (!prefs?.quiet_hours_start || !prefs?.quiet_hours_end) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = prefs.quiet_hours_start.split(":").map(Number);
  const [eh, em] = prefs.quiet_hours_end.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start === end) return false;
  if (start < end) return cur >= start && cur < end;
  return cur >= start || cur < end; // overnight window
}

export function isMuted(n, prefs) {
  if (!prefs?.muted_categories) return false;
  return prefs.muted_categories.includes(n.type) || prefs.muted_categories.includes(n.category);
}

export function scoreNotification(n, ctx = {}) {
  const { now = new Date(), prefs } = ctx;
  if (isMuted(n, prefs)) return { score: 0, bucket: "silent", action: "mute" };

  const base = PRIORITY_WEIGHT[n.priority] ?? PRIORITY_WEIGHT.normal;
  const rel = CATEGORY_RELEVANCE[n.type] ?? CATEGORY_RELEVANCE[n.category] ?? 0.5;
  let score = base * 0.6 + rel * 30;

  // age decay for non-urgent items so stale noise sinks
  const created = n.created_date || n.created_at;
  if (created) {
    const ageH = (now - new Date(created)) / 36e5;
    if (n.priority !== "critical" && n.priority !== "high") {
      score -= Math.min(20, ageH * 1.5);
    }
  }
  if (n.is_read === false) score += 5;

  let action = "show";
  if (inQuietHours(now, prefs) && n.priority !== "critical") action = "delay";
  if (prefs?.digest_mode && (n.priority === "low" || n.priority === "normal")) action = "group";

  score = Math.max(0, Math.min(100, Math.round(score)));
  let bucket = "silent";
  if (score >= 85) bucket = "critical";
  else if (score >= 60) bucket = "high";
  else if (score >= 35) bucket = "normal";
  else if (score >= 10) bucket = "low";
  if (action === "mute") bucket = "silent";
  return { score, bucket, action };
}

/**
 * prioritize — returns show (sorted), digest (grouped non-urgent),
 * delayed (held during quiet hours) and muted buckets.
 */
export function prioritize(list, ctx = {}) {
  const scored = list.map((n) => ({ n, ...scoreNotification(n, ctx) }));
  const show = scored
    .filter((s) => s.action === "show")
    .sort((a, b) => b.score - a.score);
  const digest = {};
  scored
    .filter((s) => s.action === "group")
    .forEach((s) => {
      const key = s.n.type || s.n.category || "other";
      (digest[key] = digest[key] || []).push(s.n);
    });
  const delayed = scored.filter((s) => s.action === "delay");
  const muted = scored.filter((s) => s.action === "mute");
  return { show, digest, delayed, muted, digestCount: Object.values(digest).reduce((a, arr) => a + arr.length, 0) };
}
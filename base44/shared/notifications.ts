/**
 * Shared notification builder used by all reminder/follow-up backend functions.
 * Keeps the notification payload shape consistent across workflows.
 */
export function buildNotification({
  title,
  message,
  type = "reminder",
  icon = "Bell",
  link = "/",
}) {
  return { title, message, type, icon, link };
}

/**
 * Returns hours from now until an ISO date (or null if missing/invalid).
 */
export function hoursUntil(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return (t - Date.now()) / (1000 * 60 * 60);
}

/**
 * Formats an ISO date/time into a short, readable label for messages.
 */
export function shortWhen(iso, includeTime = false) {
  if (!iso) return "soon";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "soon";
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!includeTime) return date;
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { inQuietHours, prioritize } from "./priorityEngine";

const NOTIF_KEY = ["Notification"];
const PREF_KEY = ["NotificationPreference"];

const DEFAULT_PREFS = {
  muted_categories: [],
  quiet_hours_start: "",
  quiet_hours_end: "",
  digest_mode: true,
  min_priority_to_alert: "normal",
};

/**
 * useSmartNotifications — the single smart notification entry point for the
 * whole platform. Loads notifications + the user's preferences, runs them
 * through the prioritization engine (grouping/delaying/muting non-critical
 * items), and exposes a Bud-friendly daily digest.
 */
export function useSmartNotifications() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const notifQ = useQuery({ queryKey: NOTIF_KEY, queryFn: () => base44.entities.Notification.list("-created_date", 100) });
  const prefQ = useQuery({
    queryKey: PREF_KEY,
    queryFn: async () => {
      const list = await base44.entities.NotificationPreference.filter({}, "-created_date", 1);
      return list[0] || null;
    },
    enabled: !!user,
  });

  const notifications = notifQ.data || [];
  const prefs = { ...DEFAULT_PREFS, ...(prefQ.data || {}) };
  const prefId = prefQ.data?.id;

  const { show, digest, delayed, muted, digestCount } = useMemo(
    () => prioritize(notifications, { now: new Date(), prefs }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notifications, prefs.quiet_hours_start, prefs.quiet_hours_end, prefs.digest_mode, JSON.stringify(prefs.muted_categories)]
  );
  const quiet = inQuietHours(new Date(), prefs);
  const unread = notifications.filter((n) => !n.is_read).length;

  const savePrefs = useMutation({
    mutationFn: (patch) => {
      const merged = { ...prefs, ...patch };
      if (prefId) return base44.entities.NotificationPreference.update(prefId, merged);
      return base44.entities.NotificationPreference.create(merged);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PREF_KEY }),
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true, read_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_KEY }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await Promise.all(
        notifications.filter((n) => !n.is_read).map((n) => base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() }))
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIF_KEY }),
  });

  const muteCategory = (cat) => {
    if (!prefs.muted_categories.includes(cat)) savePrefs.mutate({ muted_categories: [...prefs.muted_categories, cat] });
  };
  const unmuteCategory = (cat) => savePrefs.mutate({ muted_categories: prefs.muted_categories.filter((c) => c !== cat) });

  const digestSummary = useMemo(() => buildDigest(notifications, show), [notifications, show]);

  return {
    notifications, prefs, show, digest, delayed, muted, digestCount, quiet, unread,
    markRead: markRead.mutate, markAllRead: markAllRead.mutate,
    savePrefs: savePrefs.mutate, savingPrefs: savePrefs.isPending,
    muteCategory, unmuteCategory,
    digestSummary,
  };
}

function buildDigest(notifications, show) {
  const today = new Date().toISOString().slice(0, 10);
  const todays = notifications.filter((n) => (n.created_date || "").slice(0, 10) === today);
  const critical = show.filter((s) => s.bucket === "critical").map((s) => s.n);
  const high = show.filter((s) => s.bucket === "high").map((s) => s.n);
  const byType = {};
  notifications.forEach((n) => { (byType[n.type] = byType[n.type] || []).push(n); });
  return {
    totalToday: todays.length,
    critical: critical.length,
    high: high.length,
    academic: (byType.academic || []).length + (byType.assignment || []).length,
    reminders: (byType.reminder || []).length,
    social: (byType.social || []).length + (byType.comment || []).length,
    announcements: (byType.system || []).length,
    top: [...critical, ...high].slice(0, 5),
  };
}
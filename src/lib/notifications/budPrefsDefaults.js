/**
 * Default Bud notification preferences — mirrored from the server-side
 * base44/shared/notifications.ts so the frontend can merge stored prefs with
 * defaults without importing the backend module. Keep in sync with that file.
 */
export const DEFAULT_PREFS = {
  enabled: true,
  categories: {
    assignment: true, exam: true, streak: true, class: true,
    campus: true, career: true, community: true, ai: true,
  },
  delivery: {
    in_app: true, push: false, lock_screen: false, silent: false, time_sensitive: false,
  },
  cross_app_enabled: false,
  push_permission_granted: false,
  quiet_hours_start: "",
  quiet_hours_end: "",
  study_hours_start: "",
  study_hours_end: "",
  reminder_frequency: "normal",
  reminder_timing: "standard",
  snooze_duration_minutes: 15,
  weekend_enabled: true,
  bud_tone: "calm",
  digest_mode: true,
  min_priority_to_alert: "normal",
  muted_categories: [],
};
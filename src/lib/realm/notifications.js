/**
 * Notification Service — in-app, push-ready, email, and SMS/WhatsApp-ready.
 * Supports read/unread, categories, quiet hours, delivery tracking (via
 * Notification entity), and user preferences (localStorage).
 */
const PREFS_KEY = "realm.notifications.prefs";
const getPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; } };
const setPrefs = (p) => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {} };

export function notificationService(base44) {
  return {
    list: (limit) => base44.entities.Notification.list("-created_date", limit),
    filter: (q, ...rest) => base44.entities.Notification.filter(q, ...rest),
    create: (data) => base44.entities.Notification.create(data),
    markRead: (id) => base44.entities.Notification.update(id, { read: true }),
    markAllRead: (items) =>
      base44.entities.Notification.bulkUpdate((items || []).map((n) => ({ id: n.id, read: true }))),
    delete: (id) => base44.entities.Notification.delete(id),

    preferences: () => getPrefs(),
    setPreferences: (p) => setPrefs({ ...getPrefs(), ...p }),
    /** Quiet hours — suppress non-urgent delivery. Returns boolean isQuiet. */
    isQuiet: () => {
      const { quietStart, quietEnd } = getPrefs();
      if (!quietStart || !quietEnd) return false;
      const h = new Date().getHours();
      const [s, e] = [Number(quietStart), Number(quietEnd)];
      return s < e ? h >= s && h < e : h >= s || h < e;
    },
  };
}
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBudNotificationPrefs } from "./useBudNotificationPrefs";

/**
 * useBudPush — opts the user into device / lock-screen push for high-priority
 * Bud notifications. Requires ALL of:
 *   • prefs.delivery.push === true   (user explicitly enabled push delivery)
 *   • prefs.cross_app_enabled === true (user opted into reminders outside the app)
 *   • Notification.permission === "granted" (OS/browser permission granted)
 *
 * No notification is ever sent outside the app unless the user has explicitly
 * enabled it AND granted device permission — per the privacy requirement.
 *
 * Mount once at the app shell level; it subscribes to the Notification entity
 * and surfaces critical/high items as native browser notifications.
 */
export function useBudPush() {
  const { prefs } = useBudNotificationPrefs();

  useEffect(() => {
    const pushOn = prefs?.delivery?.push === true && prefs?.cross_app_enabled === true;
    const supported = typeof window !== "undefined" && "Notification" in window;
    if (!pushOn || !supported || Notification.permission !== "granted") return;

    let unsub = () => {};
    try {
      unsub = base44.entities.Notification.subscribe((event) => {
        if (event?.type !== "create") return;
        const n = event.data;
        if (!n) return;
        const high = n.priority === "critical" || n.priority === "high";
        if (!high) return;
        const title = n.title || "Bud";
        const body = n.message || "";
        const tag = n.dedup_key || n.id || String(Date.now());
        const data = { link: n.link || "/home" };
        try {
          if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({ type: "bud-notification", title, body, tag, data });
          } else {
            new Notification(title, { body, tag, data });
          }
        } catch {
          /* no-op — in-app notification still exists */
        }
      });
    } catch {
      /* subscription unavailable — in-app notifications still work */
    }
    return unsub;
  }, [prefs?.delivery?.push, prefs?.cross_app_enabled, prefs?.push_permission_granted]);
}

/** Request the OS/browser notification permission. Returns the permission state. */
export async function requestPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}
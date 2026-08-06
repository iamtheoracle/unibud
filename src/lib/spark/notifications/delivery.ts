import type { DeliveryAdapter, NotificationPayload } from "./interface";

/**
 * Local delivery adapter — persists notifications through the Base44 SDK.
 *
 * Security invariant: only the Notification Engine (Spark) constructs and
 * calls this adapter. Application components never create notifications
 * directly; they publish Spark events and the engine does the rest. If the
 * adapter throws (offline / API outage) the engine still completes the
 * notification locally via the EventBus, so the UI updates instantly.
 */
export function createBase44DeliveryAdapter(sdk: any): DeliveryAdapter {
  return {
    async persist(payloads: NotificationPayload[]): Promise<void> {
      const records = payloads.map((p) => ({
        title: p.title,
        message: p.message,
        type: p.type,
        user_id: p.user_id || null,
        link: p.link || "",
        icon: p.icon || "",
        priority: p.priority,
        category: p.category,
        source: p.source,
        action: p.action,
        batch_key: p.batch_key || "",
        batch_count: p.batch_count || 1,
        pinned: false,
        is_read: false,
      }));
      if (records.length === 0) return;
      if (records.length === 1) {
        await sdk.entities.Notification.create(records[0]);
      } else {
        await sdk.entities.Notification.bulkCreate(records);
      }
    },
  };
}
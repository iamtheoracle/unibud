import type {
  NotificationEngineService,
  NotificationRule,
  NotificationPayload,
  NotificationAudience,
  DispatchInput,
  NotificationAnalytics,
  DeliveryAdapter,
} from "./interface";
import { SILENT_PRIORITIES } from "./types";

/**
 * Local (in-memory) NotificationEngine.
 *
 * Works offline, online, and during API outages. `processEvent` is pure and
 * synchronous — it never performs I/O — so it can run in milliseconds.
 * Persistence is delegated to an injectable DeliveryAdapter; if that
 * adapter throws (offline / API outage) the engine still completes the
 * notification locally by emitting it on the EventBus for instant UI.
 */

interface PermissionPolicy {
  canCreate(actorRole: string | undefined, rule: NotificationRule | undefined): boolean;
}

/** RBAC gate. Broadcast / emergency / system events require a staff role. */
const DEFAULT_POLICY: PermissionPolicy = {
  canCreate: (role, rule) => {
    if (!rule) return false;
    const restricted = [
      "emergency.alert",
      "system.announcement",
      "management.broadcast",
      "university.broadcast",
    ];
    if (restricted.includes(rule.eventName)) {
      return [
        "admin",
        "system_admin",
        "institution_admin",
        "management",
        "operator",
        "oracle",
      ].includes(role || "");
    }
    return true;
  },
};

export class LocalNotificationEngineService implements NotificationEngineService {
  private rulesMap = new Map<string, NotificationRule[]>();
  private delivery: DeliveryAdapter | null = null;
  private eventBus: any = null;
  private policy = DEFAULT_POLICY;
  private stats: NotificationAnalytics = {
    generated: 0,
    delivered: 0,
    opened: 0,
    dismissed: 0,
    ignored: 0,
    perGroup: {},
    mostActiveGroups: [],
  };

  setDeliveryAdapter(adapter: DeliveryAdapter | null): void {
    this.delivery = adapter;
  }
  setEventBus(bus: any): void {
    this.eventBus = bus;
  }

  registerRule(rule: NotificationRule): void {
    const list = this.rulesMap.get(rule.eventName) ?? [];
    list.push(rule);
    this.rulesMap.set(rule.eventName, list);
  }
  rules(): NotificationRule[] {
    return Array.from(this.rulesMap.values()).flat();
  }
  ruleFor(name: string): NotificationRule | undefined {
    return this.rulesMap.get(name)?.[0];
  }
  clearRules(): void {
    this.rulesMap.clear();
  }

  processEvent(name: string, payload: any, actorId?: string): NotificationPayload[] {
    const rules = this.rulesMap.get(name) ?? [];
    const out: NotificationPayload[] = [];
    for (const rule of rules) {
      if (!this.policy.canCreate(undefined, rule)) continue;
      const rendered = rule.template(payload);
      if (!rendered) continue;

      const basePriority = rule.defaultPriority;
      const shouldInterrupt = rule.canInterrupt ? rule.canInterrupt(payload) : true;
      const priority: NotificationPayload["priority"] =
        SILENT_PRIORITIES.includes(basePriority) || !shouldInterrupt
          ? "silent"
          : basePriority;

      const targets = this.resolveAudience(rule.audience, payload, actorId);
      const batchKey = rule.batchKey ? rule.batchKey(payload) : null;
      const batchLabel = rule.batchLabel ? rule.batchLabel(payload) : "";

      for (const target of targets) {
        // Never notify a user about an action they performed.
        if (target && actorId && target === actorId) continue;
        out.push({
          title: rendered.title,
          message: rendered.message,
          type: name.split(".")[0],
          category: rule.category,
          priority,
          icon: rendered.icon,
          link: rendered.link,
          user_id: target,
          batch_key: batchKey ?? undefined,
          batch_label: batchLabel || undefined,
          batch_count: 1,
          source: rule.source,
          action: name,
        });
      }
    }
    return out;
  }

  dispatch(input: DispatchInput): NotificationPayload[] {
    const payloads = this.processEvent(input.eventName, input.payload, input.actorId);
    this.stats.generated += payloads.length;
    this.emit("notification.generated", payloads);
    if (input.persist !== false) void this.deliver(payloads);
    return payloads;
  }

  dispatchBatch(inputs: DispatchInput[]): NotificationPayload[] {
    const all: NotificationPayload[] = [];
    for (const input of inputs) {
      all.push(...this.processEvent(input.eventName, input.payload, input.actorId));
    }
    const merged = this.mergeByBatchKey(all);
    this.stats.generated += merged.length;
    this.emit("notification.generated", merged);
    if (inputs.some((i) => i.persist !== false)) void this.deliver(merged);
    return merged;
  }

  track(event: "opened" | "dismissed" | "ignored", notificationId?: string, meta?: any): void {
    if (event === "opened") this.stats.opened++;
    else if (event === "dismissed") this.stats.dismissed++;
    else if (event === "ignored") this.stats.ignored++;
    if (meta?.group) {
      this.stats.perGroup[meta.group] = (this.stats.perGroup[meta.group] || 0) + 1;
      this.refreshTopGroups();
    }
    this.emit(`notification.${event}`, { notificationId, meta });
  }

  analytics(): NotificationAnalytics {
    return {
      ...this.stats,
      perGroup: { ...this.stats.perGroup },
      mostActiveGroups: [...this.stats.mostActiveGroups],
    };
  }

  // ----- internals -----

  private mergeByBatchKey(payloads: NotificationPayload[]): NotificationPayload[] {
    const groups = new Map<string, NotificationPayload>();
    const out: NotificationPayload[] = [];
    for (const p of payloads) {
      if (!p.batch_key) {
        out.push(p);
        continue;
      }
      const existing = groups.get(p.batch_key);
      if (existing) {
        existing.batch_count = (existing.batch_count || 1) + 1;
        existing.message = `${existing.batch_count} updates — ${existing.batch_label || existing.title}`;
      } else {
        groups.set(p.batch_key, p);
        out.push(p);
      }
    }
    return out;
  }

  private async deliver(payloads: NotificationPayload[]): Promise<void> {
    if (!this.delivery || payloads.length === 0) return;
    try {
      await this.delivery.persist(payloads);
      this.stats.delivered += payloads.length;
      this.emit("notification.delivered", payloads);
    } catch (err) {
      // Plugin/delivery failure never breaks the local notification.
      this.emit("notification.delivery_failed", {
        error: String(err),
        count: payloads.length,
      });
    }
  }

  private refreshTopGroups(): void {
    const entries = Object.entries(this.stats.perGroup);
    entries.sort((a, b) => b[1] - a[1]);
    this.stats.mostActiveGroups = entries.slice(0, 10).map(([group, count]) => ({
      group,
      count,
    }));
  }

  private emit(name: string, payload: any): void {
    try {
      this.eventBus?.emit?.(name, payload);
    } catch {
      /* EventBus is optional; engine works without it. */
    }
  }

  private resolveAudience(
    audience: NotificationAudience,
    payload: any,
    actorId?: string
  ): string[] {
    switch (audience.kind) {
      case "all":
        return [""];
      case "actor":
        return actorId ? [actorId] : [];
      case "field": {
        const v = payload?.[audience.field];
        if (typeof v === "string" && v) return [v];
        if (Array.isArray(v))
          return v.filter((x): x is string => typeof x === "string" && !!x);
        return [];
      }
      case "members_except_actor": {
        const members = Array.isArray(payload?.members) ? payload.members : [];
        const ids = members
          .map((m: any) => (typeof m === "object" && m ? m.user_id : m))
          .filter((x): x is string => typeof x === "string" && !!x);
        return actorId ? ids.filter((id) => id !== actorId) : ids;
      }
      default:
        return [];
    }
  }
}
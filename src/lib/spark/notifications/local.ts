import type {
  NotificationEngineService,
  NotificationRule,
  NotificationPayload,
  NotificationAudience,
} from "./interface";

/**
 * Local (in-memory) NotificationEngine.
 *
 * Rules are keyed by event name. `processEvent` is pure: it returns the
 * resolved notification payloads without performing any side effect — the
 * caller (a delivery adapter) decides what to do with them.
 */
export class LocalNotificationEngineService implements NotificationEngineService {
  private rulesMap = new Map<string, NotificationRule[]>();

  registerRule(rule: NotificationRule): void {
    const list = this.rulesMap.get(rule.eventName) ?? [];
    list.push(rule);
    this.rulesMap.set(rule.eventName, list);
  }

  rules(): NotificationRule[] {
    return Array.from(this.rulesMap.values()).flat();
  }

  clearRules(): void {
    this.rulesMap.clear();
  }

  processEvent(name: string, payload: unknown, actorId?: string): NotificationPayload[] {
    const rules = this.rulesMap.get(name) ?? [];
    const out: NotificationPayload[] = [];
    for (const rule of rules) {
      const rendered = rule.template(payload);
      if (!rendered) continue;
      for (const target of this.resolveAudience(rule.audience, payload, actorId)) {
        out.push({ ...rendered, user_id: target });
      }
    }
    return out;
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
        if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && !!x);
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
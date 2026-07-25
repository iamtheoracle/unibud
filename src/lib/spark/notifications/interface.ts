/**
 * NotificationEngine — Tier 1 Core Spark service.
 *
 * Decouples notification *generation* (which events matter, who should see
 * them, what the message says) from *delivery* (the channel that actually
 * shows or sends it). External sources (entity workflows, Bud, the Oracle)
 * emit events onto the Spark EventBus; the engine matches them against
 * registered rules, resolves the audience, and renders a notification
 * payload. A delivery adapter then persists/dispatches the result.
 */
export type NotificationAudience =
  | { kind: "all" }
  | { kind: "actor" }
  | { kind: "field"; field: string }
  | { kind: "members_except_actor" };

export interface NotificationPayload {
  title: string;
  message: string;
  type: string;
  icon?: string;
  link?: string;
  user_id?: string;
}

export interface NotificationRule {
  eventName: string;
  audience: NotificationAudience;
  template: (payload: unknown) => Omit<NotificationPayload, "user_id"> | null;
}

export interface NotificationEngineService {
  registerRule(rule: NotificationRule): void;
  rules(): NotificationRule[];
  processEvent(name: string, payload: unknown, actorId?: string): NotificationPayload[];
  clearRules(): void;
}
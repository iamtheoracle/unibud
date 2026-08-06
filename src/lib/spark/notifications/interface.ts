/**
 * NotificationEngine — Tier 1 Core Spark service interface.
 *
 * The flow it enforces, in order, and never reversed:
 *   Action → Event Created → Permission Check → Audience Resolution →
 *   Notification Generated → Stored → Displayed → Marked Read → Archived
 *
 * External providers (WhatsApp, Telegram, Email, SMS, Push) are Plugins
 * attached via a DeliveryAdapter. If a plugin fails, Spark still completes
 * the notification locally. Spark is always the source of truth.
 */
import type {
  NotificationPriority,
  NotificationCategory,
} from "./types";

export type NotificationAudience =
  | { kind: "all" }
  | { kind: "actor" }
  | { kind: "field"; field: string }
  | { kind: "members_except_actor" };

export interface NotificationPayload {
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  icon?: string;
  link?: string;
  user_id?: string;
  pinned?: boolean;
  batch_key?: string;
  batch_count?: number;
  batch_label?: string;
  source?: string;
  action?: string;
}

export interface NotificationRule {
  eventName: string;
  category: NotificationCategory;
  defaultPriority: NotificationPriority;
  source: string;
  audience: NotificationAudience;
  /** Stable key for merging repetitive notifications, or null to skip merging. */
  batchKey?: (payload: any) => string | null;
  /** Short subject used in merged messages ("3 members updated Project Alpha"). */
  batchLabel?: (payload: any) => string;
  /** Bud attention hook — false ⇒ notification is silent / does not interrupt. */
  canInterrupt?: (payload: any) => boolean;
  template: (
    payload: any
  ) => { title: string; message: string; icon?: string; link?: string } | null;
}

export interface DispatchInput {
  eventName: string;
  payload: any;
  actorId?: string;
  /** default true — false ⇒ emit locally only, never persist. */
  persist?: boolean;
}

export interface NotificationAnalytics {
  generated: number;
  delivered: number;
  opened: number;
  dismissed: number;
  ignored: number;
  perGroup: Record<string, number>;
  mostActiveGroups: Array<{ group: string; count: number }>;
}

export interface DeliveryAdapter {
  persist(payloads: NotificationPayload[]): Promise<void>;
}

export interface NotificationEngineService {
  registerRule(rule: NotificationRule): void;
  rules(): NotificationRule[];
  ruleFor(eventName: string): NotificationRule | undefined;
  dispatch(input: DispatchInput): NotificationPayload[];
  dispatchBatch(inputs: DispatchInput[]): NotificationPayload[];
  processEvent(name: string, payload: unknown, actorId?: string): NotificationPayload[];
  track(event: "opened" | "dismissed" | "ignored", notificationId?: string, meta?: any): void;
  analytics(): NotificationAnalytics;
  setDeliveryAdapter(adapter: DeliveryAdapter | null): void;
  setEventBus(bus: any): void;
  clearRules(): void;
}
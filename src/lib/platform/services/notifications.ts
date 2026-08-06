/**
 * Platform Services — Notification Service Interface
 *
 * The Notification Service generates, stores, delivers, and tracks
 * notifications across all platform products and external channels.
 *
 * Promoted from Spark's internal notification engine.
 * Underlying implementation: src/lib/spark/notifications/
 */

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationCategory =
  | "academic"
  | "social"
  | "campus"
  | "marketplace"
  | "career"
  | "system"
  | "bud"
  | "security";

export interface NotificationPayload {
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  icon?: string;
  link?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification extends NotificationPayload {
  id: string;
  userId: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationService {
  /** Send a notification to a user */
  send(userId: string, payload: NotificationPayload): Promise<Notification>;

  /** Mark a notification as read */
  markRead(notificationId: string): Promise<void>;

  /** List notifications for a user */
  list(userId: string, options?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]>;

  /** Return the count of unread notifications for a user */
  unreadCount(userId: string): Promise<number>;
}

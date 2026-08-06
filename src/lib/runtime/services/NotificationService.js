/**
 * Notification Service — Notification Dispatch
 *
 * Owns notification creation, scheduling, and preferences. Agents and
 * workflows use this service — they never create Notification entities directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class NotificationService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('NotificationService initialized');
  }

  /** Dispatch a notification to a user (or broadcast if userId is null). */
  async dispatch({ userId, title, message, type = 'system', priority = 'normal', category = 'system', link, icon, action, source }) {
    try {
      const record = await base44.entities.Notification.create({
        user_id: userId || null,
        title,
        message,
        type,
        priority,
        category,
        link,
        icon,
        action,
        source,
        is_read: false,
      });
      eventBus.publish({
        type: 'notification.dispatched',
        category: 'lifecycle',
        payload: { notificationId: record?.id, userId, priority },
      });
      return record;
    } catch (e) {
      logger.error('Notification dispatch failed', { error: e.message });
      return null;
    }
  }

  /** Get notification preferences for a user. */
  async getPreferences(userId) {
    try {
      const prefs = await base44.entities.NotificationPreference.filter({ created_by_id: userId }, '-updated_date', 1);
      return prefs[0] || null;
    } catch (e) {
      logger.error('Notification preferences failed', { error: e.message });
      return null;
    }
  }

  /** Mark a notification as read. */
  async markAsRead(notificationId) {
    try {
      return await base44.entities.Notification.update(notificationId, {
        is_read: true,
        read_at: new Date().toISOString(),
      });
    } catch (e) {
      logger.error('Notification markAsRead failed', { error: e.message });
      return null;
    }
  }

  get ready() { return this._ready; }
}

export const notificationService = new NotificationService();
export default notificationService;
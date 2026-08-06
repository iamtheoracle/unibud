/**
 * Audit Service — Audit Logging
 *
 * Owns all audit operations. Guardian uses this service — it never stores
 * audit data itself. Wraps AuditLog entity + logExecutiveAction backend function.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class AuditService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('AuditService initialized');
  }

  /** Log an audit entry. */
  async log({ actorId, actorName, action, detail, meta = {}, category = 'system', severity = 'info' }) {
    try {
      const record = await base44.entities.AuditLog.create({
        actor_id: actorId,
        actor_name: actorName || actorId || 'system',
        action,
        details: detail,
        meta,
        category,
        severity,
        timestamp: new Date().toISOString(),
      });
      eventBus.publish({
        type: 'audit.logged',
        category: 'audit',
        payload: { auditId: record?.id, action, actorId },
      });
      return record;
    } catch (e) {
      logger.error('Audit log failed', { error: e.message, action });
      return null;
    }
  }

  /** Log an executive action via the backend function. */
  async logExecutive({ authorityCode, action, detail, meta = {} }) {
    try {
      return await base44.functions.invoke('logExecutiveAction', {
        authority_code: authorityCode,
        action,
        detail,
        meta,
      });
    } catch (e) {
      logger.error('Executive audit log failed', { error: e.message });
      return null;
    }
  }

  /** Query audit logs. */
  async query({ actorId, action, category, limit = 50 } = {}) {
    try {
      const filter = {};
      if (actorId) filter.actor_id = actorId;
      if (action) filter.action = action;
      if (category) filter.category = category;
      return await base44.entities.AuditLog.filter(filter, '-created_date', limit);
    } catch (e) {
      logger.error('Audit query failed', { error: e.message });
      return [];
    }
  }

  get ready() { return this._ready; }
}

export const auditService = new AuditService();
export default auditService;
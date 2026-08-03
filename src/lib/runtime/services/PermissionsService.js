/**
 * Permissions Service — Access Control
 *
 * Client-side permission checks. RLS is enforced server-side — this service
 * provides a client-side hint for UI gating. Agents and experiences use this
 * service — they never check roles or ownership directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';

class PermissionsService {
  constructor() { this._ready = false; this._currentUser = null; }

  async init() {
    this._ready = true;
    logger.info('PermissionsService initialized');
  }

  /** Check if the current user can perform an operation on an entity. */
  async canPerform(operation, record = null) {
    try {
      if (!this._currentUser) {
        this._currentUser = await base44.auth.me().catch(() => null);
      }
      const user = this._currentUser;
      if (!user) return false;
      if (user.role === 'admin') return true;

      if ((operation === 'update' || operation === 'delete') && record) {
        if (record.created_by_id && record.created_by_id !== user.id) return false;
      }

      return true;
    } catch (e) {
      logger.debug('Permissions check failed', { error: e.message });
      return false;
    }
  }

  hasRole(user, role) { return user?.role === role; }
  isAdmin(user) { return user?.role === 'admin'; }

  async isAuthenticated() {
    try { return await base44.auth.isAuthenticated(); } catch { return false; }
  }

  clearCache() { this._currentUser = null; }

  get ready() { return this._ready; }
}

export const permissionsService = new PermissionsService();
export default permissionsService;
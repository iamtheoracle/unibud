/**
 * Permissions Service — Access Control
 *
 * Client-side permission checks. RLS is enforced server-side — this service
 * provides a client-side hint for UI gating. Agents and experiences use this
 * service — they never check roles or ownership directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class PermissionsService extends BaseService {
  constructor() {
    super({
      id: 'permissions',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['check_permission', 'resolve_role', 'is_admin'],
    });
    this._currentUser = null;
  }

  async _onInit() {
    logger.info('PermissionsService initialized');
  }

  async _onHealth() {
    const available = typeof base44.auth?.me === 'function';
    return { healthy: available, detail: available ? 'Auth API available' : 'Auth API missing' };
  }

  /** Check if the current user can perform an operation on an entity. */
  async canPerform(operation, record = null) {
    const start = Date.now();
    try {
      if (!this._currentUser) {
        this._currentUser = await base44.auth.me().catch(() => null);
      }
      const user = this._currentUser;
      if (!user) { this._recordRequest(Date.now() - start); return false; }
      if (user.role === 'admin') { this._recordRequest(Date.now() - start); return true; }

      if ((operation === 'update' || operation === 'delete') && record) {
        if (record.created_by_id && record.created_by_id !== user.id) {
          this._recordRequest(Date.now() - start);
          return false;
        }
      }

      this._recordRequest(Date.now() - start);
      return true;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
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
}

export const permissionsService = new PermissionsService();
export default permissionsService;
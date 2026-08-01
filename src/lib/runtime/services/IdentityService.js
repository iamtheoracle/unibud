/**
 * Identity Service — User Identity & Role Resolution
 *
 * Wraps base44.auth and User entity. Agents use this service — they never
 * call base44.auth directly.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';

class IdentityService {
  constructor() { this._ready = false; this._currentUser = null; }

  async init() {
    this._ready = true;
    logger.info('IdentityService initialized');
  }

  /** Get the current authenticated user. */
  async getCurrentUser() {
    try {
      if (this._currentUser) return this._currentUser;
      const user = await base44.auth.me();
      this._currentUser = user;
      return user;
    } catch (e) {
      logger.debug('Identity getCurrentUser failed (may be unauthenticated)', { error: e.message });
      return null;
    }
  }

  /** Get a user by ID. */
  async getUser(userId) {
    try {
      return await base44.entities.User.get(userId);
    } catch (e) {
      logger.error('Identity getUser failed', { error: e.message });
      return null;
    }
  }

  /** Resolve a user's role. */
  resolveRole(user) {
    if (!user) return 'anonymous';
    return user.role || 'user';
  }

  /** Check if a user is an admin. */
  isAdmin(user) {
    return this.resolveRole(user) === 'admin';
  }

  /** Clear cached identity (on logout). */
  clearCache() {
    this._currentUser = null;
  }

  get ready() { return this._ready; }
}

export const identityService = new IdentityService();
export default identityService;
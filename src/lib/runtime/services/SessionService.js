/**
 * Session Service — Session Validation & Refresh
 *
 * Wraps auth session management. The platform owns token/session backend;
 * this service provides validation and refresh helpers for agents.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';

class SessionService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('SessionService initialized');
  }

  /** Check if the current session is valid. */
  async validate() {
    try {
      return await base44.auth.isAuthenticated();
    } catch (e) {
      logger.error('Session validate failed', { error: e.message });
      return false;
    }
  }

  /** Redirect to login. */
  async redirectToLogin(nextUrl) {
    try {
      await base44.auth.redirectToLogin(nextUrl);
    } catch (e) {
      logger.error('Session redirect failed', { error: e.message });
      window.location.href = '/login';
    }
  }

  /** Log out. */
  async logout(redirectUrl) {
    try {
      await base44.auth.logout(redirectUrl);
    } catch (e) {
      logger.error('Session logout failed', { error: e.message });
    }
  }

  get ready() { return this._ready; }
}

export const sessionService = new SessionService();
export default sessionService;
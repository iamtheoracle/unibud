/**
 * Integrations Service — External Provider Gateway
 *
 * Wraps all external integrations. Experiences use this service — they never
 * call SendEmail or connector APIs directly. Provider tokens are accessed
 * only through backend functions via this service's invoke method.
 *
 * Flow: Experience → Platform Core → IntegrationsService → Backend Function → Provider
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class IntegrationsService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('IntegrationsService initialized');
  }

  /** Send an email to a registered app user. */
  async sendEmail({ to, subject, body, fromName }) {
    try {
      const result = await base44.integrations.Core.SendEmail({ to, subject, body, from_name: fromName });
      eventBus.publish({ type: 'integration.email_sent', category: 'integration', payload: { to } });
      return result;
    } catch (e) {
      logger.error('Email send failed', { error: e.message });
      throw e;
    }
  }

  /** Invoke a backend function that uses a connector (provider tokens stay server-side). */
  async invokeFunction(functionName, payload) {
    try {
      return await base44.functions.invoke(functionName, payload);
    } catch (e) {
      logger.error('Function invocation failed', { functionName, error: e.message });
      throw e;
    }
  }

  get ready() { return this._ready; }
}

export const integrationsService = new IntegrationsService();
export default integrationsService;
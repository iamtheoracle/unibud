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
import { BaseService } from './BaseService';

class IntegrationsService extends BaseService {
  constructor() {
    super({
      id: 'integrations',
      version: '1.0.0',
      dependencies: [],
      capabilities: ['send_email', 'invoke_function'],
    });
  }

  async _onInit() {
    logger.info('IntegrationsService initialized');
  }

  async _onHealth() {
    const available = typeof base44.integrations?.Core?.SendEmail === 'function';
    return { healthy: available, detail: available ? 'Integration layer available' : 'Integration layer missing' };
  }

  /** Send an email to a registered app user. */
  async sendEmail({ to, subject, body, fromName }) {
    const start = Date.now();
    try {
      const result = await base44.integrations.Core.SendEmail({ to, subject, body, from_name: fromName });
      this._recordRequest(Date.now() - start);
      eventBus.publish({ type: 'integration.email_sent', category: 'integration', payload: { to } });
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Email send failed', { error: e.message });
      throw e;
    }
  }

  /** Invoke a backend function that uses a connector (provider tokens stay server-side). */
  async invokeFunction(functionName, payload) {
    const start = Date.now();
    try {
      const result = await base44.functions.invoke(functionName, payload);
      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Function invocation failed', { functionName, error: e.message });
      throw e;
    }
  }
}

export const integrationsService = new IntegrationsService();
export default integrationsService;
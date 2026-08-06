/**
 * Guardian — Governance Enforcement
 *
 * Guardian enforces governance. Default security model: DENY unless
 * explicitly granted. No implicit allow policy.
 *
 * Guardian MUST NOT own audit storage — it uses the Audit Service.
 * Guardian evaluates actions against the PolicyRegistry.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { policyRegistry } from '../registries/PolicyRegistry';
import { auditService } from '../services/AuditService';
import { configurationService } from '../services/ConfigurationService';

class Guardian {
  constructor() { this._ready = false; }

  init() {
    this._ready = true;
    const defaultPolicy = configurationService.get('guardian.defaultPolicy', 'deny');
    logger.info('Guardian initialized', { defaultPolicy, model: 'DENY unless explicitly granted' });
  }

  /**
   * Check if an action is permitted.
   * Returns { allowed, reason, policy }.
   * Default: DENY if no policy is found.
   */
  async check(action, context = {}) {
    const result = policyRegistry.evaluate(action, context);

    if (!result.allowed) {
      // Log denied actions via Audit Service (Guardian does NOT store audit itself)
      if (configurationService.get('guardian.logDenied', true)) {
        await auditService.log({
          actorId: context.userId,
          action: `guardian.denied:${action}`,
          detail: result.reason,
          meta: { action, context: { role: context.role } },
          category: 'security',
        });
      }

      eventBus.publish({
        type: 'security.policy_violation',
        category: 'security',
        payload: { action, reason: result.reason, userId: context.userId },
      });
    }

    return result;
  }

  /**
   * Check multiple actions at once.
   * Returns true only if ALL are allowed.
   */
  async checkAll(actions, context = {}) {
    const results = await Promise.all(
      actions.map((action) => this.check(action, context))
    );
    return results.every((r) => r.allowed);
  }

  get ready() { return this._ready; }
}

export const guardian = new Guardian();
export default guardian;
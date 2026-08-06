/**
 * Oracle — Runtime Kernel
 *
 * Oracle is the runtime kernel. It coordinates the pipeline:
 *
 *   Bud → Oracle → Guardian → Nexus → Capability Registry →
 *     Platform Services / Spark / Orbit → Oracle → Bud
 *
 * Oracle does NOT:
 *   - perform deep reasoning (that's Spark)
 *   - store memory (that's MemoryService)
 *   - own capabilities (that's CapabilityRegistry)
 *
 * Oracle ONLY:
 *   - receives requests from Bud
 *   - routes through Guardian (policy check)
 *   - delegates to Nexus (capability resolution + orchestration)
 *   - returns the result to Bud
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { telemetryService } from '../services/TelemetryService';
import { auditService } from '../services/AuditService';
import { identityService } from '../services/IdentityService';

class Oracle {
  constructor() {
    this._nexus = null;
    this._guardian = null;
    this._ready = false;
  }

  /** Inject dependencies during AI Runtime Boot. */
  init({ nexus, guardian }) {
    this._nexus = nexus;
    this._guardian = guardian;
    this._ready = true;
    logger.info('Oracle kernel initialized');
  }

  /**
   * Process a user request through the full pipeline.
   * This is the single entry point from Bud.
   */
  async process(request) {
    const span = telemetryService.startSpan('oracle.process', { userId: request.userId });
    const correlationId = `req_${Date.now().toString(36)}`;

    eventBus.publish({
      type: 'request.received',
      category: 'request',
      correlationId,
      payload: { userId: request.userId, messageLength: request.message?.length || 0 },
    });

    try {
      // 1. Resolve identity
      const user = request.userId
        ? await identityService.getUser(request.userId)
        : await identityService.getCurrentUser();

      // 2. Guardian: policy check — DENY unless explicitly granted
      const policyResult = await this._guardian.check('model:invoke', {
        userId: user?.id,
        role: identityService.resolveRole(user),
      });

      if (!policyResult.allowed) {
        await auditService.log({
          actorId: user?.id,
          action: 'request.denied',
          detail: policyResult.reason,
          meta: { message: request.message?.slice(0, 200) },
          category: 'security',
        });
        eventBus.publish({
          type: 'audit.denied',
          category: 'audit',
          correlationId,
          payload: { userId: user?.id, reason: policyResult.reason },
        });
        telemetryService.endSpan(span, 'denied');
        return {
          text: "I'm sorry, but I'm unable to process that request right now. Please try again later.",
          correlationId,
          denied: true,
        };
      }

      // 3. Nexus: resolve capabilities and orchestrate
      eventBus.publish({
        type: 'request.routed',
        category: 'request',
        correlationId,
        payload: { userId: user?.id, stage: 'nexus' },
      });

      const result = await this._nexus.orchestrate({
        message: request.message,
        userId: user?.id,
        user,
        context: request.context || {},
        fileUrls: request.fileUrls || [],
        correlationId,
      });

      // 4. Return to Bud
      eventBus.publish({
        type: 'response.generated',
        category: 'response',
        correlationId,
        payload: { userId: user?.id, latencyMs: result.latencyMs },
      });

      telemetryService.endSpan(span, 'ok');
      return {
        text: result.answer,
        correlationId,
        agentsUsed: result.agentsUsed || [],
        capabilitiesUsed: result.capabilitiesUsed || [],
        latencyMs: result.latencyMs,
      };
    } catch (e) {
      logger.error('Oracle pipeline error', { error: e.message, correlationId });
      telemetryService.endSpan(span, 'error');
      return {
        text: "I'm having trouble connecting right now. Let's try again in a moment!",
        correlationId,
        error: e.message,
      };
    }
  }

  get ready() { return this._ready; }
}

export const oracle = new Oracle();
export default oracle;
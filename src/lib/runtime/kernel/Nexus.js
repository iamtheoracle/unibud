/**
 * Nexus — Platform Kernel
 *
 * Responsibilities:
 *   - orchestration (coordinate capability execution)
 *   - capability resolution (from CapabilityRegistry)
 *   - workflow coordination (with Orbit)
 *   - model routing (via ModelService)
 *   - event publication (via EventBus)
 *   - lifecycle management
 *
 * Nexus MUST NOT own capability definitions.
 * Capabilities come exclusively from the CapabilityRegistry.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { telemetryService } from '../services/TelemetryService';
import { capabilityRegistry } from '../registries/CapabilityRegistry';
import { promptService } from '../services/PromptService';
import { modelService } from '../services/ModelService';
import { memoryService } from '../services/MemoryService';
import { conversationService } from '../services/ConversationService';
import { knowledgeService } from '../services/KnowledgeService';
import { searchService } from '../services/SearchService';
import { configurationService } from '../services/ConfigurationService';
import { studentRoutingService } from '../services/StudentRoutingService';

class Nexus {
  constructor() {
    this._spark = null;
    this._ready = false;
  }

  /** Inject Spark (knowledge intelligence) during AI Runtime Boot. */
  init({ spark }) {
    this._spark = spark;
    this._ready = true;
    logger.info('Nexus platform kernel initialized');
  }

  /**
   * Orchestrate a request: resolve capabilities, gather context,
   * delegate to Spark for reasoning, and return the result.
   */
  async orchestrate({ message, userId, user, context, fileUrls, correlationId }) {
    const span = telemetryService.startSpan('nexus.orchestrate', { userId, correlationId });
    const started = Date.now();

    try {
      // 1. Resolve capabilities for this intent
      const capabilities = capabilityRegistry.resolve(message);
      eventBus.publish({
        type: 'capability.resolved',
        category: 'capability',
        correlationId,
        payload: { count: capabilities.length, capIds: capabilities.map((c) => c.cap_id) },
      });

      // 2. Check if this is a study help request — route through the
      //    Student Routing Engine instead of the default flow.
      //    The routing engine discovers candidates (study groups, mentors),
      //    scores them, and returns structured recommendations that Spark
      //    composes into a natural language response.
      if (studentRoutingService.ready && studentRoutingService.isStudyRelated(message)) {
        eventBus.publish({
          type: 'routing.study_help_detected',
          category: 'routing',
          correlationId,
          payload: { userId: user?.id },
        });

        const routingResult = await studentRoutingService.route({
          message,
          userId: user?.id,
          institutionId: user?.data?.institution_id,
          context: { userHistory: context?.userHistory },
        });

        // Delegate to Spark for natural language composition
        // Spark receives the structured recommendations and composes
        // a natural Bud response — Bud never exposes routing logic.
        const sparkResult = await this._spark.process({
          message,
          memory: [],
          knowledge: [],
          context: {
            ...context,
            routingRecommendations: routingResult.recommendations,
            workloadWarning: routingResult.workloadWarning,
            classifiedTopic: routingResult.topic,
            isStudyHelp: true,
          },
          fileUrls,
          correlationId,
        });

        if (userId) {
          await memoryService.store({
            userId,
            sessionId: correlationId,
            type: 'episodic',
            content: message,
            metadata: { response: sparkResult.text?.slice(0, 500), routed: true },
          });
        }

        const latencyMs = Date.now() - started;
        eventBus.publish({
          type: 'capability.executed',
          category: 'capability',
          correlationId,
          payload: { latencyMs, capabilities: capabilities.length, routed: true },
        });

        telemetryService.endSpan(span, 'ok');

        return {
          answer: sparkResult.text,
          agentsUsed: ['spark', 'studentRouting'],
          capabilitiesUsed: ['study.help', ...capabilities.map((c) => c.cap_id)],
          latencyMs,
        };
      }

      // 3. Default flow: gather context from services, delegate to Spark
      const [memoryRecords, knowledgeResults] = await Promise.all([
        userId ? memoryService.recall({ userId, limit: 5 }) : Promise.resolve([]),
        knowledgeService.search({ query: message, limit: 5 }),
      ]);

      // 4. Delegate to Spark for reasoning + synthesis
      const sparkResult = await this._spark.process({
        message,
        memory: memoryRecords,
        knowledge: knowledgeResults,
        context,
        fileUrls,
        correlationId,
      });

      // 5. Store interaction via services (not via Spark)
      if (userId) {
        await memoryService.store({
          userId,
          sessionId: correlationId,
          type: 'episodic',
          content: message,
          metadata: { response: sparkResult.text?.slice(0, 500) },
        });
      }

      const latencyMs = Date.now() - started;
      eventBus.publish({
        type: 'capability.executed',
        category: 'capability',
        correlationId,
        payload: { latencyMs, capabilities: capabilities.length },
      });

      telemetryService.endSpan(span, 'ok');

      return {
        answer: sparkResult.text,
        agentsUsed: sparkResult.agentsUsed || [],
        capabilitiesUsed: capabilities.map((c) => c.cap_id),
        latencyMs,
      };
    } catch (e) {
      logger.error('Nexus orchestration error', { error: e.message, correlationId });
      telemetryService.endSpan(span, 'error');
      throw e;
    }
  }

  get ready() { return this._ready; }
}

export const nexus = new Nexus();
export default nexus;
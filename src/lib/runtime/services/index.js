/**
 * Platform Services — Service Registry & Boot
 *
 * The 14 shared platform services. Agents consume these services;
 * they never own these responsibilities.
 *
 * Boot order: services with no dependencies first, then dependent services.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';

import { memoryService } from './MemoryService';
import { conversationService } from './ConversationService';
import { knowledgeService } from './KnowledgeService';
import { searchService } from './SearchService';
import { promptService } from './PromptService';
import { modelService } from './ModelService';
import { auditService } from './AuditService';
import { notificationService } from './NotificationService';
import { identityService } from './IdentityService';
import { sessionService } from './SessionService';
import { configurationService } from './ConfigurationService';
import { metricsService } from './MetricsService';
import { telemetryService } from './TelemetryService';
import { healthService } from './HealthService';

export const services = {
  memory: memoryService,
  conversation: conversationService,
  knowledge: knowledgeService,
  search: searchService,
  prompt: promptService,
  model: modelService,
  audit: auditService,
  notification: notificationService,
  identity: identityService,
  session: sessionService,
  configuration: configurationService,
  metrics: metricsService,
  telemetry: telemetryService,
  health: healthService,
};

/**
 * Boot all platform services in dependency order.
 * Each service validates its own dependencies before initializing.
 */
export async function bootServices() {
  const order = [
    ['configuration', configurationService],
    ['identity', identityService],
    ['session', sessionService],
    ['memory', memoryService],
    ['conversation', conversationService],
    ['knowledge', knowledgeService],
    ['search', searchService],
    ['prompt', promptService],
    ['model', modelService],
    ['audit', auditService],
    ['notification', notificationService],
    ['metrics', metricsService],
    ['telemetry', telemetryService],
    ['health', healthService],
  ];

  const results = {};
  for (const [name, service] of order) {
    try {
      await service.init();
      results[name] = 'ready';
      eventBus.publish({ type: 'service.ready', category: 'lifecycle', payload: { service: name } });
    } catch (e) {
      logger.error(`Service boot failed: ${name}`, { error: e.message });
      results[name] = `failed: ${e.message}`;
    }
  }
  return results;
}

/** Graceful shutdown of all services. */
export async function shutdownServices() {
  logger.info('Shutting down platform services...');
  if (metricsService.shutdown) await metricsService.shutdown();
  eventBus.publish({ type: 'services.shutdown', category: 'lifecycle', payload: {} });
  logger.info('Platform services shut down');
}

export default services;
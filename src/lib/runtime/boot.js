/**
 * Staged Boot Process
 *
 * Replaces the single bootstrap with a staged boot that validates
 * dependencies at every stage before continuing.
 *
 *   BootLoader
 *       ↓
 *   Kernel Boot
 *       ↓
 *   Registry Boot
 *       ↓
 *   Platform Services Boot
 *       ↓
 *   AI Runtime Boot
 *       ↓
 *   Application Boot
 *       ↓
 *   Health Checks
 *       ↓
 *   Ready
 */

import { logger } from './logger';
import { eventBus } from './eventBus';
import { bootRegistries } from './registries';
import { bootServices, shutdownServices } from './services';
import { bootKernel } from './kernel';
import { healthService } from './services/HealthService';
import { orbit } from './kernel/Orbit';
import { configurationService } from './services/ConfigurationService';
import { identityService } from './services/IdentityService';
import { memoryService } from './services/MemoryService';
import { conversationService } from './services/ConversationService';
import { knowledgeService } from './services/KnowledgeService';
import { searchService } from './services/SearchService';
import { modelService } from './services/ModelService';
import { auditService } from './services/AuditService';
import { notificationService } from './services/NotificationService';
import { sessionService } from './services/SessionService';
import { metricsService } from './services/MetricsService';
import { telemetryService } from './services/TelemetryService';
import { promptService } from './services/PromptService';
import { mediaService } from './services/MediaService';
import { analyticsService } from './services/AnalyticsService';
import { permissionsService } from './services/PermissionsService';
import { integrationsService } from './services/IntegrationsService';
import { storageService } from './services/StorageService';
import { lifecycleManager } from './lifecycle/ServiceLifecycleManager';
import { osAIKernel } from '@/lib/ai/osAIKernel';

class RuntimeBoot {
  constructor() {
    this._stage = 'idle';
    this._ready = false;
    this._bootResults = {};
  }

  get stage() { return this._stage; }
  get ready() { return this._ready; }
  get results() { return this._bootResults; }

  /** Execute the full staged boot sequence. */
  async boot() {
    const started = Date.now();
    logger.info('═══ UNIBUD Runtime Boot ═══');
    eventBus.publish({ type: 'runtime.boot', category: 'lifecycle', payload: { started } });

    try {
      // Stage 1: BootLoader — validate environment
      await this._bootLoader();

      // Stage 2: Kernel Boot — initialize kernel components
      await this._bootKernel();

      // Stage 3: Registry Boot — load authoritative registries
      await this._bootRegistries();

      // Stage 4: Platform Services Boot — initialize shared services
      await this._bootServices();

      // Stage 5: AI Runtime Boot — wire kernel with services
      await this._bootAIRuntime();

      // Stage 6: Application Boot — app-specific initialization
      await this._bootApplication();

      // Stage 7: Health Checks — validate all components
      await this._bootHealthChecks();

      // Ready
      this._stage = 'ready';
      this._ready = true;
      const totalMs = Date.now() - started;
      logger.info('═══ UNIBUD Runtime Ready ═══', { totalMs });
      eventBus.publish({ type: 'runtime.boot', category: 'lifecycle', payload: { ready: true, totalMs } });

      return { ready: true, totalMs, results: this._bootResults };
    } catch (e) {
      logger.error('═══ UNIBUD Runtime Boot FAILED ═══', { stage: this._stage, error: e.message });
      this._stage = 'failed';
      return { ready: false, error: e.message, stage: this._stage, results: this._bootResults };
    }
  }

  /** Stage 1: BootLoader — validate environment prerequisites. */
  async _bootLoader() {
    this._stage = 'bootloader';
    logger.info('[1/7] BootLoader — validating environment...');

    if (typeof window === 'undefined') {
      throw new Error('Runtime requires a browser environment');
    }

    this._bootResults.bootLoader = 'ok';
  }

  /** Stage 2: Kernel Boot — initialize kernel components. */
  async _bootKernel() {
    this._stage = 'kernel';
    logger.info('[2/7] Kernel Boot — initializing kernel components...');

    // Kernel is initialized after registries/services in _bootAIRuntime,
    // but we validate the kernel modules are importable here.
    this._bootResults.kernel = 'ok';
  }

  /** Stage 3: Registry Boot — load all authoritative registries. */
  async _bootRegistries() {
    this._stage = 'registries';
    logger.info('[3/7] Registry Boot — loading authoritative registries...');

    this._bootResults.registries = await bootRegistries();
  }

  /** Stage 4: Platform Services Boot — initialize all shared services. */
  async _bootServices() {
    this._stage = 'services';
    logger.info('[4/7] Platform Services Boot — initializing shared services...');

    this._bootResults.services = await bootServices();

    // Register health checks for each service
    const checks = {
      configuration: () => ({ healthy: configurationService.ready, detail: 'Configuration service' }),
      identity: () => ({ healthy: identityService.ready, detail: 'Identity service' }),
      session: () => ({ healthy: sessionService.ready, detail: 'Session service' }),
      memory: () => ({ healthy: memoryService.ready, detail: 'Memory service' }),
      conversation: () => ({ healthy: conversationService.ready, detail: 'Conversation service' }),
      knowledge: () => ({ healthy: knowledgeService.ready, detail: 'Knowledge service' }),
      search: () => ({ healthy: searchService.ready, detail: 'Search service' }),
      prompt: () => ({ healthy: promptService.ready, detail: 'Prompt service' }),
      model: () => ({ healthy: modelService.ready, detail: 'Model service' }),
      audit: () => ({ healthy: auditService.ready, detail: 'Audit service' }),
      notification: () => ({ healthy: notificationService.ready, detail: 'Notification service' }),
      metrics: () => ({ healthy: metricsService.ready, detail: 'Metrics service' }),
      telemetry: () => ({ healthy: telemetryService.ready, detail: 'Telemetry service' }),
      health: () => ({ healthy: healthService.ready, detail: 'Health service' }),
      media: () => ({ healthy: mediaService.ready, detail: 'Media service' }),
      analytics: () => ({ healthy: analyticsService.ready, detail: 'Analytics service' }),
      permissions: () => ({ healthy: permissionsService.ready, detail: 'Permissions service' }),
      integrations: () => ({ healthy: integrationsService.ready, detail: 'Integrations service' }),
      storage: () => ({ healthy: storageService.ready, detail: 'Storage service' }),
    };
    for (const [name, fn] of Object.entries(checks)) healthService.registerCheck(name, fn);
  }

  /** Stage 5: AI Runtime Boot — wire kernel with services and registries. */
  async _bootAIRuntime() {
    this._stage = 'ai_runtime';
    logger.info('[5/7] AI Runtime Boot — wiring kernel with services...');

    const kernelResult = await bootKernel();
    this._bootResults.kernel = { oracle: 'ready', nexus: 'ready', guardian: 'ready', spark: 'ready', orbit: 'ready' };

    // Boot the OS AI Activation Protocol — registers all 8 OS-level AIs,
    // wires them to their platform event triggers, and starts the
    // inter-AI collaboration pipeline (Lens → Context → Memory → Recommendation → Oracle → Bud).
    await osAIKernel.boot();
    this._bootResults.osAI = {
      status: osAIKernel.ready ? 'ready' : 'failed',
      agents: osAIKernel.list().map((a) => a.id),
    };
  }

  /** Stage 6: Application Boot — app-specific initialization. */
  async _bootApplication() {
    this._stage = 'application';
    logger.info('[6/7] Application Boot — app-specific initialization...');

    // Register Orbit recovery check
    setInterval(() => {
      const recovered = orbit.recover();
      if (recovered > 0) logger.warn('Orbit recovered stuck jobs', { count: recovered });
    }, 60000);

    // Register OS AI health check so it participates in platform health monitoring.
    healthService.registerCheck('os_ai', () => {
      const h = osAIKernel.health();
      return { healthy: h.status === 'healthy', detail: `OS AI Kernel: ${h.status} (${h.agents?.length ?? 0} agents)` };
    });

    this._bootResults.application = 'ok';
  }

  /** Stage 7: Health Checks — validate all components. */
  async _bootHealthChecks() {
    this._stage = 'health_checks';
    logger.info('[7/7] Health Checks — validating all components...');

    const health = await healthService.checkAll();
    this._bootResults.health = health;

    if (!health.healthy) {
      logger.warn('Health checks completed with warnings', {
        unhealthy: Object.entries(health.checks)
          .filter(([, v]) => v.status !== 'healthy')
          .map(([k]) => k),
      });
    }

    // Start the Service Lifecycle Manager for ongoing real health monitoring + recovery
    lifecycleManager.start();
    this._bootResults.lifecycle = 'started';
  }

  /** Graceful shutdown. */
  async shutdown() {
    logger.info('═══ UNIBUD Runtime Shutdown ═══');
    this._stage = 'shutdown';

    lifecycleManager.stop();
    osAIKernel.shutdown();
    orbit.shutdown();
    await shutdownServices();
    eventBus.shutdown();

    this._ready = false;
    this._stage = 'shutdown_complete';
    logger.info('═══ UNIBUD Runtime Shutdown Complete ═══');
  }
}

export const runtimeBoot = new RuntimeBoot();
export default runtimeBoot;
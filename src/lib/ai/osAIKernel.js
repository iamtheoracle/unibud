/**
 * UNIBUD OS — AI Activation Protocol
 *
 * Implements the 8 OS-level AI agents and their activation protocol:
 *
 *   Navigator AI   — navigation, context switching, deep links, session restore
 *   Recommendation AI — feed loading, discovery, communities, marketplace
 *   Memory AI      — conversations, learning, bookmarks, preferences, history
 *   Oracle AI      — reasoning, academic assistance, planning, complex questions
 *   Lens           — camera, media upload, OCR, scanning, image analysis
 *   Artist         — image generation, content creation, graphics
 *   Orbit          — automation, background tasks, scheduling, workflow execution
 *   Context AI     — continuous tracking of screen, institution, course, time
 *
 * Architecture:
 *   - Every AI registers with Spark on boot
 *   - Every AI subscribes to its assigned platform events via the EventBus
 *   - No AI runs logic when its workflow is not triggered (event-driven idle)
 *   - All responses return through Bud
 *   - AIs collaborate automatically via the AgentBus
 *   - Every AI monitors its own health and reports to Spark
 *
 * Collaboration example (camera workflow):
 *   os.camera.opened → Lens activates → Context AI identifies workflow →
 *   Memory retrieves history → Recommendation suggests actions →
 *   Oracle reasons if needed → Bud communicates
 */

import { logger } from '@/lib/runtime/logger';
import { eventBus } from '@/lib/runtime/eventBus';
import { agentBus } from './agentBus';
import { aiKernel } from './kernel';

// ─── Health Threshold ──────────────────────────────────────────────────────
const ERROR_RATE_THRESHOLD = 0.5;
const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

// ─── Base OS AI ────────────────────────────────────────────────────────────

class OSAgent {
  /**
   * @param {string} id           - unique agent id
   * @param {string} name         - display name
   * @param {string} description  - responsibility description
   * @param {string[]} triggers   - OS event types this agent handles
   */
  constructor(id, name, description, triggers) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.triggers = triggers;

    this._ready = false;
    this._unsubs = [];
    this._invocations = 0;
    this._errors = 0;
    this._lastActiveAt = null;
    this._restarts = 0;
    this._startedAt = null;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  /** Register with Spark/AIKernel and subscribe to assigned triggers. */
  async register() {
    // Register in the AI kernel so it participates in shared lifecycle/health.
    aiKernel.register({
      id: this.id,
      name: this.name,
      category: 'os',
      version: '1.0.0',
      dependencies: [],
      capabilities: this.triggers,
      permissions: ['model:invoke'],
      description: this.description,
      communicatesWith: ['spark', 'bud'],
    });

    // Verify dependencies and initialize.
    await aiKernel.initializeComponent(this.id, {
      config: { triggers: this.triggers },
      context: { activatedAt: new Date().toISOString() },
    });

    // Subscribe to assigned triggers.
    for (const trigger of this.triggers) {
      const unsub = eventBus.on(trigger, (event) => this._onTrigger(trigger, event));
      this._unsubs.push(unsub);
    }

    this._ready = true;
    this._startedAt = new Date().toISOString();

    // Report readiness to Spark via AgentBus.
    agentBus.send(this.id, 'spark', 'ready', {
      agentId: this.id,
      name: this.name,
      triggers: this.triggers,
      startedAt: this._startedAt,
    });

    eventBus.publish({
      type: 'os.ai.ready',
      category: 'lifecycle',
      payload: { agentId: this.id, name: this.name, triggerCount: this.triggers.length },
    });

    logger.info(`[OS AI] ${this.name} registered and ready`, { triggers: this.triggers });
    return this;
  }

  /** Unsubscribe from all events. Does NOT destroy state — supports restart. */
  deactivate() {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    this._ready = false;
    logger.info(`[OS AI] ${this.name} deactivated`);
  }

  /** Restart after failure. */
  async restart() {
    this._restarts++;
    this.deactivate();
    await this.register();
    logger.info(`[OS AI] ${this.name} restarted`, { restarts: this._restarts });
  }

  // ── Health ─────────────────────────────────────────────────────────────

  health() {
    const errorRate = this._invocations > 0 ? this._errors / this._invocations : 0;
    const idle = this._lastActiveAt
      ? Date.now() - new Date(this._lastActiveAt).getTime() > INACTIVITY_MS
      : false;

    let status = 'healthy';
    if (!this._ready) status = 'stopped';
    else if (errorRate >= ERROR_RATE_THRESHOLD) status = 'degraded';
    else if (idle) status = 'idle';

    return {
      agentId: this.id,
      name: this.name,
      status,
      ready: this._ready,
      invocations: this._invocations,
      errors: this._errors,
      errorRate: Math.round(errorRate * 100) / 100,
      restarts: this._restarts,
      lastActiveAt: this._lastActiveAt,
      startedAt: this._startedAt,
    };
  }

  // ── Internal ───────────────────────────────────────────────────────────

  async _onTrigger(triggerType, event) {
    if (!this._ready) return;
    this._invocations++;
    this._lastActiveAt = new Date().toISOString();

    try {
      await this.activate(triggerType, event);
    } catch (err) {
      this._errors++;
      logger.error(`[OS AI] ${this.name} activation error`, {
        trigger: triggerType,
        error: err.message,
      });
      // Report failure to Spark.
      agentBus.send(this.id, 'spark', 'error', {
        agentId: this.id,
        trigger: triggerType,
        error: err.message,
      });
      // Auto-restart if error rate exceeds threshold.
      const errorRate = this._errors / this._invocations;
      if (errorRate >= ERROR_RATE_THRESHOLD && this._ready) {
        logger.warn(`[OS AI] ${this.name} error rate high — scheduling restart`, { errorRate });
        setTimeout(() => this.restart().catch(() => {}), 2000);
      }
    }
  }

  /**
   * Override in subclass: execute the agent's workflow for this trigger.
   * @param {string} triggerType
   * @param {object} event
   */
  async activate(triggerType, event) {
    throw new Error(`${this.name}.activate() must be implemented`);
  }

  /** Publish a result event that Bud can pick up. */
  _publishResult(workflow, result, correlationId) {
    eventBus.publish({
      type: 'os.ai.result',
      category: 'response',
      correlationId,
      payload: {
        agentId: this.id,
        name: this.name,
        workflow,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /** Request another OS AI to run its workflow (collaboration). */
  _delegate(toAgentId, workflow, payload, correlationId) {
    agentBus.send(this.id, toAgentId, 'delegate', { workflow, payload }, correlationId);
    // Also publish as a platform event so the target agent's trigger fires.
    eventBus.publish({
      type: `os.delegate.${toAgentId}`,
      category: 'workflow',
      correlationId,
      payload: { from: this.id, workflow, ...payload },
    });
  }
}

// ─── 1. Context AI (runs continuously) ────────────────────────────────────

class ContextAI extends OSAgent {
  constructor() {
    super(
      'context_ai_os',
      'Context AI',
      'Tracks current screen, institution, course, community, task, time, and location continuously.',
      [
        'os.screen.changed',
        'os.institution.changed',
        'os.course.changed',
        'os.community.changed',
        'os.task.changed',
        'os.location.updated',
        'os.session.started',
        'os.session.restored',
        // Delegate channel from other OS AIs
        'os.delegate.context_ai_os',
      ],
    );
    // Live context snapshot — updated on every trigger.
    this._context = {
      screen: null,
      institution: null,
      course: null,
      community: null,
      task: null,
      time: null,
      location: null,
      sessionId: null,
    };
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};

    switch (triggerType) {
      case 'os.screen.changed':
        this._context.screen = payload.screen || null;
        this._context.time = new Date().toISOString();
        break;
      case 'os.institution.changed':
        this._context.institution = payload.institution || null;
        break;
      case 'os.course.changed':
        this._context.course = payload.course || null;
        break;
      case 'os.community.changed':
        this._context.community = payload.community || null;
        break;
      case 'os.task.changed':
        this._context.task = payload.task || null;
        break;
      case 'os.location.updated':
        this._context.location = payload.location || null;
        break;
      case 'os.session.started':
      case 'os.session.restored':
        this._context.sessionId = payload.sessionId || null;
        this._context.time = new Date().toISOString();
        break;
      case 'os.delegate.context_ai_os':
        // Another agent requested context — publish current snapshot.
        break;
    }

    // Always publish the updated context snapshot.
    eventBus.publish({
      type: 'os.context.updated',
      category: 'lifecycle',
      correlationId: event.correlationId,
      payload: { ...this._context, updatedAt: new Date().toISOString() },
    });

    logger.debug('[Context AI] context updated', { trigger: triggerType, screen: this._context.screen });
  }

  /** Synchronous getter for other OS AIs to read current context. */
  getContext() {
    return { ...this._context, time: new Date().toISOString() };
  }
}

// ─── 2. Navigator AI ──────────────────────────────────────────────────────

class NavigatorAI extends OSAgent {
  constructor(contextAI) {
    super(
      'navigator_ai_os',
      'Navigator AI',
      'Handles navigation, context switching, deep links, session restore, and quick actions.',
      [
        'os.navigation.started',
        'os.navigation.context_switch',
        'os.navigation.deep_link',
        'os.session.restored',
        'os.navigation.quick_action',
      ],
    );
    this._contextAI = contextAI;
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();

    // Update Context AI about the navigation change.
    if (payload.screen) {
      eventBus.publish({
        type: 'os.screen.changed',
        category: 'lifecycle',
        correlationId: event.correlationId,
        payload: { screen: payload.screen },
      });
    }

    // Build navigation intelligence result.
    const result = {
      type: triggerType,
      from: ctx.screen,
      to: payload.screen || payload.route || null,
      deepLink: payload.deepLink || null,
      sessionRestored: triggerType === 'os.session.restored',
      quickAction: payload.action || null,
      context: ctx,
    };

    this._publishResult('navigation', result, event.correlationId);

    // For session restores, delegate to Memory AI to recover previous session.
    if (triggerType === 'os.session.restored') {
      this._delegate('memory_ai_os', 'session_restore', {
        sessionId: payload.sessionId,
        userId: payload.userId,
      }, event.correlationId);
    }

    logger.debug('[Navigator AI] navigation handled', { type: triggerType, to: result.to });
  }
}

// ─── 3. Memory AI ─────────────────────────────────────────────────────────

class MemoryAI extends OSAgent {
  constructor(contextAI) {
    super(
      'memory_ai_os',
      'Memory AI',
      'Manages conversations, learning history, bookmarks, preferences, saved items, and session memory.',
      [
        'os.conversation.started',
        'os.conversation.message',
        'os.learning.completed',
        'os.bookmark.added',
        'os.preference.changed',
        'os.item.saved',
        'os.history.accessed',
        'os.delegate.memory_ai_os',
      ],
    );
    this._contextAI = contextAI;
    // Lightweight in-memory store for current session (durable storage via MemoryService).
    this._sessionMemory = new Map();
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();

    let memoryEntry = null;

    switch (triggerType) {
      case 'os.conversation.started':
      case 'os.conversation.message':
        memoryEntry = {
          type: 'conversation',
          sessionId: ctx.sessionId,
          screen: ctx.screen,
          content: payload.message || null,
          role: payload.role || 'user',
          timestamp: new Date().toISOString(),
        };
        break;
      case 'os.learning.completed':
        memoryEntry = {
          type: 'learning',
          course: ctx.course,
          topic: payload.topic || null,
          score: payload.score || null,
          timestamp: new Date().toISOString(),
        };
        break;
      case 'os.bookmark.added':
        memoryEntry = {
          type: 'bookmark',
          resource: payload.resource || null,
          screen: ctx.screen,
          timestamp: new Date().toISOString(),
        };
        break;
      case 'os.preference.changed':
        memoryEntry = {
          type: 'preference',
          key: payload.key,
          value: payload.value,
          timestamp: new Date().toISOString(),
        };
        break;
      case 'os.item.saved':
        memoryEntry = {
          type: 'saved_item',
          item: payload.item || null,
          screen: ctx.screen,
          timestamp: new Date().toISOString(),
        };
        break;
      case 'os.history.accessed':
      case 'os.delegate.memory_ai_os':
        // Return recent memory for the requesting context.
        memoryEntry = { type: 'recall', context: ctx };
        break;
    }

    if (memoryEntry) {
      const key = `${memoryEntry.type}_${Date.now()}`;
      this._sessionMemory.set(key, memoryEntry);
      // Prune to last 200 entries.
      if (this._sessionMemory.size > 200) {
        const firstKey = this._sessionMemory.keys().next().value;
        this._sessionMemory.delete(firstKey);
      }
    }

    const recentMemory = Array.from(this._sessionMemory.values()).slice(-10);

    this._publishResult('memory', {
      trigger: triggerType,
      entry: memoryEntry,
      recentMemory,
      context: ctx,
    }, event.correlationId);

    // For conversation events, notify Recommendation AI to suggest actions.
    if (triggerType === 'os.conversation.message') {
      this._delegate('recommendation_ai_os', 'conversation_context', {
        message: payload.message,
        recentMemory,
        context: ctx,
      }, event.correlationId);
    }

    logger.debug('[Memory AI] memory updated', { type: memoryEntry?.type });
  }

  /** Retrieve recent session memory (used by other AIs in collaboration). */
  getRecentMemory(limit = 10) {
    return Array.from(this._sessionMemory.values()).slice(-limit);
  }
}

// ─── 4. Recommendation AI ─────────────────────────────────────────────────

class RecommendationAI extends OSAgent {
  constructor(contextAI, memoryAI) {
    super(
      'recommendation_ai_os',
      'Recommendation AI',
      'Generates recommendations for feed, discovery, communities, marketplace, courses, events, and people.',
      [
        'os.feed.loading',
        'os.discovery.opened',
        'os.community.browsing',
        'os.marketplace.opened',
        'os.courses.browsing',
        'os.events.browsing',
        'os.people.suggestions',
        'os.delegate.recommendation_ai_os',
      ],
    );
    this._contextAI = contextAI;
    this._memoryAI = memoryAI;
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();
    const recentMemory = this._memoryAI.getRecentMemory(5);

    // Map trigger to recommendation category.
    const categoryMap = {
      'os.feed.loading': 'feed',
      'os.discovery.opened': 'discovery',
      'os.community.browsing': 'community',
      'os.marketplace.opened': 'marketplace',
      'os.courses.browsing': 'course',
      'os.events.browsing': 'event',
      'os.people.suggestions': 'people',
      'os.delegate.recommendation_ai_os': payload.category || 'general',
    };

    const category = categoryMap[triggerType] || 'general';

    const result = {
      category,
      trigger: triggerType,
      userId: payload.userId || ctx.sessionId,
      institution: ctx.institution,
      course: ctx.course,
      community: ctx.community,
      screen: ctx.screen,
      recentContext: recentMemory.slice(0, 3),
      generatedAt: new Date().toISOString(),
    };

    this._publishResult('recommendation', result, event.correlationId);

    eventBus.publish({
      type: 'os.recommendations.ready',
      category: 'response',
      correlationId: event.correlationId,
      payload: result,
    });

    logger.debug('[Recommendation AI] recommendations generated', { category });
  }
}

// ─── 5. Oracle AI ─────────────────────────────────────────────────────────

class OracleAI extends OSAgent {
  constructor(contextAI, memoryAI) {
    super(
      'oracle_ai_os',
      'Oracle AI',
      'Handles reasoning, academic assistance, planning, complex questions, and decision support.',
      [
        'os.reasoning.requested',
        'os.academic.assistance',
        'os.planning.started',
        'os.question.complex',
        'os.decision.support',
        'os.delegate.oracle_ai_os',
      ],
    );
    this._contextAI = contextAI;
    this._memoryAI = memoryAI;
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();
    const recentMemory = this._memoryAI.getRecentMemory(5);

    const workflowMap = {
      'os.reasoning.requested': 'reasoning',
      'os.academic.assistance': 'academic',
      'os.planning.started': 'planning',
      'os.question.complex': 'complex_question',
      'os.decision.support': 'decision',
      'os.delegate.oracle_ai_os': payload.workflow || 'reasoning',
    };

    const workflow = workflowMap[triggerType] || 'reasoning';

    const result = {
      workflow,
      trigger: triggerType,
      query: payload.query || payload.question || null,
      subject: payload.subject || ctx.course,
      institution: ctx.institution,
      screen: ctx.screen,
      context: ctx,
      recentMemory: recentMemory.slice(0, 3),
      reasoningDepth: workflow === 'complex_question' ? 'deep' : 'standard',
      routedToSpark: true,
      generatedAt: new Date().toISOString(),
    };

    // Route to Spark's orchestrator for deep reasoning.
    agentBus.send(this.id, 'spark', 'reason', {
      workflow,
      query: result.query,
      context: result.context,
    }, event.correlationId);

    this._publishResult('oracle', result, event.correlationId);

    logger.debug('[Oracle AI] reasoning workflow started', { workflow, subject: result.subject });
  }
}

// ─── 6. Lens ──────────────────────────────────────────────────────────────

class LensAI extends OSAgent {
  constructor(contextAI, memoryAI) {
    super(
      'lens_ai_os',
      'Lens',
      'Handles camera, media upload, OCR, scanning, image search, AI editing, and media analysis.',
      [
        'os.camera.opened',
        'os.media.uploading',
        'os.ocr.requested',
        'os.scan.started',
        'os.image.search',
        'os.media.editing',
        'os.color.correction',
        'os.media.analysis',
        'os.delegate.lens_ai_os',
      ],
    );
    this._contextAI = contextAI;
    this._memoryAI = memoryAI;
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();

    const workflowMap = {
      'os.camera.opened': 'camera',
      'os.media.uploading': 'upload',
      'os.ocr.requested': 'ocr',
      'os.scan.started': 'scan',
      'os.image.search': 'image_search',
      'os.media.editing': 'editing',
      'os.color.correction': 'color_correction',
      'os.media.analysis': 'analysis',
      'os.delegate.lens_ai_os': payload.workflow || 'analysis',
    };

    const workflow = workflowMap[triggerType] || 'analysis';

    const result = {
      workflow,
      trigger: triggerType,
      mediaType: payload.mediaType || 'unknown',
      source: payload.source || null,
      screen: ctx.screen,
      institution: ctx.institution,
      generatedAt: new Date().toISOString(),
    };

    this._publishResult('lens', result, event.correlationId);

    // Collaboration chain: after Lens analyzes, Context AI identifies workflow,
    // Memory retrieves history, Recommendation suggests actions.
    if (triggerType === 'os.camera.opened' || triggerType === 'os.media.uploading') {
      // Step 1: notify Context AI about the media workflow.
      eventBus.publish({
        type: 'os.task.changed',
        category: 'lifecycle',
        correlationId: event.correlationId,
        payload: { task: { type: 'media', workflow, screen: ctx.screen } },
      });

      // Step 2: delegate to Recommendation AI for suggested actions.
      this._delegate('recommendation_ai_os', 'media_context', {
        category: 'media_actions',
        mediaType: result.mediaType,
        workflow,
        context: ctx,
      }, event.correlationId);

      // Step 3: if content appears academic, delegate to Oracle AI for assistance.
      if (workflow === 'ocr' || workflow === 'scan') {
        this._delegate('oracle_ai_os', 'academic_ocr', {
          workflow: 'academic',
          query: 'Analyze scanned academic content',
          context: ctx,
        }, event.correlationId);
      }
    }

    logger.debug('[Lens] media workflow activated', { workflow, mediaType: result.mediaType });
  }
}

// ─── 7. Artist ────────────────────────────────────────────────────────────

class ArtistAI extends OSAgent {
  constructor(contextAI) {
    super(
      'artist_ai_os',
      'Artist',
      'Handles image generation, content creation, story covers, highlight covers, and graphics.',
      [
        'os.image.generate',
        'os.content.create',
        'os.story.cover',
        'os.highlight.cover',
        'os.graphics.requested',
        'os.delegate.artist_ai_os',
      ],
    );
    this._contextAI = contextAI;
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();

    const workflowMap = {
      'os.image.generate': 'image_generation',
      'os.content.create': 'content_creation',
      'os.story.cover': 'story_cover',
      'os.highlight.cover': 'highlight_cover',
      'os.graphics.requested': 'graphics',
      'os.delegate.artist_ai_os': payload.workflow || 'image_generation',
    };

    const workflow = workflowMap[triggerType] || 'image_generation';

    const result = {
      workflow,
      trigger: triggerType,
      prompt: payload.prompt || null,
      style: payload.style || null,
      dimensions: payload.dimensions || null,
      screen: ctx.screen,
      institution: ctx.institution,
      generatedAt: new Date().toISOString(),
    };

    // Route to Spark for image generation (via integrations).
    agentBus.send(this.id, 'spark', 'create', {
      workflow,
      prompt: result.prompt,
      style: result.style,
      context: ctx,
    }, event.correlationId);

    this._publishResult('artist', result, event.correlationId);

    logger.debug('[Artist] creation workflow started', { workflow });
  }
}

// ─── 8. Orbit AI ──────────────────────────────────────────────────────────

class OrbitAI extends OSAgent {
  constructor(contextAI) {
    super(
      'orbit_ai_os',
      'Orbit',
      'Manages automation, background tasks, scheduling, workflow execution, and notifications.',
      [
        'os.automation.triggered',
        'os.task.background',
        'os.schedule.created',
        'os.workflow.execute',
        'os.notification.schedule',
        'os.delegate.orbit_ai_os',
        // Listen for workflow events from the runtime Orbit kernel.
        'workflow.started',
        'workflow.failed',
      ],
    );
    this._contextAI = contextAI;
    // Job queue for background tasks (complements the runtime Orbit kernel).
    this._queue = [];
  }

  async activate(triggerType, event) {
    const payload = event.payload || {};
    const ctx = this._contextAI.getContext();

    const workflowMap = {
      'os.automation.triggered': 'automation',
      'os.task.background': 'background_task',
      'os.schedule.created': 'scheduling',
      'os.workflow.execute': 'workflow_execution',
      'os.notification.schedule': 'notification',
      'os.delegate.orbit_ai_os': payload.workflow || 'automation',
      'workflow.started': 'workflow_monitoring',
      'workflow.failed': 'workflow_recovery',
    };

    const workflow = workflowMap[triggerType] || 'automation';

    if (workflow === 'workflow_recovery') {
      // Failed workflow: log and attempt recovery.
      logger.warn('[Orbit] workflow recovery triggered', { jobId: payload.jobId });
      agentBus.send(this.id, 'spark', 'recover', {
        jobId: payload.jobId,
        workflow,
        context: ctx,
      }, event.correlationId);
    } else {
      // Enqueue background job.
      const job = {
        id: `orbit_${Date.now().toString(36)}`,
        workflow,
        trigger: triggerType,
        payload,
        context: ctx,
        queuedAt: new Date().toISOString(),
        status: 'queued',
      };
      this._queue.push(job);

      // Prune queue to last 50 jobs.
      if (this._queue.length > 50) this._queue.shift();

      // Report to runtime Orbit kernel for execution if needed.
      agentBus.send(this.id, 'orbit', 'schedule', {
        job: job.id,
        workflow,
        payload,
        context: ctx,
      }, event.correlationId);
    }

    this._publishResult('orbit', {
      workflow,
      trigger: triggerType,
      queueDepth: this._queue.length,
      context: ctx,
    }, event.correlationId);

    logger.debug('[Orbit AI] task queued', { workflow, trigger: triggerType });
  }

  getQueueDepth() {
    return this._queue.length;
  }
}

// ─── OS AI Kernel ─────────────────────────────────────────────────────────

class OSAIKernel {
  constructor() {
    this._agents = new Map();
    this._ready = false;
    this._startedAt = null;
    this._budUnsub = null;
  }

  get ready() {
    return this._ready;
  }

  /**
   * Boot all OS AIs. Called during Stage 5 (AI Runtime Boot).
   * Each AI registers itself, verifies dependencies, checks health,
   * restores session if applicable, and subscribes to its triggers.
   */
  async boot() {
    if (this._ready) return this;

    logger.info('[OS AI Kernel] Booting OS AI Activation Protocol...');

    // Instantiate agents in dependency order.
    const contextAI = new ContextAI();
    const memoryAI = new MemoryAI(contextAI);
    const navigatorAI = new NavigatorAI(contextAI);
    const recommendationAI = new RecommendationAI(contextAI, memoryAI);
    const oracleAI = new OracleAI(contextAI, memoryAI);
    const lensAI = new LensAI(contextAI, memoryAI);
    const artistAI = new ArtistAI(contextAI);
    const orbitAI = new OrbitAI(contextAI);

    const bootOrder = [
      contextAI,    // Must boot first — others depend on its context snapshot.
      memoryAI,
      navigatorAI,
      recommendationAI,
      oracleAI,
      lensAI,
      artistAI,
      orbitAI,
    ];

    // Register and initialize each agent.
    for (const agent of bootOrder) {
      try {
        await agent.register();
        this._agents.set(agent.id, agent);
      } catch (err) {
        logger.error(`[OS AI Kernel] Failed to register ${agent.name}`, { error: err.message });
        // Non-fatal: other agents continue to boot.
      }
    }

    // Subscribe to Bud result events and route OS AI results back through Bud.
    this._budUnsub = eventBus.on('os.ai.result', (event) => this._routeToBud(event));

    this._ready = true;
    this._startedAt = new Date().toISOString();

    eventBus.publish({
      type: 'os.ai.kernel.ready',
      category: 'lifecycle',
      payload: {
        agents: Array.from(this._agents.keys()),
        count: this._agents.size,
        startedAt: this._startedAt,
      },
    });

    logger.info('[OS AI Kernel] All OS AIs active', {
      count: this._agents.size,
      agents: Array.from(this._agents.keys()),
    });

    return this;
  }

  /** Graceful shutdown. */
  shutdown() {
    if (this._budUnsub) {
      this._budUnsub();
      this._budUnsub = null;
    }
    for (const agent of this._agents.values()) {
      agent.deactivate();
    }
    this._ready = false;
    logger.info('[OS AI Kernel] Shutdown complete');
  }

  /**
   * Health report for all OS AIs.
   */
  health() {
    const agents = Array.from(this._agents.values()).map((a) => a.health());
    const allHealthy = agents.every((a) => a.status === 'healthy' || a.status === 'idle');
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      ready: this._ready,
      startedAt: this._startedAt,
      agents,
    };
  }

  /**
   * Get a specific OS AI agent by id.
   */
  get(agentId) {
    return this._agents.get(agentId) || null;
  }

  /**
   * List all registered OS AI agents.
   */
  list() {
    return Array.from(this._agents.values()).map((a) => ({
      id: a.id,
      name: a.name,
      triggers: a.triggers,
      ...a.health(),
    }));
  }

  // ── Internal ─────────────────────────────────────────────────────────

  /**
   * Route OS AI results back through Bud.
   * Bud is the only conversational interface — all AI output goes through it.
   */
  _routeToBud(event) {
    const payload = event.payload || {};
    // Publish a Bud-facing event that the Bud component can listen to.
    eventBus.publish({
      type: 'bud.os_ai.response',
      category: 'response',
      correlationId: event.correlationId,
      payload: {
        agentId: payload.agentId,
        agentName: payload.name,
        workflow: payload.workflow,
        result: payload.result,
        timestamp: payload.timestamp,
      },
    });
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────

export const osAIKernel = new OSAIKernel();
export default osAIKernel;

/**
 * Convenience: publish a platform event to trigger a specific OS AI.
 *
 * Usage:
 *   triggerOSAI('os.camera.opened', { mediaType: 'photo', source: 'camera' });
 *   triggerOSAI('os.feed.loading', { userId: 'u_123', screen: 'ForYou' });
 *
 * @param {string} eventType - one of the OS-level event types
 * @param {object} payload   - event payload
 * @param {string} [correlationId]
 */
export function triggerOSAI(eventType, payload = {}, correlationId = null) {
  eventBus.publish({
    type: eventType,
    category: 'os',
    correlationId,
    payload,
  });
}

/**
 * Event Registry — Event Type Definitions
 *
 * Authoritative list of event types and their schemas. Ensures all events
 * published on the event bus are versioned and well-defined.
 */

import { logger } from '../logger';

const DEFAULT_EVENTS = [
  // Lifecycle events
  { event_type: 'runtime.boot', category: 'lifecycle', version: 1, description: 'Runtime booted successfully' },
  { event_type: 'runtime.shutdown', category: 'lifecycle', version: 1, description: 'Runtime shutting down' },
  { event_type: 'service.ready', category: 'lifecycle', version: 1, description: 'A platform service is ready' },
  { event_type: 'services.shutdown', category: 'lifecycle', version: 1, description: 'All services shutting down' },

  // Request/Response events
  { event_type: 'request.received', category: 'request', version: 1, description: 'User request received by Bud' },
  { event_type: 'request.routed', category: 'request', version: 1, description: 'Request routed by Oracle' },
  { event_type: 'response.generated', category: 'response', version: 1, description: 'Response generated and sent to Bud' },

  // Capability events
  { event_type: 'capability.resolved', category: 'capability', version: 1, description: 'Capabilities resolved for a request' },
  { event_type: 'capability.executed', category: 'capability', version: 1, description: 'A capability was executed' },

  // Workflow events
  { event_type: 'workflow.started', category: 'workflow', version: 1, description: 'A workflow started' },
  { event_type: 'workflow.completed', category: 'workflow', version: 1, description: 'A workflow completed' },
  { event_type: 'workflow.failed', category: 'workflow', version: 1, description: 'A workflow failed' },

  // Audit events
  { event_type: 'audit.logged', category: 'audit', version: 1, description: 'An audit entry was logged' },
  { event_type: 'audit.denied', category: 'audit', version: 1, description: 'An action was denied by Guardian' },

  // Security events
  { event_type: 'security.policy_violation', category: 'security', version: 1, description: 'A policy violation was detected' },

  // Monitoring events
  { event_type: 'model.invoked', category: 'monitoring', version: 1, description: 'An LLM was invoked' },
  { event_type: 'model.invoke_failed', category: 'monitoring', version: 1, description: 'An LLM invocation failed' },
  { event_type: 'health.checked', category: 'monitoring', version: 1, description: 'Health checks completed' },
  { event_type: 'metrics.recorded', category: 'monitoring', version: 1, description: 'A metric was recorded' },
  { event_type: 'telemetry.span', category: 'monitoring', version: 1, description: 'A telemetry span was recorded' },

  // Domain events
  { event_type: 'memory.stored', category: 'lifecycle', version: 1, description: 'A memory was stored' },
  { event_type: 'memory.forgotten', category: 'lifecycle', version: 1, description: 'A memory was deleted' },
  { event_type: 'conversation.created', category: 'lifecycle', version: 1, description: 'A conversation was created' },
  { event_type: 'conversation.message_appended', category: 'lifecycle', version: 1, description: 'A message was appended to a conversation' },
  { event_type: 'notification.dispatched', category: 'lifecycle', version: 1, description: 'A notification was dispatched' },

  // ── OS AI Activation Protocol events ────────────────────────────────────
  // OS AI Kernel lifecycle
  { event_type: 'os.ai.kernel.ready', category: 'lifecycle', version: 1, description: 'OS AI Kernel booted and all OS AIs are ready' },
  { event_type: 'os.ai.ready', category: 'lifecycle', version: 1, description: 'An OS AI agent registered and is ready' },
  { event_type: 'os.ai.result', category: 'response', version: 1, description: 'An OS AI produced a result' },
  { event_type: 'bud.os_ai.response', category: 'response', version: 1, description: 'An OS AI result routed to Bud' },

  // Context AI
  { event_type: 'os.context.updated', category: 'lifecycle', version: 1, description: 'Context AI updated the current platform context' },
  { event_type: 'os.screen.changed', category: 'os', version: 1, description: 'Active screen changed — triggers Navigator AI and Context AI' },
  { event_type: 'os.institution.changed', category: 'os', version: 1, description: 'Active institution changed — triggers Context AI' },
  { event_type: 'os.course.changed', category: 'os', version: 1, description: 'Active course changed — triggers Context AI' },
  { event_type: 'os.community.changed', category: 'os', version: 1, description: 'Active community changed — triggers Context AI' },
  { event_type: 'os.task.changed', category: 'os', version: 1, description: 'Active task changed — triggers Context AI' },
  { event_type: 'os.location.updated', category: 'os', version: 1, description: 'Location updated (with permission) — triggers Context AI' },

  // Navigator AI
  { event_type: 'os.navigation.started', category: 'os', version: 1, description: 'Navigation started — triggers Navigator AI' },
  { event_type: 'os.navigation.context_switch', category: 'os', version: 1, description: 'Context switch — triggers Navigator AI' },
  { event_type: 'os.navigation.deep_link', category: 'os', version: 1, description: 'Deep link opened — triggers Navigator AI' },
  { event_type: 'os.session.started', category: 'os', version: 1, description: 'New session started — triggers Navigator AI and Context AI' },
  { event_type: 'os.session.restored', category: 'os', version: 1, description: 'Session restored — triggers Navigator AI, Memory AI' },
  { event_type: 'os.navigation.quick_action', category: 'os', version: 1, description: 'Quick action triggered — triggers Navigator AI' },

  // Memory AI
  { event_type: 'os.conversation.started', category: 'os', version: 1, description: 'Conversation started — triggers Memory AI' },
  { event_type: 'os.conversation.message', category: 'os', version: 1, description: 'Conversation message — triggers Memory AI' },
  { event_type: 'os.learning.completed', category: 'os', version: 1, description: 'Learning unit completed — triggers Memory AI' },
  { event_type: 'os.bookmark.added', category: 'os', version: 1, description: 'Bookmark added — triggers Memory AI' },
  { event_type: 'os.preference.changed', category: 'os', version: 1, description: 'Preference changed — triggers Memory AI' },
  { event_type: 'os.item.saved', category: 'os', version: 1, description: 'Item saved — triggers Memory AI' },
  { event_type: 'os.history.accessed', category: 'os', version: 1, description: 'History accessed — triggers Memory AI' },

  // Recommendation AI
  { event_type: 'os.feed.loading', category: 'os', version: 1, description: 'Feed loading — triggers Recommendation AI' },
  { event_type: 'os.discovery.opened', category: 'os', version: 1, description: 'Discovery screen opened — triggers Recommendation AI' },
  { event_type: 'os.community.browsing', category: 'os', version: 1, description: 'Community browsing — triggers Recommendation AI' },
  { event_type: 'os.marketplace.opened', category: 'os', version: 1, description: 'Marketplace opened — triggers Recommendation AI' },
  { event_type: 'os.courses.browsing', category: 'os', version: 1, description: 'Courses browsing — triggers Recommendation AI' },
  { event_type: 'os.events.browsing', category: 'os', version: 1, description: 'Events browsing — triggers Recommendation AI' },
  { event_type: 'os.people.suggestions', category: 'os', version: 1, description: 'People suggestions requested — triggers Recommendation AI' },
  { event_type: 'os.recommendations.ready', category: 'response', version: 1, description: 'Recommendation AI generated recommendations' },

  // Oracle AI
  { event_type: 'os.reasoning.requested', category: 'os', version: 1, description: 'Reasoning requested — triggers Oracle AI' },
  { event_type: 'os.academic.assistance', category: 'os', version: 1, description: 'Academic assistance requested — triggers Oracle AI' },
  { event_type: 'os.planning.started', category: 'os', version: 1, description: 'Planning workflow started — triggers Oracle AI' },
  { event_type: 'os.question.complex', category: 'os', version: 1, description: 'Complex question detected — triggers Oracle AI' },
  { event_type: 'os.decision.support', category: 'os', version: 1, description: 'Decision support requested — triggers Oracle AI' },

  // Lens
  { event_type: 'os.camera.opened', category: 'os', version: 1, description: 'Camera opened — triggers Lens' },
  { event_type: 'os.media.uploading', category: 'os', version: 1, description: 'Media upload started — triggers Lens' },
  { event_type: 'os.ocr.requested', category: 'os', version: 1, description: 'OCR requested — triggers Lens' },
  { event_type: 'os.scan.started', category: 'os', version: 1, description: 'Scan started — triggers Lens' },
  { event_type: 'os.image.search', category: 'os', version: 1, description: 'Image search requested — triggers Lens' },
  { event_type: 'os.media.editing', category: 'os', version: 1, description: 'Media editing started — triggers Lens' },
  { event_type: 'os.color.correction', category: 'os', version: 1, description: 'Color correction requested — triggers Lens' },
  { event_type: 'os.media.analysis', category: 'os', version: 1, description: 'Media analysis requested — triggers Lens' },

  // Artist
  { event_type: 'os.image.generate', category: 'os', version: 1, description: 'Image generation requested — triggers Artist' },
  { event_type: 'os.content.create', category: 'os', version: 1, description: 'Content creation requested — triggers Artist' },
  { event_type: 'os.story.cover', category: 'os', version: 1, description: 'Story cover requested — triggers Artist' },
  { event_type: 'os.highlight.cover', category: 'os', version: 1, description: 'Highlight cover requested — triggers Artist' },
  { event_type: 'os.graphics.requested', category: 'os', version: 1, description: 'Graphics requested — triggers Artist' },

  // Orbit AI
  { event_type: 'os.automation.triggered', category: 'os', version: 1, description: 'Automation triggered — triggers Orbit AI' },
  { event_type: 'os.task.background', category: 'os', version: 1, description: 'Background task queued — triggers Orbit AI' },
  { event_type: 'os.schedule.created', category: 'os', version: 1, description: 'Schedule created — triggers Orbit AI' },
  { event_type: 'os.workflow.execute', category: 'os', version: 1, description: 'Workflow execution requested — triggers Orbit AI' },
  { event_type: 'os.notification.schedule', category: 'os', version: 1, description: 'Notification scheduling — triggers Orbit AI' },

  // OS AI delegation channel (used for inter-AI collaboration)
  { event_type: 'os.delegate.context_ai_os', category: 'os', version: 1, description: 'Delegation to Context AI' },
  { event_type: 'os.delegate.memory_ai_os', category: 'os', version: 1, description: 'Delegation to Memory AI' },
  { event_type: 'os.delegate.recommendation_ai_os', category: 'os', version: 1, description: 'Delegation to Recommendation AI' },
  { event_type: 'os.delegate.oracle_ai_os', category: 'os', version: 1, description: 'Delegation to Oracle AI' },
  { event_type: 'os.delegate.lens_ai_os', category: 'os', version: 1, description: 'Delegation to Lens' },
  { event_type: 'os.delegate.artist_ai_os', category: 'os', version: 1, description: 'Delegation to Artist' },
  { event_type: 'os.delegate.orbit_ai_os', category: 'os', version: 1, description: 'Delegation to Orbit AI' },
];

class EventRegistry {
  constructor() { this._events = new Map(); this._ready = false; }

  async init() {
    for (const evt of DEFAULT_EVENTS) this._events.set(evt.event_type, evt);
    this._ready = true;
    logger.info('EventRegistry initialized', { eventCount: this._events.size });
  }

  register(eventDef) { this._events.set(eventDef.event_type, eventDef); }
  get(eventType) { return this._events.get(eventType) || null; }
  list(filter) {
    const all = Array.from(this._events.values());
    if (filter?.category) return all.filter((e) => e.category === filter.category);
    return all;
  }

  get ready() { return this._ready; }
}

export const eventRegistry = new EventRegistry();
export default eventRegistry;
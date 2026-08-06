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
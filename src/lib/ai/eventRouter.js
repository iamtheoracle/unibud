/**
 * EventRouter — AI Domain Event Routing
 *
 * Routes events from the runtime EventBus to the appropriate AI agent(s)
 * based on domain classification and event type patterns.
 *
 * Routing rules:
 *   - Events are matched by type prefix, category, or explicit route entry.
 *   - A single event may route to multiple agents (fan-out).
 *   - Routing decisions are logged for observability.
 *   - Routes are registered at boot and may be updated at runtime.
 */

import { logger } from "@/lib/runtime/logger";
import { eventBus } from "@/lib/runtime/eventBus";
import { agentBus } from "./agentBus";

/** Built-in routing table — maps event type pattern to agent id(s). */
const DEFAULT_ROUTES = [
  // Platform lifecycle
  { pattern: "service.ready",        agents: ["spark"],                 category: "lifecycle" },
  { pattern: "ai.registered",        agents: ["oracle"],                category: "lifecycle" },
  { pattern: "ai.initialized",       agents: ["oracle", "spark"],       category: "lifecycle" },
  { pattern: "ai.stopped",           agents: ["oracle"],                category: "lifecycle" },

  // Request pipeline
  { pattern: "request.received",     agents: ["oracle", "event_ai"],    category: "request" },
  { pattern: "request.routed",       agents: ["analytics_ai"],          category: "request" },
  { pattern: "response.generated",   agents: ["analytics_ai", "memory_ai"], category: "response" },
  { pattern: "audit.denied",         agents: ["security_ai", "privacy_ai"], category: "audit" },

  // Capabilities
  { pattern: "capability.resolved",  agents: ["spark", "context_ai"],   category: "capability" },
  { pattern: "capability.executed",  agents: ["analytics_ai"],          category: "capability" },

  // Workflows
  { pattern: "workflow.started",     agents: ["orbit", "workflow_ai"],  category: "workflow" },
  { pattern: "workflow.completed",   agents: ["orbit", "analytics_ai"], category: "workflow" },
  { pattern: "workflow.failed",      agents: ["orbit", "security_ai"],  category: "workflow" },

  // Security
  { pattern: "security.policy_violation", agents: ["security_ai", "oracle"], category: "security" },

  // Student intelligence
  { pattern: "intelligence.request_detected", agents: ["learning_ai", "study_planner_ai"], category: "intelligence" },

  // Agent communication — note: NOT routed back through agentBus to avoid feedback loops
  // { pattern: "agent.message.*", agents: ["event_ai"], category: "agent_communication" },
];

class EventRouter {
  constructor() {
    /** Ordered list of route entries. */
    this._routes = [];
    /** Unsubscribe handle from eventBus */
    this._unsubscribe = null;
    this._ready = false;
  }

  /**
   * Initialize the router — registers default routes and subscribes to the
   * event bus.
   */
  init() {
    for (const route of DEFAULT_ROUTES) {
      this.addRoute(route);
    }
    // Subscribe to all events and fan-out based on routing table
    this._unsubscribe = eventBus.on("*", (event) => this._route(event));
    this._ready = true;
    logger.info("EventRouter initialized", { routeCount: this._routes.length });
  }

  /**
   * Add a routing rule.
   *
   * @param {{ pattern: string, agents: string[], category?: string }} route
   *   pattern  - exact event type or prefix ending in '*' (e.g. "workflow.*")
   *   agents   - array of agent ids to receive the event
   *   category - optional category hint for logging
   */
  addRoute(route) {
    this._routes.push(route);
  }

  /**
   * Remove routing rules matching a pattern.
   *
   * @param {string} pattern
   */
  removeRoute(pattern) {
    this._routes = this._routes.filter((r) => r.pattern !== pattern);
  }

  /**
   * List all registered routes.
   */
  listRoutes() {
    return [...this._routes];
  }

  /**
   * Shut down the router and unsubscribe from the event bus.
   */
  shutdown() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._ready = false;
    logger.info("EventRouter shut down");
  }

  get ready() {
    return this._ready;
  }

  // ── Internal ─────────────────────────────────────────────────────────

  _route(event) {
    // Guard: never re-route agent.message.* events — they originate from agentBus.send()
    // which is itself called by this router. Routing them again would create a feedback loop.
    if (event.type?.startsWith("agent.message.")) return;

    const matched = this._routes.filter((r) => this._matches(r.pattern, event.type));
    if (matched.length === 0) return;

    for (const route of matched) {
      for (const agentId of route.agents) {
        agentBus.send("event_router", agentId, "event", {
          event: {
            type: event.type,
            category: event.category,
            payload: event.payload,
            correlationId: event.correlationId,
            timestamp: event.timestamp,
          },
        }, event.correlationId);
      }
    }
  }

  _matches(pattern, eventType) {
    if (pattern === eventType) return true;
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1);
      return eventType.startsWith(prefix);
    }
    return false;
  }
}

export const eventRouter = new EventRouter();
export default eventRouter;

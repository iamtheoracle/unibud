/**
 * AIContextManager — Per-Agent Context Management
 *
 * Manages rich, structured context for each AI agent across a session.
 * Context is assembled from multiple sources:
 *   - User session data (userId, sessionId, locale, timezone)
 *   - Academic data (courses, assignments, exams)
 *   - Platform state (active screen, product)
 *   - Memory results (episodic recall)
 *   - Knowledge results (semantic search)
 *   - Agent-specific configuration
 *
 * Context is versioned: every update increments the version so agents
 * can detect staleness without comparing deep object equality.
 *
 * All reads are O(1) lookups. Context is never shared between agents
 * unless explicitly passed as a parameter.
 */

import { logger } from "@/lib/runtime/logger";

const MAX_MEMORY_ENTRIES = 10;
const MAX_KNOWLEDGE_ENTRIES = 10;

class AIContextManager {
  constructor() {
    /** Map<agentId, ContextRecord> */
    this._contexts = new Map();
  }

  /**
   * Initialize or replace context for an agent.
   *
   * @param {string} agentId
   * @param {object} base  - initial context fields (userId, sessionId, etc.)
   */
  set(agentId, base = {}) {
    this._contexts.set(agentId, {
      agentId,
      version: 1,
      updatedAt: new Date().toISOString(),
      session: {
        userId: base.userId || null,
        sessionId: base.sessionId || null,
        product: base.product || null,
        locale: base.locale || null,
        timezone: base.timezone || null,
      },
      academic: base.academic || null,
      platform: {
        screen: base.screen || null,
        feature: base.feature || null,
      },
      memory: [],
      knowledge: [],
      custom: base.custom || {},
    });
    logger.debug("AIContextManager: context set", { agentId });
    return this._contexts.get(agentId);
  }

  /**
   * Patch (merge) fields into an existing context. Creates the context
   * if it doesn't exist yet.
   *
   * @param {string} agentId
   * @param {object} patch
   */
  update(agentId, patch = {}) {
    const existing = this._contexts.get(agentId);
    if (!existing) return this.set(agentId, patch);

    const next = { ...existing };
    next.version += 1;
    next.updatedAt = new Date().toISOString();

    if (patch.userId !== undefined) next.session.userId = patch.userId;
    if (patch.sessionId !== undefined) next.session.sessionId = patch.sessionId;
    if (patch.product !== undefined) next.session.product = patch.product;
    if (patch.locale !== undefined) next.session.locale = patch.locale;
    if (patch.timezone !== undefined) next.session.timezone = patch.timezone;
    if (patch.academic !== undefined) next.academic = patch.academic;
    if (patch.screen !== undefined) next.platform.screen = patch.screen;
    if (patch.feature !== undefined) next.platform.feature = patch.feature;
    if (patch.custom) next.custom = { ...next.custom, ...patch.custom };

    this._contexts.set(agentId, next);
    return next;
  }

  /**
   * Append memory recall results to an agent's context.
   * Bounded to MAX_MEMORY_ENTRIES most-recent entries.
   *
   * @param {string} agentId
   * @param {object[]} entries
   */
  addMemory(agentId, entries = []) {
    const ctx = this._contexts.get(agentId);
    if (!ctx) return;
    ctx.memory = [...ctx.memory, ...entries].slice(-MAX_MEMORY_ENTRIES);
    ctx.version += 1;
    ctx.updatedAt = new Date().toISOString();
  }

  /**
   * Append knowledge search results to an agent's context.
   * Bounded to MAX_KNOWLEDGE_ENTRIES most-recent entries.
   *
   * @param {string} agentId
   * @param {object[]} entries
   */
  addKnowledge(agentId, entries = []) {
    const ctx = this._contexts.get(agentId);
    if (!ctx) return;
    ctx.knowledge = [...ctx.knowledge, ...entries].slice(-MAX_KNOWLEDGE_ENTRIES);
    ctx.version += 1;
    ctx.updatedAt = new Date().toISOString();
  }

  /**
   * Get the current context for an agent.
   *
   * @param {string} agentId
   * @returns {object|null}
   */
  get(agentId) {
    return this._contexts.get(agentId) || null;
  }

  /**
   * Clear an agent's context (e.g., on session end).
   *
   * @param {string} agentId
   */
  clear(agentId) {
    this._contexts.delete(agentId);
  }

  /**
   * Serialize context to a compact string for LLM prompts.
   * Includes session info, academic data, and recent memory/knowledge.
   *
   * @param {string} agentId
   * @returns {string}
   */
  toPromptString(agentId) {
    const ctx = this._contexts.get(agentId);
    if (!ctx) return "";

    const lines = [];

    if (ctx.session.userId) lines.push(`User: ${ctx.session.userId}`);
    if (ctx.session.locale) lines.push(`Locale: ${ctx.session.locale}`);
    if (ctx.session.timezone) lines.push(`Timezone: ${ctx.session.timezone}`);
    if (ctx.platform.screen) lines.push(`Screen: ${ctx.platform.screen}`);
    if (ctx.academic) {
      lines.push(`Academic: ${typeof ctx.academic === "string" ? ctx.academic : JSON.stringify(ctx.academic)}`);
    }

    if (ctx.memory.length > 0) {
      lines.push("Recent memory:");
      for (const m of ctx.memory) {
        const text = m.content || m.text || (typeof m === "string" ? m : JSON.stringify(m));
        lines.push(`  - ${text}`);
      }
    }

    if (ctx.knowledge.length > 0) {
      lines.push("Relevant knowledge:");
      for (const k of ctx.knowledge) {
        const text = k.title ? `${k.title}: ${k.description || ""}` : (k.content || JSON.stringify(k));
        lines.push(`  - ${text}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * List all agent ids that have active contexts.
   */
  listAgents() {
    return Array.from(this._contexts.keys());
  }
}

export const aiContextManager = new AIContextManager();
export default aiContextManager;

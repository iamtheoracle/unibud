/**
 * AIPermissions — Per-Agent Permission Enforcement
 *
 * Enforces fine-grained permissions for every AI agent action.
 * Every agent declares the permissions it requires (in agentDefinitions.js).
 * Before an agent performs an action, it must be checked here.
 *
 * Permission format:  "<resource>:<action>"
 *   e.g.  "model:invoke", "memory:write", "audit:write"
 *
 * Permission grants:
 *   - Agent-level: permissions listed in the agent definition (static)
 *   - Session-level: permissions granted at runtime for a session
 *   - Platform-level: global grants added during boot for core infrastructure
 *
 * Default stance: DENY unless the permission is explicitly granted.
 * This mirrors Guardian's policy model at the agent level.
 */

import { logger } from "@/lib/runtime/logger";
import { eventBus } from "@/lib/runtime/eventBus";
import { AI_AGENTS_BY_ID } from "./agentDefinitions";

class AIPermissions {
  constructor() {
    /**
     * Map<agentId, Set<permission>>
     * Grants are the union of static definition permissions +
     * any runtime-granted permissions.
     */
    this._grants = new Map();

    /**
     * Map<agentId, Map<sessionId, Set<permission>>>
     * Session-scoped grants that expire when the session ends.
     */
    this._sessionGrants = new Map();
  }

  /**
   * Seed permissions from agent definitions.
   * Called once during AI Kernel boot.
   */
  seed() {
    for (const [id, def] of Object.entries(AI_AGENTS_BY_ID)) {
      const perms = new Set(def.permissions || []);
      this._grants.set(id, perms);
    }
    logger.info("AIPermissions: seeded from agent definitions", {
      agentCount: this._grants.size,
    });
  }

  /**
   * Grant a permission to an agent (global, persists across sessions).
   *
   * @param {string} agentId
   * @param {string} permission
   */
  grant(agentId, permission) {
    if (!this._grants.has(agentId)) this._grants.set(agentId, new Set());
    this._grants.get(agentId).add(permission);
    logger.debug("AIPermissions: granted", { agentId, permission });
  }

  /**
   * Revoke a runtime-granted permission from an agent.
   * Does not affect definition-level permissions.
   *
   * @param {string} agentId
   * @param {string} permission
   */
  revoke(agentId, permission) {
    this._grants.get(agentId)?.delete(permission);
    logger.debug("AIPermissions: revoked", { agentId, permission });
  }

  /**
   * Grant a session-scoped permission to an agent.
   * Session grants are automatically cleared when clearSession() is called.
   *
   * @param {string} agentId
   * @param {string} sessionId
   * @param {string} permission
   */
  grantSession(agentId, sessionId, permission) {
    if (!this._sessionGrants.has(agentId)) {
      this._sessionGrants.set(agentId, new Map());
    }
    const sessions = this._sessionGrants.get(agentId);
    if (!sessions.has(sessionId)) sessions.set(sessionId, new Set());
    sessions.get(sessionId).add(permission);
  }

  /**
   * Clear all session grants for a given session.
   *
   * @param {string} sessionId
   */
  clearSession(sessionId) {
    for (const sessions of this._sessionGrants.values()) {
      sessions.delete(sessionId);
    }
  }

  /**
   * Check whether an agent has a specific permission.
   *
   * @param {string} agentId
   * @param {string} permission
   * @param {{ sessionId?: string, userId?: string, correlationId?: string }} [context]
   * @returns {{ allowed: boolean, reason: string }}
   */
  check(agentId, permission, context = {}) {
    // Global grant
    if (this._grants.get(agentId)?.has(permission)) {
      return { allowed: true, reason: "global_grant" };
    }

    // Session grant
    if (context.sessionId) {
      const sessionGrant = this._sessionGrants.get(agentId)?.get(context.sessionId);
      if (sessionGrant?.has(permission)) {
        return { allowed: true, reason: "session_grant" };
      }
    }

    // Wildcard check — e.g., if agent has "model:*", it can "model:invoke"
    const [resource] = permission.split(":");
    if (this._grants.get(agentId)?.has(`${resource}:*`)) {
      return { allowed: true, reason: "wildcard_grant" };
    }

    // DENY
    const reason = `Agent '${agentId}' lacks permission '${permission}'`;
    logger.warn("AIPermissions: denied", { agentId, permission, context });
    eventBus.publish({
      type: "ai.permission_denied",
      category: "security",
      correlationId: context.correlationId || null,
      payload: { agentId, permission, userId: context.userId || null },
    });
    return { allowed: false, reason };
  }

  /**
   * Assert a permission — throws if not allowed.
   *
   * @param {string} agentId
   * @param {string} permission
   * @param {object} [context]
   */
  assert(agentId, permission, context = {}) {
    const result = this.check(agentId, permission, context);
    if (!result.allowed) {
      throw new Error(`Permission denied: ${result.reason}`);
    }
  }

  /**
   * List all permissions currently granted to an agent.
   *
   * @param {string} agentId
   * @returns {string[]}
   */
  list(agentId) {
    return Array.from(this._grants.get(agentId) || []);
  }
}

export const aiPermissions = new AIPermissions();
export default aiPermissions;

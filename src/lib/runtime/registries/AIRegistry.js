/**
 * AI Registry — Agent Definitions
 *
 * Authoritative source for all AI agent metadata. Agents are defined here,
 * not duplicated inside other agents. The SparkAgent entity syncs from this
 * registry during boot.
 */

import { logger } from '../logger';

const DEFAULT_AGENTS = [
  { agent_id: 'bud', name: 'Bud', division: 'Intelligence', role: 'Companion', focus: 'User-facing conversational companion. Receives messages, renders responses, streams output, requests work from Oracle.', enabled: true, order: 0 },
  { agent_id: 'oracle', name: 'Oracle', division: 'Governance', role: 'Runtime Kernel', focus: 'Coordinates the runtime pipeline. Does NOT reason, store memory, or own capabilities.', enabled: true, order: 1 },
  { agent_id: 'nexus', name: 'Nexus', division: 'Operations', role: 'Platform Kernel', focus: 'Orchestrates capability resolution, workflow coordination, model routing, event publication, lifecycle management.', enabled: true, order: 2 },
  { agent_id: 'spark', name: 'Spark', division: 'Intelligence', role: 'Knowledge Intelligence', focus: 'Reasoning, synthesis, academic analysis, long-context understanding. Does NOT own databases, memory, or vector storage.', enabled: true, order: 3 },
  { agent_id: 'orbit', name: 'Orbit', division: 'Operations', role: 'Execution Manager', focus: 'Workflows, scheduling, retries, recovery, automation, long-running jobs.', enabled: true, order: 4 },
  { agent_id: 'guardian', name: 'Guardian', division: 'Trust', role: 'Governance Enforcement', focus: 'Enforces governance. DENY unless explicitly granted. Uses Audit Service — does NOT own audit storage.', enabled: true, order: 5 },
  { agent_id: 'study', name: 'Study', division: 'Intelligence', role: 'Academic Assistant', focus: 'Academic assistance, learning paths, exam preparation.', enabled: true, order: 10 },
  { agent_id: 'career', name: 'Career', division: 'Intelligence', role: 'Career Advisor', focus: 'Professional development, opportunities, portfolio.', enabled: true, order: 11 },
  { agent_id: 'campus', name: 'Campus', division: 'Operations', role: 'Campus Life', focus: 'Campus events, clubs, traditions.', enabled: true, order: 12 },
  { agent_id: 'quad', name: 'Quad', division: 'Intelligence', role: 'Social Feed', focus: 'Social feed, community interactions.', enabled: true, order: 13 },
  { agent_id: 'pulse', name: 'Pulse', division: 'Intelligence', role: 'Analytics', focus: 'Analytics and insights.', enabled: true, order: 14 },
  { agent_id: 'library', name: 'Library', division: 'Intelligence', role: 'Knowledge Curator', focus: 'Knowledge and resource management.', enabled: true, order: 15 },
  { agent_id: 'search', name: 'Search', division: 'Intelligence', role: 'Information Retrieval', focus: 'Information retrieval across entities.', enabled: true, order: 16 },
  { agent_id: 'security', name: 'Security', division: 'Trust', role: 'Security Monitor', focus: 'Security monitoring and incident response.', enabled: true, order: 17 },
  { agent_id: 'notification', name: 'Notification', division: 'Operations', role: 'Notification Dispatcher', focus: 'Notification dispatch and scheduling.', enabled: true, order: 18 },

  // ── OS AI Activation Protocol ─────────────────────────────────────────────
  // These 8 OS-level AIs are activated by platform events and collaborate
  // through Spark, with all responses returning through Bud.
  { agent_id: 'context_ai_os', name: 'Context AI', division: 'OS', role: 'Context Tracking', focus: 'Continuously tracks current screen, institution, course, community, task, time, and location. Always active.', enabled: true, order: 20 },
  { agent_id: 'navigator_ai_os', name: 'Navigator AI', division: 'OS', role: 'Navigation Intelligence', focus: 'Navigation, context switching, deep links, session restore, and quick actions.', enabled: true, order: 21 },
  { agent_id: 'memory_ai_os', name: 'Memory AI', division: 'OS', role: 'Memory Management', focus: 'Conversations, learning history, bookmarks, preferences, saved items, and session memory.', enabled: true, order: 22 },
  { agent_id: 'recommendation_ai_os', name: 'Recommendation AI', division: 'OS', role: 'Recommendations', focus: 'Feed, discovery, communities, marketplace, courses, events, and people suggestions.', enabled: true, order: 23 },
  { agent_id: 'oracle_ai_os', name: 'Oracle AI', division: 'OS', role: 'Reasoning & Academic', focus: 'Reasoning, academic assistance, planning, complex questions, and decision support.', enabled: true, order: 24 },
  { agent_id: 'lens_ai_os', name: 'Lens', division: 'OS', role: 'Media Intelligence', focus: 'Camera, media upload, OCR, scanning, image search, AI editing, color correction, and media analysis.', enabled: true, order: 25 },
  { agent_id: 'artist_ai_os', name: 'Artist', division: 'OS', role: 'Creative Intelligence', focus: 'Image generation, content creation, story covers, highlight covers, and graphics.', enabled: true, order: 26 },
  { agent_id: 'orbit_ai_os', name: 'Orbit AI', division: 'OS', role: 'Automation & Scheduling', focus: 'Automation, background tasks, scheduling, workflow execution, and notifications.', enabled: true, order: 27 },
];

class AIRegistry {
  constructor() { this._agents = new Map(); this._ready = false; }

  async init() {
    for (const agent of DEFAULT_AGENTS) this._agents.set(agent.agent_id, agent);
    this._ready = true;
    logger.info('AIRegistry initialized', { agentCount: this._agents.size });
  }

  register(agentDef) { this._agents.set(agentDef.agent_id, { ...agentDef, enabled: true }); }
  get(agentId) { return this._agents.get(agentId) || null; }
  list(filter) {
    const all = Array.from(this._agents.values());
    if (filter?.enabled !== undefined) return all.filter((a) => a.enabled === filter.enabled);
    return all;
  }
  getActive() { return this.list({ enabled: true }).sort((a, b) => (a.order || 0) - (b.order || 0)); }

  get ready() { return this._ready; }
}

export const aiRegistry = new AIRegistry();
export default aiRegistry;
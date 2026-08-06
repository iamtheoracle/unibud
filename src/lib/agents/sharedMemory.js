/**
 * SharedMemory — per-conversation-turn context store for agent coordination.
 *
 * Prevents duplicate work:
 *  - Entity cache: if Agent A already fetched assignments, Agent B reuses the cache
 *  - Processed agents: if Oracle already routed to an agent for this query, skip re-execution
 *  - Agent results: collected for Oracle's combine step
 *
 * A new SharedMemory instance is created per routeAndRespond() call (per user message),
 * ensuring fresh entity data each turn while preventing duplicates within the same turn.
 */
export class SharedMemory {
  constructor() {
    this._entityCache = new Map();
    this._processedAgents = new Set();
    this._agentResults = [];
    this._context = {};
  }

  setContext(key, value) {
    this._context[key] = value;
  }

  getContext(key) {
    return this._context[key];
  }

  getCached(key) {
    return this._entityCache.get(key);
  }

  setCached(key, value) {
    this._entityCache.set(key, value);
  }

  isProcessed(agentId, query) {
    return this._processedAgents.has(`${agentId}:${query}`);
  }

  markProcessed(agentId, query) {
    this._processedAgents.add(`${agentId}:${query}`);
  }

  addResult(result) {
    this._agentResults.push(result);
  }

  getResults() {
    return this._agentResults;
  }

  clear() {
    this._entityCache.clear();
    this._processedAgents.clear();
    this._agentResults = [];
  }
}
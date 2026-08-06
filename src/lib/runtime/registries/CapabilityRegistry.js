/**
 * Capability Registry — Authoritative Capability Definitions
 *
 * Defines what the platform can do. Nexus resolves capabilities from this
 * registry — it does NOT define its own capabilities. Capabilities map to
 * platform services and tools.
 */

import { logger } from '../logger';

const DEFAULT_CAPABILITIES = [
  // Intelligence capabilities
  { cap_id: 'reason', name: 'Reasoning', division: 'intelligence', service: 'model', description: 'LLM-based reasoning over context', tier: 'standard' },
  { cap_id: 'synthesize', name: 'Synthesis', division: 'intelligence', service: 'model', description: 'Merge multiple agent outputs into unified response', tier: 'standard' },
  { cap_id: 'analyze', name: 'Academic Analysis', division: 'intelligence', service: 'model', description: 'Deep analysis of academic content', tier: 'complex' },
  { cap_id: 'summarize', name: 'Summarization', division: 'intelligence', service: 'model', description: 'Summarize content concisely', tier: 'fast' },
  { cap_id: 'translate', name: 'Translation', division: 'intelligence', service: 'model', description: 'Translate text between languages', tier: 'fast' },

  // Knowledge capabilities
  { cap_id: 'search_knowledge', name: 'Knowledge Search', division: 'knowledge', service: 'knowledge', description: 'Search across knowledge repository', tier: 'fast' },
  { cap_id: 'search_entities', name: 'Entity Search', division: 'knowledge', service: 'search', description: 'Search across database entities', tier: 'fast' },
  { cap_id: 'search_students', name: 'Student Search', division: 'knowledge', service: 'search', description: 'Search student records', tier: 'fast' },
  { cap_id: 'retrieve_resource', name: 'Resource Retrieval', division: 'knowledge', service: 'knowledge', description: 'Retrieve a specific knowledge resource', tier: 'fast' },

  // Memory capabilities
  { cap_id: 'recall_memory', name: 'Memory Recall', division: 'memory', service: 'memory', description: 'Recall episodic/semantic memory for user', tier: 'fast' },
  { cap_id: 'store_memory', name: 'Memory Store', division: 'memory', service: 'memory', description: 'Store a memory record', tier: 'fast' },
  { cap_id: 'search_memory', name: 'Memory Search', division: 'memory', service: 'memory', description: 'Semantic search over memory', tier: 'fast' },

  // Conversation capabilities
  { cap_id: 'create_conversation', name: 'Create Conversation', division: 'conversation', service: 'conversation', description: 'Create a new conversation', tier: 'fast' },
  { cap_id: 'append_message', name: 'Append Message', division: 'conversation', service: 'conversation', description: 'Append to conversation history', tier: 'fast' },
  { cap_id: 'get_history', name: 'Get History', division: 'conversation', service: 'conversation', description: 'Get conversation history', tier: 'fast' },

  // Notification capabilities
  { cap_id: 'dispatch_notification', name: 'Dispatch Notification', division: 'notification', service: 'notification', description: 'Send a notification', tier: 'fast' },

  // File capabilities
  { cap_id: 'upload_file', name: 'Upload File', division: 'file', service: 'model', description: 'Upload a file to storage', tier: 'fast' },
  { cap_id: 'generate_image', name: 'Generate Image', division: 'media', service: 'model', description: 'Generate an image via AI', tier: 'complex' },
  { cap_id: 'transcribe_audio', name: 'Transcribe Audio', division: 'media', service: 'model', description: 'Transcribe audio to text', tier: 'complex' },

  // Web capabilities
  { cap_id: 'web_search', name: 'Web Search', division: 'knowledge', service: 'model', description: 'Search the web for information', tier: 'standard' },
];

class CapabilityRegistry {
  constructor() { this._caps = new Map(); this._ready = false; }

  async init() {
    for (const cap of DEFAULT_CAPABILITIES) this._caps.set(cap.cap_id, cap);
    this._ready = true;
    logger.info('CapabilityRegistry initialized', { capCount: this._caps.size });
  }

  register(capDef) { this._caps.set(capDef.cap_id, capDef); }
  get(capId) { return this._caps.get(capId) || null; }
  list(filter) {
    const all = Array.from(this._caps.values());
    if (filter?.division) return all.filter((c) => c.division === filter.division);
    return all;
  }

  /** Resolve capabilities for an intent (simple keyword matching). */
  resolve(intent) {
    const lower = intent.toLowerCase();
    const matches = [];
    for (const cap of this._caps.values()) {
      if (lower.includes(cap.cap_id) || lower.includes(cap.name.toLowerCase())) {
        matches.push(cap);
      }
    }
    return matches;
  }

  get ready() { return this._ready; }
}

export const capabilityRegistry = new CapabilityRegistry();
export default capabilityRegistry;
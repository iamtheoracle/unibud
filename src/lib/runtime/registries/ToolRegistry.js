/**
 * Tool Registry — Available Tools
 *
 * Authoritative list of tools that agents can invoke. Each tool maps to
 * a platform service endpoint or backend function.
 */

import { logger } from '../logger';

const DEFAULT_TOOLS = [
  // Memory tools
  { tool_id: 'memory.recall', service: 'memory', operation: 'recall', description: 'Recall memories for a user' },
  { tool_id: 'memory.store', service: 'memory', operation: 'store', description: 'Store a memory record' },
  { tool_id: 'memory.search', service: 'memory', operation: 'search', description: 'Search memories semantically' },

  // Knowledge tools
  { tool_id: 'knowledge.search', service: 'knowledge', operation: 'search', description: 'Search knowledge repository' },
  { tool_id: 'knowledge.retrieve', service: 'knowledge', operation: 'retrieve', description: 'Retrieve a knowledge resource' },

  // Search tools
  { tool_id: 'search.students', service: 'search', operation: 'searchStudents', description: 'Search student records' },
  { tool_id: 'search.entities', service: 'search', operation: 'searchEntities', description: 'Search across entities' },

  // Conversation tools
  { tool_id: 'conversation.create', service: 'conversation', operation: 'create', description: 'Create a conversation' },
  { tool_id: 'conversation.append', service: 'conversation', operation: 'append', description: 'Append to conversation' },
  { tool_id: 'conversation.history', service: 'conversation', operation: 'getHistory', description: 'Get conversation history' },

  // Notification tools
  { tool_id: 'notification.dispatch', service: 'notification', operation: 'dispatch', description: 'Dispatch a notification' },

  // Model tools
  { tool_id: 'model.invoke', service: 'model', operation: 'invoke', description: 'Invoke an LLM' },
  { tool_id: 'model.web_search', service: 'model', operation: 'invoke', description: 'Invoke LLM with web search', params: { addContextFromInternet: true } },

  // File tools
  { tool_id: 'file.upload', service: 'model', operation: 'upload', description: 'Upload a file' },
  { tool_id: 'image.generate', service: 'model', operation: 'generateImage', description: 'Generate an image' },
  { tool_id: 'audio.transcribe', service: 'model', operation: 'transcribe', description: 'Transcribe audio to text' },

  // Audit tools
  { tool_id: 'audit.log', service: 'audit', operation: 'log', description: 'Log an audit entry' },
];

class ToolRegistry {
  constructor() { this._tools = new Map(); this._ready = false; }

  async init() {
    for (const tool of DEFAULT_TOOLS) this._tools.set(tool.tool_id, tool);
    this._ready = true;
    logger.info('ToolRegistry initialized', { toolCount: this._tools.size });
  }

  register(toolDef) { this._tools.set(toolDef.tool_id, toolDef); }
  get(toolId) { return this._tools.get(toolId) || null; }
  list(filter) {
    const all = Array.from(this._tools.values());
    if (filter?.service) return all.filter((t) => t.service === filter.service);
    return all;
  }

  get ready() { return this._ready; }
}

export const toolRegistry = new ToolRegistry();
export default toolRegistry;
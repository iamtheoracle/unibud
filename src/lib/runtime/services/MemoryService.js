/**
 * Memory Service — Episodic & Semantic Memory
 *
 * Owns all memory operations. Bud, Spark, and other agents consume this
 * service — they never touch BudMemory entities directly.
 *
 * Memory types: episodic (conversation-derived), semantic (facts/preferences),
 * procedural (learned patterns).
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';

class MemoryService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('MemoryService initialized');
  }

  /** Store a memory record. */
  async store({ userId, sessionId, type = 'episodic', content, metadata = {}, importance = 0.5 }) {
    try {
      const record = await base44.entities.BudMemory.create({
        user_id: userId,
        session_id: sessionId,
        type,
        content,
        metadata,
        importance,
      });
      eventBus.publish({
        type: 'memory.stored',
        category: 'lifecycle',
        payload: { memoryId: record.id, type, userId },
      });
      return record;
    } catch (e) {
      logger.error('Memory store failed', { error: e.message });
      return null;
    }
  }

  /** Recall recent memories for a user/session. */
  async recall({ userId, sessionId, limit = 10, type }) {
    try {
      const filter = { user_id: userId };
      if (sessionId) filter.session_id = sessionId;
      if (type) filter.type = type;
      return await base44.entities.BudMemory.filter(filter, '-created_date', limit);
    } catch (e) {
      logger.error('Memory recall failed', { error: e.message });
      return [];
    }
  }

  /** Semantic search over memory content. */
  async search({ userId, query, limit = 5 }) {
    try {
      const all = await base44.entities.BudMemory.filter({ user_id: userId }, '-created_date', 100);
      const q = query.toLowerCase();
      return all
        .filter((m) => (m.content || '').toLowerCase().includes(q))
        .slice(0, limit);
    } catch (e) {
      logger.error('Memory search failed', { error: e.message });
      return [];
    }
  }

  /** Delete a memory record. */
  async forget(memoryId) {
    try {
      await base44.entities.BudMemory.delete(memoryId);
      eventBus.publish({ type: 'memory.forgotten', category: 'lifecycle', payload: { memoryId } });
      return true;
    } catch (e) {
      logger.error('Memory forget failed', { error: e.message });
      return false;
    }
  }

  get ready() { return this._ready; }
}

export const memoryService = new MemoryService();
export default memoryService;
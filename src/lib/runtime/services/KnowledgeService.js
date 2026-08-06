/**
 * Knowledge Service — Knowledge Repository Access
 *
 * Provides knowledge retrieval for Spark and other agents. Spark never owns
 * knowledge storage — it retrieves from this service.
 *
 * Wraps: LibraryResource, Note, Collection entities + knowledge engine.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';

class KnowledgeService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('KnowledgeService initialized');
  }

  /** Search across knowledge sources. */
  async search({ query, limit = 10, type }) {
    try {
      const results = [];
      const q = query?.toLowerCase() || '';

      if (!type || type === 'library') {
        const resources = await base44.entities.LibraryResource.list('-updated_date', 50);
        results.push(...resources
          .filter((r) => (r.title || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q))
          .slice(0, limit)
          .map((r) => ({ source: 'library', id: r.id, title: r.title, description: r.description, type: r.type })));
      }

      if (!type || type === 'notes') {
        const notes = await base44.entities.Note.list('-updated_date', 50);
        results.push(...notes
          .filter((n) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
          .slice(0, limit)
          .map((n) => ({ source: 'notes', id: n.id, title: n.title, description: (n.content || '').slice(0, 200), type: 'note' })));
      }

      return results.slice(0, limit);
    } catch (e) {
      logger.error('Knowledge search failed', { error: e.message });
      return [];
    }
  }

  /** Retrieve a specific knowledge resource. */
  async retrieve(resourceId, source = 'library') {
    try {
      const entity = source === 'notes' ? base44.entities.Note : base44.entities.LibraryResource;
      return await entity.get(resourceId);
    } catch (e) {
      logger.error('Knowledge retrieve failed', { error: e.message });
      return null;
    }
  }

  get ready() { return this._ready; }
}

export const knowledgeService = new KnowledgeService();
export default knowledgeService;
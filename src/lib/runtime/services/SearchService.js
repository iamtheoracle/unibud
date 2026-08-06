/**
 * Search Service — Entity & Student Search
 *
 * Provides cross-entity search for agents. Wraps studentSearch backend
 * function and direct entity queries.
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';

class SearchService {
  constructor() { this._ready = false; }

  async init() {
    this._ready = true;
    logger.info('SearchService initialized');
  }

  /** Search students via the studentSearch backend function. */
  async searchStudents(query, limit = 10) {
    try {
      const res = await base44.functions.invoke('studentSearch', { query, limit });
      return res?.results || res || [];
    } catch (e) {
      logger.error('Student search failed', { error: e.message });
      return [];
    }
  }

  /** Search across multiple entity types. */
  async searchEntities(query, entities = [], limit = 5) {
    try {
      const q = query?.toLowerCase() || '';
      const results = [];
      for (const entityName of entities) {
        const entity = base44.entities[entityName];
        if (!entity?.list) continue;
        const items = await entity.list('-updated_date', limit * 2);
        results.push(...items
          .filter((item) => JSON.stringify(item).toLowerCase().includes(q))
          .slice(0, limit)
          .map((item) => ({ entity: entityName, id: item.id, data: item })));
      }
      return results;
    } catch (e) {
      logger.error('Entity search failed', { error: e.message });
      return [];
    }
  }

  get ready() { return this._ready; }
}

export const searchService = new SearchService();
export default searchService;
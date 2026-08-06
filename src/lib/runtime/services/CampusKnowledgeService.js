/**
 * Campus Knowledge Service — Campus Information & FAQ
 *
 * Answers campus-specific questions by searching across academic
 * calendar events, emergency notices, campus locations, help articles,
 * and staff announcements.
 *
 * Flow: Nexus → CampusIntelligenceEngine → CampusKnowledgeService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class CampusKnowledgeService extends BaseService {
  constructor() {
    super({
      id: 'campusKnowledge',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['answer_campus_question', 'find_location'],
    });
  }

  async _onInit() {
    logger.info('CampusKnowledgeService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.CampusLocation || !!base44.entities?.HelpArticle;
    return { healthy: available, detail: available ? 'Knowledge entities available' : 'Knowledge entities missing' };
  }

  /**
   * Answer a campus question by searching knowledge sources.
   * @param {{ query, institutionId? }} params
   * @returns {Promise<Array>} Knowledge items matching the query
   */
  async answer({ query, institutionId }) {
    const start = Date.now();
    try {
      const queryLower = (query || '').toLowerCase();

      const [locations, helpArticles, announcements, calendarEvents, emergencies] = await Promise.all([
        this._queryLocations(institutionId),
        this._queryHelpArticles(institutionId),
        this._queryAnnouncements(institutionId),
        this._queryCalendar(institutionId),
        this._queryEmergencies(institutionId),
      ]);

      const allItems = [
        ...locations.map((l) => this._scoreLocation(l, queryLower)),
        ...helpArticles.map((a) => this._scoreArticle(a, queryLower)),
        ...announcements.map((a) => this._scoreAnnouncement(a, queryLower)),
        ...calendarEvents.map((e) => this._scoreCalendarEvent(e, queryLower)),
        ...emergencies.map((e) => this._scoreEmergency(e, queryLower)),
      ]
        .filter((item) => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      this._recordRequest(Date.now() - start);
      return allItems;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Campus knowledge search failed', { error: e.message });
      return [];
    }
  }

  async _queryLocations(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.CampusLocation.filter(filter, '-created_date', 20);
    } catch { return []; }
  }

  async _queryHelpArticles(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.HelpArticle.filter(filter, '-created_date', 20);
    } catch { return []; }
  }

  async _queryAnnouncements(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.StaffAnnouncement.filter(filter, '-created_date', 10);
    } catch { return []; }
  }

  async _queryCalendar(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.AcademicCalendarEvent.filter(filter, '-start_date', 10);
    } catch { return []; }
  }

  async _queryEmergencies(institutionId) {
    try {
      const filter = { status: 'active' };
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.EmergencyNotice.filter(filter, '-created_date', 5);
    } catch { return []; }
  }

  _scoreLocation(loc, queryLower) {
    let score = 0;
    const name = (loc.name || '').toLowerCase();
    const desc = (loc.description || '').toLowerCase();
    if (name.includes(queryLower) || desc.includes(queryLower)) score += 60;
    return {
      id: loc.id, name: loc.name || 'Location', type: 'knowledge',
      knowledgeType: 'location', content: loc.description, location: loc.building || loc.address,
      matchScore: score,
    };
  }

  _scoreArticle(article, queryLower) {
    let score = 0;
    const title = (article.title || '').toLowerCase();
    const body = (article.content || article.body || '').toLowerCase();
    if (title.includes(queryLower)) score += 60;
    if (body.includes(queryLower)) score += 30;
    return {
      id: article.id, name: article.title || 'Help Article', type: 'knowledge',
      knowledgeType: 'article', content: article.content || article.body,
      matchScore: score,
    };
  }

  _scoreAnnouncement(ann, queryLower) {
    let score = 0;
    const title = (ann.title || '').toLowerCase();
    const body = (ann.body || ann.content || '').toLowerCase();
    if (title.includes(queryLower)) score += 50;
    if (body.includes(queryLower)) score += 30;
    return {
      id: ann.id, name: ann.title || 'Announcement', type: 'knowledge',
      knowledgeType: 'announcement', content: ann.body || ann.content,
      matchScore: score,
    };
  }

  _scoreCalendarEvent(event, queryLower) {
    let score = 0;
    if ((event.title || '').toLowerCase().includes(queryLower)) score += 50;
    if ((event.description || '').toLowerCase().includes(queryLower)) score += 25;
    return {
      id: event.id, name: event.title || 'Calendar Event', type: 'knowledge',
      knowledgeType: 'calendar', content: event.description, date: event.start_date,
      matchScore: score,
    };
  }

  _scoreEmergency(notice, queryLower) {
    let score = 0;
    if ((notice.title || '').toLowerCase().includes(queryLower)) score += 70;
    if ((notice.message || '').toLowerCase().includes(queryLower)) score += 40;
    return {
      id: notice.id, name: notice.title || 'Emergency Notice', type: 'knowledge',
      knowledgeType: 'emergency', content: notice.message, severity: notice.severity,
      matchScore: score,
    };
  }
}

export const campusKnowledgeService = new CampusKnowledgeService();
export default campusKnowledgeService;
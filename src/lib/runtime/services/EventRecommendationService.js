/**
 * Event Recommendation Service — Campus Events & Study Sessions
 *
 * Recommends relevant campus events: revision sessions, workshops,
 * seminars, study sessions, and academic calendar events.
 *
 * Flow: Nexus → CampusIntelligenceEngine → EventRecommendationService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class EventRecommendationService extends BaseService {
  constructor() {
    super({
      id: 'eventRecommendation',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_events', 'recommend_sessions'],
    });
  }

  async _onInit() {
    logger.info('EventRecommendationService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.CampusEvent;
    return { healthy: available, detail: available ? 'CampusEvent available' : 'CampusEvent missing' };
  }

  /**
   * Find events matching the given criteria.
   * @param {{ subject?, courseCode?, eventType?, institutionId? }} criteria
   * @returns {Promise<Array>} Event candidates
   */
  async findEvents({ subject, courseCode, eventType, institutionId }) {
    const start = Date.now();
    try {
      const [campusEvents, studySessions, calendarEvents] = await Promise.all([
        this._queryCampusEvents(eventType, institutionId),
        this._queryStudySessions(subject, courseCode, institutionId),
        this._queryCalendarEvents(institutionId),
      ]);

      const now = new Date();
      const allCandidates = [
        ...campusEvents.map((e) => this._scoreCampusEvent(e, { subject, courseCode })),
        ...studySessions.map((e) => this._scoreStudySession(e, { subject, courseCode })),
        ...calendarEvents.map((e) => this._scoreCalendarEvent(e, { subject })),
      ]
        .filter((e) => e.matchScore > 0 && (!e.date || new Date(e.date) >= now))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      this._recordRequest(Date.now() - start);
      return allCandidates;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Event recommendation failed', { error: e.message });
      return [];
    }
  }

  async _queryCampusEvents(eventType, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.CampusEvent.filter(filter, '-start_date', 15);
    } catch { return []; }
  }

  async _queryStudySessions(subject, courseCode, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (courseCode) filter.course_code = courseCode;
      return await base44.entities.StudySession.filter(filter, '-created_date', 15);
    } catch { return []; }
  }

  async _queryCalendarEvents(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.AcademicCalendarEvent.filter(filter, '-start_date', 10);
    } catch { return []; }
  }

  _scoreCampusEvent(event, { subject, courseCode }) {
    let score = 0;
    const title = (event.title || '').toLowerCase();
    const tags = (event.tags || []).join(' ').toLowerCase();
    if (subject && (title.includes(subject.toLowerCase()) || tags.includes(subject.toLowerCase()))) score += 50;
    if (courseCode && title.includes(courseCode.toLowerCase())) score += 30;
    if (event.category === 'academic' || event.category === 'workshop') score += 15;
    return {
      id: event.id, name: event.title || 'Campus Event', type: 'event',
      eventType: event.category || 'general', date: event.start_date || event.date,
      location: event.location, description: event.description,
      isUpcoming: event.start_date ? new Date(event.start_date) > new Date() : false,
      matchScore: score,
    };
  }

  _scoreStudySession(session, { subject, courseCode }) {
    let score = 0;
    if (courseCode && session.course_code?.toLowerCase().includes(courseCode.toLowerCase())) score += 50;
    if (subject && (session.subject || session.title || '').toLowerCase().includes(subject.toLowerCase())) score += 30;
    return {
      id: session.id, name: session.title || 'Study Session', type: 'event',
      eventType: 'study_session', date: session.scheduled_date || session.date,
      location: session.location, description: session.description,
      isUpcoming: session.scheduled_date ? new Date(session.scheduled_date) > new Date() : false,
      matchScore: score,
    };
  }

  _scoreCalendarEvent(event, { subject }) {
    let score = 0;
    if (subject && (event.title || '').toLowerCase().includes(subject.toLowerCase())) score += 30;
    if (event.type === 'exam_period' || event.type === 'registration' || event.type === 'deadline') score += 20;
    return {
      id: event.id, name: event.title || 'Calendar Event', type: 'event',
      eventType: event.type, date: event.start_date,
      location: event.location, description: event.description,
      isUpcoming: event.start_date ? new Date(event.start_date) > new Date() : false,
      matchScore: score,
    };
  }
}

export const eventRecommendationService = new EventRecommendationService();
export default eventRecommendationService;
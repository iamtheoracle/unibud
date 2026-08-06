/**
 * Presence Service — Online Status & Active Study Sessions
 *
 * Tracks who is online, what they're studying, and which active
 * study sessions are happening right now. Powers real-time
 * recommendations like "Three classmates are discussing this topic."
 *
 * Flow: Nexus → CampusIntelligenceEngine → PresenceService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

class PresenceService extends BaseService {
  constructor() {
    super({
      id: 'presence',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['get_online_presence', 'get_active_sessions'],
    });
  }

  async _onInit() {
    logger.info('PresenceService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.Presence;
    return { healthy: available, detail: available ? 'Presence entity available' : 'Presence entity missing' };
  }

  /**
   * Get online presence and active study sessions.
   * @param {{ courseCode?, subject?, institutionId? }} criteria
   * @returns {Promise<{ onlineUsers: Array, activeSessions: Array }>}
   */
  async getPresence({ courseCode, subject, institutionId }) {
    const start = Date.now();
    try {
      const [presence, workspacePresence, studySessions] = await Promise.all([
        this._queryPresence(institutionId),
        this._queryWorkspacePresence(institutionId),
        this._queryStudySessions(courseCode, institutionId),
      ]);

      const now = Date.now();
      const staleCutoff = new Date(now - STALE_THRESHOLD_MS);

      // Filter to active (non-stale) presence
      const onlineUsers = [
        ...presence.map((p) => this._formatPresence(p, courseCode, subject)),
        ...workspacePresence.map((p) => this._formatWorkspacePresence(p, courseCode, subject)),
      ]
        .filter((u) => u.lastSeen && new Date(u.lastSeen) > staleCutoff)
        .filter((u) => u.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      // Active study sessions
      const activeSessions = studySessions
        .filter((s) => s.scheduled_date && new Date(s.scheduled_date) <= new Date(now + 60 * 60 * 1000))
        .map((s) => ({
          id: s.id, name: s.title || 'Study Session', type: 'session',
          courseCode: s.course_code, subject: s.subject,
          startTime: s.scheduled_date, location: s.location,
          matchScore: this._scoreSession(s, courseCode, subject),
        }))
        .filter((s) => s.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      this._recordRequest(Date.now() - start);
      return { onlineUsers, activeSessions };
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Presence query failed', { error: e.message });
      return { onlineUsers: [], activeSessions: [] };
    }
  }

  async _queryPresence(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.Presence.filter(filter, '-updated_date', 20);
    } catch { return []; }
  }

  async _queryWorkspacePresence(institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      return await base44.entities.WorkspacePresence.filter(filter, '-updated_date', 20);
    } catch { return []; }
  }

  async _queryStudySessions(courseCode, institutionId) {
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;
      if (courseCode) filter.course_code = courseCode;
      return await base44.entities.StudySession.filter(filter, '-scheduled_date', 15);
    } catch { return []; }
  }

  _formatPresence(p, courseCode, subject) {
    let score = 10;
    if (courseCode && (p.course_code || p.activity || '').toLowerCase().includes(courseCode.toLowerCase())) score += 40;
    if (subject && (p.activity || '').toLowerCase().includes(subject.toLowerCase())) score += 30;
    return {
      id: p.id, name: p.user_name || p.name || 'Student', type: 'presence',
      status: p.status || 'online', activity: p.activity,
      courseCode: p.course_code, lastSeen: p.updated_date || p.last_seen,
      matchScore: score,
    };
  }

  _formatWorkspacePresence(p, courseCode, subject) {
    let score = 10;
    if (courseCode && (p.course_code || p.activity || '').toLowerCase().includes(courseCode.toLowerCase())) score += 40;
    if (subject && (p.activity || '').toLowerCase().includes(subject.toLowerCase())) score += 30;
    return {
      id: p.id, name: p.user_name || p.name || 'Student', type: 'presence',
      status: p.status || 'online', activity: p.activity,
      courseCode: p.course_code, lastSeen: p.updated_date || p.last_seen,
      matchScore: score,
    };
  }

  _scoreSession(session, courseCode, subject) {
    let score = 20;
    if (courseCode && session.course_code?.toLowerCase().includes(courseCode.toLowerCase())) score += 40;
    if (subject && (session.subject || '').toLowerCase().includes(subject.toLowerCase())) score += 30;
    return score;
  }
}

export const presenceService = new PresenceService();
export default presenceService;
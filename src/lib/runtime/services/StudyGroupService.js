/**
 * Study Group Service — Group Discovery & Activity Tracking
 *
 * Finds active study groups matching a topic, course, or subject.
 * Tracks group activity, member count, capacity, and recent discussions
 * to calculate an activity score for recommendation ranking.
 *
 * Flow: Oracle → Nexus → StudentRoutingService → StudyGroupService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { BaseService } from './BaseService';

class StudyGroupService extends BaseService {
  constructor() {
    super({
      id: 'studyGroup',
      version: '1.0.0',
      dependencies: ['identity'],
      capabilities: ['find_groups', 'get_activity_score'],
    });
  }

  async _onInit() {
    logger.info('StudyGroupService initialized');
  }

  async _onHealth() {
    const available = !!base44.entities?.StudyGroup;
    return { healthy: available, detail: available ? 'StudyGroup entity available' : 'StudyGroup entity missing' };
  }

  /**
   * Find study groups matching the given criteria.
   * @param {{ courseCode?, subject?, topic?, institutionId?, userId? }} criteria
   * @returns {Promise<Array>} Group candidates with activity scores
   */
  async findGroups({ courseCode, subject, topic, institutionId, userId }) {
    const start = Date.now();
    try {
      const filter = {};
      if (institutionId) filter.institution_id = institutionId;

      const groups = await base44.entities.StudyGroup.filter(filter, '-created_date', 30);

      // Score each group by match
      const candidates = groups
        .map((g) => this._scoreGroup(g, { courseCode, subject, topic }))
        .filter((g) => g.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      // Enrich with activity scores (batch query recent messages)
      const enriched = await Promise.all(
        candidates.slice(0, 10).map(async (g) => {
          const activity = await this._getActivityScore(g.id);
          return { ...g, activityScore: activity.score, recentActivity: activity.recent, memberCount: g.memberCount };
        })
      );

      this._recordRequest(Date.now() - start);
      return enriched;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Study group search failed', { error: e.message });
      return [];
    }
  }

  _scoreGroup(group, { courseCode, subject, topic }) {
    let matchScore = 0;
    const groupSubject = (group.subject || '').toLowerCase();
    const groupCourse = (group.course_code || '').toLowerCase();
    const groupName = (group.name || '').toLowerCase();
    const groupTags = (group.tags || []).map((t) => t?.toLowerCase());

    if (subject) {
      const subjectLower = subject.toLowerCase();
      if (groupSubject.includes(subjectLower)) matchScore += 50;
      if (groupTags.some((t) => t?.includes(subjectLower))) matchScore += 20;
    }

    if (courseCode) {
      if (groupCourse.includes(courseCode.toLowerCase())) matchScore += 40;
    }

    if (topic) {
      const topicLower = topic.toLowerCase();
      if (groupName.includes(topicLower) || groupSubject.includes(topicLower)) matchScore += 30;
      if (groupTags.some((t) => t?.includes(topicLower))) matchScore += 15;
    }

    const memberCount = group.members?.length || group.member_count || 0;

    return {
      id: group.id,
      name: group.name || 'Study Group',
      type: 'study_group',
      subject: group.subject,
      courseCode: group.course_code,
      memberCount,
      capacity: group.max_members || 50,
      tags: group.tags || [],
      matchScore,
    };
  }

  async _getActivityScore(groupId) {
    try {
      const messages = await base44.entities.StudyGroupMessage.filter(
        { study_group_id: groupId },
        '-created_date',
        10
      );

      // Activity score: based on recent messages (last 7 days)
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const recentMessages = messages.filter(
        (m) => m.created_date && new Date(m.created_date).getTime() > weekAgo
      );

      const score = Math.min(100, recentMessages.length * 15);
      return { score, recent: recentMessages.length > 0 };
    } catch {
      return { score: 0, recent: false };
    }
  }
}

export const studyGroupService = new StudyGroupService();
export default studyGroupService;
/**
 * Recommendation Service — Candidate Scoring & Ranking
 *
 * Scores and ranks routing candidates (study groups, mentors, tutors)
 * using configurable weighting. The Student Routing Engine uses this
 * service to determine the best recommendations for a student.
 *
 * Weighting (configurable via ConfigurationService):
 *   topic_match           35%
 *   course_match          20%
 *   availability          15%
 *   mentor_rating          10%
 *   group_activity        10%
 *   response_speed         5%
 *   relationship_history   5%
 *
 * Flow: Oracle → Nexus → StudentRoutingService → RecommendationService
 */

import { logger } from '../logger';
import { configurationService } from './ConfigurationService';
import { BaseService } from './BaseService';

const DEFAULT_WEIGHTS = {
  topicMatch: 0.35,
  courseMatch: 0.20,
  availability: 0.15,
  mentorRating: 0.10,
  groupActivity: 0.10,
  responseSpeed: 0.05,
  relationshipHistory: 0.05,
};

class RecommendationService extends BaseService {
  constructor() {
    super({
      id: 'recommendation',
      version: '1.0.0',
      dependencies: ['configuration'],
      capabilities: ['score', 'rank'],
    });
  }

  async _onInit() {
    logger.info('RecommendationService initialized');
  }

  async _onHealth() {
    return { healthy: true, detail: 'In-memory scoring engine' };
  }

  /**
   * Score a single candidate against the routing context.
   * @param {Object} candidate - Study group, mentor, or tutor
   * @param {Object} context - { topic, courseCode, workload, userHistory }
   * @returns {number} Score 0-100
   */
  score(candidate, context = {}) {
    const weights = this._getWeights();
    let total = 0;

    // Topic match (0-100) — how well the candidate matches the topic
    const topicScore = this._scoreTopicMatch(candidate, context.topic);
    total += topicScore * weights.topicMatch;

    // Course match (0-100) — does the candidate cover the same course
    const courseScore = this._scoreCourseMatch(candidate, context.courseCode);
    total += courseScore * weights.courseMatch;

    // Availability (0-100) — is the candidate available now/soon
    const availScore = this._scoreAvailability(candidate);
    total += availScore * weights.availability;

    // Mentor rating (0-100) — rating normalized to 0-100
    const ratingScore = (candidate.rating || 0) * 20; // 5*20=100
    total += ratingScore * weights.mentorRating;

    // Group activity (0-100) — how active is the group
    const activityScore = candidate.activityScore || 0;
    total += activityScore * weights.groupActivity;

    // Response speed (0-100) — based on recent activity
    const speedScore = candidate.recentActivity ? 80 : (candidate.matchScore || 0) * 0.3;
    total += speedScore * weights.responseSpeed;

    // Relationship history (0-100) — has the student interacted before
    const historyScore = this._scoreHistory(candidate, context.userHistory);
    total += historyScore * weights.relationshipHistory;

    return Math.round(Math.min(100, total));
  }

  /**
   * Rank candidates by score, highest first.
   * @param {Array} candidates
   * @param {Object} context
   * @returns {Array} Sorted candidates with scores and reasons
   */
  rank(candidates, context = {}) {
    return candidates
      .map((c) => {
        const score = this.score(c, context);
        return { ...c, recommendationScore: score, reason: this._buildReason(c, context, score) };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  _getWeights() {
    const custom = configurationService.get?.('routing.weights');
    return custom || DEFAULT_WEIGHTS;
  }

  _scoreTopicMatch(candidate, topic) {
    if (!topic) return candidate.matchScore || 50;
    const topicLower = topic.toLowerCase();
    const fields = [
      candidate.subject, candidate.name,
      ...(candidate.subjects || []), ...(candidate.tags || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(topicLower) ? 100 : (candidate.matchScore || 30);
  }

  _scoreCourseMatch(candidate, courseCode) {
    if (!courseCode) return 50;
    const codeLower = courseCode.toLowerCase();
    const fields = [
      candidate.courseCode, candidate.course_code,
      ...(candidate.courseCodes || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(codeLower) ? 100 : 0;
  }

  _scoreAvailability(candidate) {
    const avail = candidate.availability;
    if (!avail || avail.length === 0) return 40;
    return 80;
  }

  _scoreHistory(candidate, userHistory = []) {
    if (!userHistory || userHistory.length === 0) return 20;
    return userHistory.includes(candidate.id) ? 100 : 20;
  }

  _buildReason(candidate, context, score) {
    const reasons = [];
    if (candidate.matchScore > 40) reasons.push('strong topic match');
    if (candidate.rating >= 4) reasons.push(`highly rated (${candidate.rating.toFixed(1)}★)`);
    if (candidate.recentActivity) reasons.push('active today');
    if (candidate.memberCount > 5) reasons.push(`${candidate.memberCount} members`);
    if (reasons.length === 0) reasons.push('available match');
    return reasons.join(', ');
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
/**
 * Recommendation Service — Candidate Scoring, Ranking & Memory Feedback
 *
 * Scores and ranks routing candidates using configurable weighting.
 * The Campus Intelligence Engine uses this service to determine the
 * best recommendations for a student.
 *
 * Weighting (configurable via ConfigurationService, admin-adjustable):
 *   topicMatch              20%
 *   courseMatch             15%
 *   availability            10%
 *   recentActivity          10%
 *   relationshipScore        8%
 *   academicPerformance      8%
 *   departmentMatch          7%
 *   mentorRating             7%
 *   responseTime             5%
 *   campusProximity          5%
 *   workloadCompatibility    5%
 *
 * Memory feedback: records recommendation outcomes (accepted/ignored)
 * and adjusts weights per-user so the system personalizes over time.
 *
 * Flow: Nexus → CampusIntelligenceEngine → RecommendationService
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { configurationService } from './ConfigurationService';
import { BaseService } from './BaseService';

const DEFAULT_WEIGHTS = {
  topicMatch: 0.20,
  courseMatch: 0.15,
  availability: 0.10,
  recentActivity: 0.10,
  relationshipScore: 0.08,
  academicPerformance: 0.08,
  departmentMatch: 0.07,
  mentorRating: 0.07,
  responseTime: 0.05,
  campusProximity: 0.05,
  workloadCompatibility: 0.05,
};

class RecommendationService extends BaseService {
  constructor() {
    super({
      id: 'recommendation',
      version: '2.0.0',
      dependencies: ['configuration'],
      capabilities: ['score', 'rank', 'record_feedback', 'get_user_preferences'],
    });
    // In-memory feedback cache: userId → [{ type, outcome, timestamp }]
    this._feedbackCache = new Map();
  }

  async _onInit() {
    logger.info('RecommendationService initialized (v2 — expanded weights + memory feedback)');
  }

  async _onHealth() {
    return { healthy: true, detail: 'In-memory scoring engine with memory feedback' };
  }

  /**
   * Score a single candidate against the routing context.
   * Uses configurable weights, adjusted per-user by feedback history.
   */
  score(candidate, context = {}) {
    const baseWeights = this._getWeights();
    const weights = this._applyUserPreferences(baseWeights, context.userId);
    let total = 0;

    // Topic match — how well the candidate matches the topic
    total += this._scoreTopicMatch(candidate, context.topic) * weights.topicMatch;

    // Course match — does the candidate cover the same course
    total += this._scoreCourseMatch(candidate, context.courseCode) * weights.courseMatch;

    // Availability — is the candidate available now/soon
    total += this._scoreAvailability(candidate) * weights.availability;

    // Recent activity — how active is the group/candidate
    total += this._scoreRecentActivity(candidate) * weights.recentActivity;

    // Relationship score — has the student interacted before
    total += this._scoreRelationship(candidate, context.userHistory) * weights.relationshipScore;

    // Academic performance — candidate's GPA/grade if available
    total += this._scoreAcademicPerformance(candidate) * weights.academicPerformance;

    // Department match — same department as the student
    total += this._scoreDepartmentMatch(candidate, context.department) * weights.departmentMatch;

    // Mentor rating — rating normalized to 0-100
    total += ((candidate.rating || 0) * 20) * weights.mentorRating;

    // Response time — based on recent activity
    total += this._scoreResponseTime(candidate) * weights.responseTime;

    // Campus proximity — location match if available
    total += this._scoreProximity(candidate, context.location) * weights.campusProximity;

    // Workload compatibility — does this recommendation fit the student's workload
    total += this._scoreWorkloadCompatibility(candidate, context.workload) * weights.workloadCompatibility;

    return Math.round(Math.min(100, total));
  }

  /**
   * Rank candidates by score, highest first.
   */
  rank(candidates, context = {}) {
    return candidates
      .map((c) => {
        const score = this.score(c, context);
        return { ...c, recommendationScore: score, reason: this._buildReason(c, context, score) };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  /**
   * Record feedback on a recommendation outcome.
   * The system learns user preferences over time.
   * @param {string} userId
   * @param {string} recommendationType - 'study_group', 'mentor', 'resource', etc.
   * @param {string} outcome - 'accepted', 'ignored', 'rejected'
   */
  recordFeedback(userId, recommendationType, outcome) {
    if (!userId || !recommendationType || !outcome) return;

    if (!this._feedbackCache.has(userId)) {
      this._feedbackCache.set(userId, []);
    }
    this._feedbackCache.get(userId).push({
      type: recommendationType,
      outcome,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 feedback records per user
    const history = this._feedbackCache.get(userId);
    if (history.length > 50) {
      this._feedbackCache.set(userId, history.slice(-50));
    }

    logger.info('Feedback recorded', { userId, type: recommendationType, outcome });
  }

  /**
   * Get user's recommendation preferences based on feedback history.
   * Returns adjusted weights that favor accepted types and reduce ignored types.
   */
  getUserPreferences(userId) {
    const feedback = this._feedbackCache.get(userId) || [];
    if (feedback.length === 0) return null;

    const typeCounts = {};
    for (const f of feedback) {
      if (!typeCounts[f.type]) typeCounts[f.type] = { accepted: 0, ignored: 0, rejected: 0 };
      typeCounts[f.type][f.outcome] = (typeCounts[f.type][f.outcome] || 0) + 1;
    }

    return { totalFeedback: feedback.length, typeCounts };
  }

  // ── Private scoring methods ──

  _getWeights() {
    const custom = configurationService.get?.('campusIntelligence.weights');
    return custom || DEFAULT_WEIGHTS;
  }

  /**
   * Apply user-specific weight adjustments based on feedback history.
   * If a user consistently ignores study groups, reduce group-related weights
   * and increase mentor-related weights.
   */
  _applyUserPreferences(baseWeights, userId) {
    if (!userId) return baseWeights;

    const prefs = this.getUserPreferences(userId);
    if (!prefs) return baseWeights;

    const adjusted = { ...baseWeights };

    // If user ignored study groups 3+ times, reduce group activity weight, boost mentor rating
    if (prefs.typeCounts.study_group?.ignored >= 3) {
      adjusted.recentActivity *= 0.5;
      adjusted.mentorRating *= 1.5;
    }

    // If user accepted mentors 2+ times, boost mentor rating
    if (prefs.typeCounts.mentor?.accepted >= 2) {
      adjusted.mentorRating *= 1.3;
    }

    // If user accepted resources 2+ times, boost topic match for resources
    if (prefs.typeCounts.resource?.accepted >= 2) {
      adjusted.topicMatch *= 1.2;
    }

    return adjusted;
  }

  _scoreTopicMatch(candidate, topic) {
    if (!topic) return candidate.matchScore || 50;
    const topicLower = topic.toLowerCase();
    const fields = [
      candidate.subject, candidate.name, candidate.title,
      ...(candidate.subjects || []), ...(candidate.tags || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(topicLower) ? 100 : (candidate.matchScore || 30);
  }

  _scoreCourseMatch(candidate, courseCode) {
    if (!courseCode) return 50;
    const codeLower = courseCode.toLowerCase();
    const fields = [
      candidate.courseCode, candidate.course_code,
      ...(candidate.courseCodes || []), ...(candidate.courses || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return fields.includes(codeLower) ? 100 : 0;
  }

  _scoreAvailability(candidate) {
    const avail = candidate.availability;
    if (!avail || avail.length === 0) return 40;
    return 80;
  }

  _scoreRecentActivity(candidate) {
    if (candidate.recentActivity) return 90;
    if (candidate.activityScore) return candidate.activityScore;
    return 30;
  }

  _scoreRelationship(candidate, userHistory = []) {
    if (!userHistory || userHistory.length === 0) return 20;
    return userHistory.includes(candidate.id) ? 100 : 20;
  }

  _scoreAcademicPerformance(candidate) {
    const gpa = candidate.gpa || candidate.cgpa;
    if (!gpa) return 40;
    // Normalize GPA (assuming 5.0 scale) to 0-100
    return Math.min(100, (gpa / 5.0) * 100);
  }

  _scoreDepartmentMatch(candidate, department) {
    if (!department) return 50;
    if (!candidate.department) return 30;
    return candidate.department.toLowerCase().includes(department.toLowerCase()) ? 100 : 20;
  }

  _scoreResponseTime(candidate) {
    if (candidate.recentActivity) return 80;
    return candidate.matchScore ? 40 : 20;
  }

  _scoreProximity(candidate, location) {
    if (!location || !candidate.location) return 50;
    return candidate.location.toLowerCase().includes(location.toLowerCase()) ? 100 : 30;
  }

  _scoreWorkloadCompatibility(candidate, workload) {
    if (!workload) return 50;
    // If student is overloaded, individual mentoring is more compatible than groups
    if (workload.workloadLevel === 'overloaded' || workload.workloadLevel === 'heavy') {
      return candidate.type === 'mentor' || candidate.type === 'tutor' ? 90 : 30;
    }
    return 70;
  }

  _buildReason(candidate, context, score) {
    const reasons = [];
    if (candidate.matchScore > 40) reasons.push('strong topic match');
    if (candidate.rating >= 4) reasons.push(`highly rated (${candidate.rating.toFixed(1)}★)`);
    if (candidate.recentActivity) reasons.push('active today');
    if (candidate.memberCount > 5) reasons.push(`${candidate.memberCount} members`);
    if (candidate.isFollowing) reasons.push('in your network');
    if (candidate.isUpcoming) reasons.push('happening soon');
    if (reasons.length === 0) reasons.push('available match');
    return reasons.join(', ');
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
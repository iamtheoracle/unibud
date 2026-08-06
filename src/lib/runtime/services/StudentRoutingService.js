/**
 * Student Routing Service — Intelligent Study Help Routing
 *
 * The orchestrator of the Student Routing Engine. When a student asks
 * for study help, this service:
 *
 *   1. Classifies the topic (course, topic, difficulty, intent) via LLM
 *   2. Enriches context with academic workload (CourseLoadService)
 *   3. Discovers candidates (StudyGroupService + MentorshipService)
 *   4. Scores and ranks (RecommendationService)
 *   5. Returns structured recommendations for Spark to compose naturally
 *
 * Bud never sees the routing logic — it only displays the response
 * that Spark composes from the structured recommendations.
 *
 * Flow: Oracle → Guardian → Nexus → StudentRoutingService →
 *   TopicClassifier → CourseLoadAnalyzer → CandidateDiscovery →
 *   RecommendationEngine → ResponseComposer (Spark)
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { BaseService } from './BaseService';
import { courseLoadService } from './CourseLoadService';
import { mentorshipService } from './MentorshipService';
import { studyGroupService } from './StudyGroupService';
import { recommendationService } from './RecommendationService';

const STUDY_INTENT_KEYWORDS = [
  'help', 'understand', 'study', 'assignment', 'exam', 'course', 'topic',
  'confused', 'difficult', 'explain', 'learn', 'practice', 'review', 'quiz',
  'test', 'homework', 'project', 'lecture', 'notes', 'flashcard', 'tutor',
  'mentor', 'group', 'linked list', 'calculus', 'chemistry', 'physics',
];

class StudentRoutingService extends BaseService {
  constructor() {
    super({
      id: 'studentRouting',
      version: '1.0.0',
      dependencies: ['courseLoad', 'mentorship', 'studyGroup', 'recommendation', 'model'],
      capabilities: ['route_study_help', 'classify_topic'],
    });
  }

  async _onInit() {
    logger.info('StudentRoutingService initialized');
  }

  async _onHealth() {
    const deps = [courseLoadService, mentorshipService, studyGroupService, recommendationService];
    const allReady = deps.every((d) => d.ready);
    return { healthy: allReady, detail: allReady ? 'All routing dependencies ready' : 'Dependencies not ready' };
  }

  /**
   * Check if a message is study-related (lightweight keyword check).
   * Used by Nexus to decide whether to invoke the routing engine.
   */
  isStudyRelated(message) {
    if (!message) return false;
    const lower = message.toLowerCase();
    return STUDY_INTENT_KEYWORDS.some((kw) => lower.includes(kw));
  }

  /**
   * Route a study help request through the full pipeline.
   * @param {{ message, userId, institutionId?, context? }} input
   * @returns {Promise<{ topic, recommendations, workloadWarning }>}
   */
  async route({ message, userId, institutionId, context = {} }) {
    const start = Date.now();
    const correlationId = `route_${Date.now().toString(36)}`;

    try {
      // 1. Topic Classification — extract course, topic, intent, difficulty
      const classification = await this._classifyTopic(message);
      logger.info('Topic classified', { correlationId, classification });

      // 2. Context Enrichment — calculate academic workload
      const workload = userId
        ? await courseLoadService.calculateWorkload(userId, institutionId)
        : { workloadLevel: 'light', workloadScore: 0, pendingAssignments: 0, upcomingExams: 0 };

      // 3. Candidate Discovery — find matching study groups + mentors in parallel
      const searchCriteria = {
        courseCode: classification.course,
        subject: classification.topic,
        topic: classification.topic,
        institutionId,
        userId,
      };

      const [groups, mentors] = await Promise.all([
        studyGroupService.findGroups(searchCriteria),
        mentorshipService.findMentors(searchCriteria),
      ]);

      // 4. Scoring — rank all candidates
      const routingContext = {
        topic: classification.topic,
        courseCode: classification.course,
        workload,
        userHistory: context.userHistory || [],
      };

      const rankedGroups = recommendationService.rank(groups, routingContext);
      const rankedMentors = recommendationService.rank(mentors, routingContext);

      // 5. Build recommendations — combine and take top candidates
      const recommendations = [
        ...rankedGroups.slice(0, 3).map((g) => ({
          type: 'study_group',
          name: g.name,
          detail: `${g.memberCount} members · ${g.subject || g.courseCode || 'General'}`,
          score: g.recommendationScore,
          reason: g.reason,
          id: g.id,
        })),
        ...rankedMentors.slice(0, 2).map((m) => ({
          type: m.type || 'mentor',
          name: m.name,
          detail: m.type === 'tutor'
            ? `${m.subjects?.join(', ') || 'General'} · ${m.isFree ? 'Free' : `${m.hourlyRate}/hr`}`
            : `${m.subjects?.join(', ') || m.expertise?.join(', ') || 'General'} · ${m.rating.toFixed(1)}★`,
          score: m.recommendationScore,
          reason: m.reason,
          id: m.id,
        })),
      ].sort((a, b) => b.score - a.score).slice(0, 5);

      // Workload-aware warning
      const workloadWarning = this._buildWorkloadWarning(workload, recommendations);

      const result = {
        topic: classification,
        recommendations,
        workloadWarning,
        workload,
      };

      eventBus.publish({
        type: 'routing.completed',
        category: 'routing',
        correlationId,
        payload: {
          candidates: groups.length + mentors.length,
          recommended: recommendations.length,
          workloadLevel: workload.workloadLevel,
        },
      });

      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Student routing failed', { error: e.message, correlationId });
      return {
        topic: { course: null, topic: null, intent: 'unknown', difficulty: 'unknown' },
        recommendations: [],
        workloadWarning: null,
        workload: { workloadLevel: 'light', workloadScore: 0 },
      };
    }
  }

  /**
   * Classify the topic from a user message using LLM.
   * Returns { course, topic, intent, difficulty }.
   */
  async _classifyTopic(message) {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student message and extract structured study information.

Message: "${message}"

Return a JSON object with:
- course: the course code if mentioned (e.g. "CSC202"), or null
- topic: the specific academic topic (e.g. "Linked Lists", "Integration by Parts"), or null
- intent: one of "need_help", "review", "practice", "collaboration", "general"
- difficulty: one of "easy", "medium", "hard", "unknown"

If the message isn't clearly study-related, return all nulls/unknown.`,
        response_json_schema: {
          type: 'object',
          properties: {
            course: { type: ['string', 'null'] },
            topic: { type: ['string', 'null'] },
            intent: { type: 'string', enum: ['need_help', 'review', 'practice', 'collaboration', 'general'] },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard', 'unknown'] },
          },
        },
      });

      return {
        course: result.course || null,
        topic: result.topic || null,
        intent: result.intent || 'general',
        difficulty: result.difficulty || 'unknown',
      };
    } catch (e) {
      logger.warn('Topic classification failed, using fallback', { error: e.message });
      return { course: null, topic: null, intent: 'general', difficulty: 'unknown' };
    }
  }

  _buildWorkloadWarning(workload, recommendations) {
    if (workload.workloadLevel === 'overloaded' || workload.workloadLevel === 'heavy') {
      const hasGroupRecs = recommendations.some((r) => r.type === 'study_group');
      if (hasGroupRecs) {
        return {
          level: workload.workloadLevel,
          message: `Your workload is already ${workload.workloadLevel} this week (${workload.pendingAssignments} assignments, ${workload.upcomingExams} exams). I recommend a focused mentoring session rather than joining another study group.`,
        };
      }
    }
    return null;
  }
}

export const studentRoutingService = new StudentRoutingService();
export default studentRoutingService;
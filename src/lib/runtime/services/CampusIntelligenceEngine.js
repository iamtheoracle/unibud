/**
 * Campus Intelligence Engine — Academic Decision Layer
 *
 * The central academic intelligence orchestrator. When a student asks
 * an academic question, this engine:
 *
 *   1. Classifies the intent via LLM (which academic services are needed)
 *   2. Determines which services to invoke based on intent
 *   3. Calls services in parallel (graph traversal across the campus graph)
 *   4. Aggregates and scores all candidates via RecommendationService
 *   5. Returns structured recommendations for Spark to compose naturally
 *
 * Bud never sees the routing logic — it only displays the response
 * that Spark composes from the structured recommendations.
 *
 * Pipeline:
 *   Bud → Oracle → Guardian → Nexus → CampusIntelligenceEngine →
 *     TopicClassifier → IntentResolver → ServiceDiscovery →
 *     RecommendationEngine → ResponseComposer (Spark)
 *
 * The engine also supports:
 *   - Proactive recommendations (predictive suggestions)
 *   - Memory feedback (user preferences adjust future recommendations)
 *   - Campus graph traversal (reasons over relationships, not keyword matching)
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { BaseService } from './BaseService';
import { studentRoutingService } from './StudentRoutingService';
import { courseLoadService } from './CourseLoadService';
import { mentorshipService } from './MentorshipService';
import { studyGroupService } from './StudyGroupService';
import { classmateDiscoveryService } from './ClassmateDiscoveryService';
import { facultyDirectoryService } from './FacultyDirectoryService';
import { resourceRecommendationService } from './ResourceRecommendationService';
import { eventRecommendationService } from './EventRecommendationService';
import { campusKnowledgeService } from './CampusKnowledgeService';
import { presenceService } from './PresenceService';
import { recommendationService } from './RecommendationService';

// Broader keyword set — the engine handles any academic request, not just study help
const ACADEMIC_KEYWORDS = [
  // Study-related
  'help', 'understand', 'study', 'assignment', 'exam', 'course', 'topic',
  'confused', 'difficult', 'explain', 'learn', 'practice', 'review', 'quiz',
  'test', 'homework', 'project', 'lecture', 'notes', 'flashcard', 'tutor',
  'mentor', 'group', 'recursion', 'calculus', 'chemistry', 'physics', 'biology',
  // Classmate & partner
  'who has', 'classmate', 'partner', 'team up', 'collaborate',
  // Faculty
  'who teaches', 'professor', 'lecturer', 'instructor', 'faculty', 'dean', 'hod', 'staff',
  // Resources
  'past questions', 'past papers', 'textbook', 'material', 'resource', 'where can i get', 'slides',
  // Presence
  'online', 'available now', 'who is', 'anyone', 'who\'s',
  // Events
  'event', 'session', 'workshop', 'seminar', 'revision', 'deadline',
  // Campus info
  'where is', 'when is', 'how do i', 'library', 'registration', 'calendar',
  // Course codes pattern
  'csc', 'mth', 'phy', 'chm', 'bio', 'gst', 'eng',
];

// Intent → Service mapping. Multiple intents can be returned per message.
const INTENT_SERVICE_MAP = {
  study_help: ['studentRouting', 'resourceRecommendation'],
  find_classmates: ['classmateDiscovery'],
  find_faculty: ['facultyDirectory'],
  find_resources: ['resourceRecommendation'],
  find_presence: ['presence'],
  find_study_session: ['presence', 'studyGroup'],
  find_partner: ['classmateDiscovery'],
  workload_help: ['courseLoad', 'mentorship'],
  campus_info: ['campusKnowledge'],
  find_events: ['eventRecommendation'],
};

class CampusIntelligenceEngine extends BaseService {
  constructor() {
    super({
      id: 'campusIntelligence',
      version: '1.0.0',
      dependencies: [
        'studentRouting', 'courseLoad', 'mentorship', 'studyGroup',
        'classmateDiscovery', 'facultyDirectory', 'resourceRecommendation',
        'eventRecommendation', 'campusKnowledge', 'presence', 'recommendation', 'model',
      ],
      capabilities: ['route_academic', 'generate_proactive', 'record_feedback'],
    });
  }

  async _onInit() {
    logger.info('CampusIntelligenceEngine initialized');
  }

  async _onHealth() {
    const deps = [
      studentRoutingService, courseLoadService, mentorshipService, studyGroupService,
      classmateDiscoveryService, facultyDirectoryService, resourceRecommendationService,
      eventRecommendationService, campusKnowledgeService, presenceService, recommendationService,
    ];
    const readyCount = deps.filter((d) => d.ready).length;
    const allReady = readyCount === deps.length;
    return { healthy: allReady, detail: `${readyCount}/${deps.length} services ready` };
  }

  /**
   * Check if a message is academic-related (broader than just study help).
   * Used by Nexus to decide whether to invoke the intelligence engine.
   */
  isAcademicRelated(message) {
    if (!message) return false;
    const lower = message.toLowerCase();
    // Check for course code patterns (e.g. CSC202, MTH101)
    const hasCourseCode = /\b([a-z]{3})\s?\d{3}\b/i.test(message);
    return hasCourseCode || ACADEMIC_KEYWORDS.some((kw) => lower.includes(kw));
  }

  /**
   * Route an academic request through the full intelligence pipeline.
   * @param {{ message, userId, institutionId?, context? }} input
   * @returns {Promise<{ topic, intent, recommendations, workloadWarning, proactiveSuggestions }>}
   */
  async route({ message, userId, institutionId, context = {} }) {
    const start = Date.now();
    const correlationId = `cie_${Date.now().toString(36)}`;

    try {
      // 1. Classify intent — determine which academic services are needed
      const classification = await this._classifyIntent(message);
      logger.info('Intent classified', { correlationId, intents: classification.intents, course: classification.course });

      // 2. Determine which services to invoke
      const servicesToCall = new Set();
      for (const intent of classification.intents) {
        const mapped = INTENT_SERVICE_MAP[intent] || [];
        mapped.forEach((s) => servicesToCall.add(s));
      }
      // If no specific intent matched, default to study help
      if (servicesToCall.size === 0) {
        servicesToCall.add('studentRouting');
        servicesToCall.add('resourceRecommendation');
      }

      // Always calculate workload for context-aware recommendations
      const workload = userId
        ? await courseLoadService.calculateWorkload(userId, institutionId)
        : { workloadLevel: 'light', workloadScore: 0, pendingAssignments: 0, upcomingExams: 0 };

      // 3. Call services in parallel — graph traversal across the campus graph
      const searchCriteria = {
        message,
        courseCode: classification.course,
        subject: classification.topic,
        topic: classification.topic,
        department: context.department,
        level: context.level,
        institutionId,
        userId,
      };

      const servicePromises = [];
      if (servicesToCall.has('studentRouting')) {
        servicePromises.push(this._callService('studentRouting', () =>
          studentRoutingService.route({ message, userId, institutionId, context })
        ));
      }
      if (servicesToCall.has('classmateDiscovery')) {
        servicePromises.push(this._callService('classmateDiscovery', () =>
          classmateDiscoveryService.findClassmates(searchCriteria)
        ));
      }
      if (servicesToCall.has('facultyDirectory')) {
        servicePromises.push(this._callService('facultyDirectory', () =>
          facultyDirectoryService.findFaculty(searchCriteria)
        ));
      }
      if (servicesToCall.has('resourceRecommendation')) {
        servicePromises.push(this._callService('resourceRecommendation', () =>
          resourceRecommendationService.findResources(searchCriteria)
        ));
      }
      if (servicesToCall.has('eventRecommendation')) {
        servicePromises.push(this._callService('eventRecommendation', () =>
          eventRecommendationService.findEvents(searchCriteria)
        ));
      }
      if (servicesToCall.has('campusKnowledge')) {
        servicePromises.push(this._callService('campusKnowledge', () =>
          campusKnowledgeService.answer({ query: message, institutionId })
        ));
      }
      if (servicesToCall.has('presence')) {
        servicePromises.push(this._callService('presence', () =>
          presenceService.getPresence(searchCriteria)
        ));
      }

      const serviceResults = await Promise.all(servicePromises);
      const resultsMap = {};
      serviceResults.forEach((r) => { if (r) resultsMap[r.service] = r.result; });

      // 4. Aggregate all candidates from all services
      const routingContext = {
        topic: classification.topic,
        courseCode: classification.course,
        workload,
        userHistory: context.userHistory || [],
        userId,
      };

      const allCandidates = [];

      // From StudentRoutingService (already scored)
      if (resultsMap.studentRouting?.recommendations) {
        allCandidates.push(...resultsMap.studentRouting.recommendations.map((r) => ({
          ...r, source: 'routing',
        })));
      }

      // From ClassmateDiscovery
      if (resultsMap.classmateDiscovery) {
        const ranked = recommendationService.rank(resultsMap.classmateDiscovery, routingContext);
        allCandidates.push(...ranked.map((r) => ({
          type: 'classmate', name: r.name, detail: `${r.department || 'Same department'} · ${r.level || 'Student'}`,
          score: r.recommendationScore, reason: r.reason, id: r.id, source: 'classmates',
        })));
      }

      // From FacultyDirectory
      if (resultsMap.facultyDirectory) {
        const ranked = recommendationService.rank(resultsMap.facultyDirectory, routingContext);
        allCandidates.push(...ranked.map((r) => ({
          type: 'faculty', name: r.name, detail: `${r.title || 'Faculty'} · ${r.department || ''}`,
          score: r.recommendationScore, reason: r.reason, id: r.id, source: 'faculty',
        })));
      }

      // From ResourceRecommendation
      if (resultsMap.resourceRecommendation) {
        const ranked = recommendationService.rank(resultsMap.resourceRecommendation, routingContext);
        allCandidates.push(...ranked.map((r) => ({
          type: 'resource', name: r.name, detail: `${r.resourceType || 'Resource'} · ${r.courseCode || ''}`,
          score: r.recommendationScore, reason: r.reason, id: r.id, source: 'resources',
        })));
      }

      // From EventRecommendation
      if (resultsMap.eventRecommendation) {
        const ranked = recommendationService.rank(resultsMap.eventRecommendation, routingContext);
        allCandidates.push(...ranked.map((r) => ({
          type: 'event', name: r.name, detail: `${r.eventType || 'Event'} · ${r.date || ''}`,
          score: r.recommendationScore, reason: r.reason, id: r.id, source: 'events',
        })));
      }

      // From CampusKnowledge
      if (resultsMap.campusKnowledge) {
        allCandidates.push(...resultsMap.campusKnowledge.map((k) => ({
          type: 'knowledge', name: k.name, detail: k.knowledgeType || 'Info',
          score: k.matchScore, reason: 'campus knowledge match', id: k.id, source: 'knowledge',
          content: k.content,
        })));
      }

      // From Presence
      if (resultsMap.presence) {
        allCandidates.push(...(resultsMap.presence.onlineUsers || []).map((p) => ({
          type: 'presence', name: p.name, detail: `online now · ${p.activity || 'studying'}`,
          score: p.matchScore, reason: 'currently online', id: p.id, source: 'presence',
        })));
        allCandidates.push(...(resultsMap.presence.activeSessions || []).map((s) => ({
          type: 'session', name: s.name, detail: `starts soon · ${s.location || ''}`,
          score: s.matchScore, reason: 'active session', id: s.id, source: 'presence',
        })));
      }

      // 5. Sort by score and take top recommendations
      const recommendations = allCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      // 6. Build workload-aware warning
      const workloadWarning = this._buildWorkloadWarning(workload, recommendations);

      // 7. Generate proactive suggestions
      const proactiveSuggestions = this._generateProactiveSuggestions(workload, classification, resultsMap);

      const result = {
        topic: classification,
        intent: classification.intents,
        recommendations,
        workloadWarning,
        proactiveSuggestions,
        workload,
      };

      eventBus.publish({
        type: 'intelligence.completed',
        category: 'intelligence',
        correlationId,
        payload: {
          intents: classification.intents,
          servicesCalled: Array.from(servicesToCall),
          candidates: allCandidates.length,
          recommended: recommendations.length,
          workloadLevel: workload.workloadLevel,
        },
      });

      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Campus intelligence routing failed', { error: e.message, correlationId });
      return {
        topic: { course: null, topic: null, intents: ['general'], difficulty: 'unknown' },
        intent: ['general'],
        recommendations: [],
        workloadWarning: null,
        proactiveSuggestions: [],
        workload: { workloadLevel: 'light', workloadScore: 0 },
      };
    }
  }

  /**
   * Generate proactive recommendations based on workload, upcoming exams,
   * and recent activity. Called by Bud's daily briefing or scheduled tasks.
   */
  async generateProactiveRecommendations({ userId, institutionId }) {
    try {
      const workload = userId
        ? await courseLoadService.calculateWorkload(userId, institutionId)
        : { workloadLevel: 'light', pendingAssignments: 0, upcomingExams: 0 };

      const suggestions = [];

      // Exam proximity warning
      if (workload.upcomingExams > 0 && workload.items?.exams?.length > 0) {
        const nextExam = workload.items.exams[0];
        const daysUntil = nextExam.date ? Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        if (daysUntil !== null && daysUntil <= 7) {
          suggestions.push({
            type: 'exam_warning',
            message: `Your ${nextExam.title || nextExam.course_code || 'exam'} is in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. ${workload.workloadLevel === 'heavy' ? 'Your workload is heavy, so I recommend a focused mentoring session rather than joining a new group.' : 'Consider joining a revision session.'}`,
          });
        }
      }

      // Workload warning
      if (workload.workloadLevel === 'overloaded') {
        suggestions.push({
          type: 'workload_warning',
          message: `Your workload is overloaded this week (${workload.pendingAssignments} assignments, ${workload.upcomingExams} exams). I recommend focusing on your current commitments rather than taking on more.`,
        });
      }

      // Active study sessions nearby
      try {
        const presence = await presenceService.getPresence({ institutionId });
        if (presence.activeSessions?.length > 0) {
          const session = presence.activeSessions[0];
          suggestions.push({
            type: 'active_session',
            message: `A ${session.name} starts soon${session.location ? ` at ${session.location}` : ''}.`,
          });
        }
        if (presence.onlineUsers?.length >= 3) {
          suggestions.push({
            type: 'classmates_online',
            message: `${presence.onlineUsers.length} classmates are currently online and studying.`,
          });
        }
      } catch { /* Presence might not be available */ }

      return suggestions;
    } catch (e) {
      logger.error('Proactive recommendation generation failed', { error: e.message });
      return [];
    }
  }

  /**
   * Record feedback on a recommendation — feeds into Bud's long-term memory.
   * The system learns user preferences over time (e.g. prefers mentors over groups).
   */
  async recordFeedback(userId, recommendationType, outcome) {
    try {
      recommendationService.recordFeedback(userId, recommendationType, outcome);

      // Persist to Bud's memory for long-term learning
      if (base44.entities?.BudMemory) {
        await base44.entities.BudMemory.create({
          user_id: userId,
          memory_type: 'recommendation_feedback',
          content: JSON.stringify({ type: recommendationType, outcome, timestamp: new Date().toISOString() }),
        });
      }

      logger.info('Recommendation feedback recorded', { userId, type: recommendationType, outcome });
    } catch (e) {
      logger.error('Failed to record recommendation feedback', { error: e.message });
    }
  }

  // ── Private methods ──

  async _classifyIntent(message) {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student message and determine what academic assistance they need.

Message: "${message}"

Return a JSON object with:
- intents: array of one or more from: "study_help", "find_classmates", "find_faculty", "find_resources", "find_presence", "find_study_session", "find_partner", "workload_help", "campus_info", "find_events"
- course: the course code if mentioned (e.g. "CSC202"), or null
- topic: the specific academic topic (e.g. "Linked Lists"), or null
- difficulty: one of "easy", "medium", "hard", "unknown"

Examples:
- "I don't understand recursion" → intents: ["study_help"], topic: "Recursion"
- "Who has CSC402?" → intents: ["find_classmates"], course: "CSC402"
- "Who teaches Database Systems?" → intents: ["find_faculty"], topic: "Database Systems"
- "Where can I get past questions?" → intents: ["find_resources"]
- "Who is online?" → intents: ["find_presence"]
- "Anyone studying tonight?" → intents: ["find_study_session"]
- "I need a project partner" → intents: ["find_partner"]
- "My assignment is due tomorrow" → intents: ["workload_help"]
- "Where is the library?" → intents: ["campus_info"]`,
        response_json_schema: {
          type: 'object',
          properties: {
            intents: { type: 'array', items: { type: 'string' } },
            course: { type: ['string', 'null'] },
            topic: { type: ['string', 'null'] },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard', 'unknown'] },
          },
        },
      });

      return {
        intents: result.intents?.length > 0 ? result.intents : ['study_help'],
        course: result.course || null,
        topic: result.topic || null,
        difficulty: result.difficulty || 'unknown',
      };
    } catch (e) {
      logger.warn('Intent classification failed, using fallback', { error: e.message });
      return { intents: ['study_help'], course: null, topic: null, difficulty: 'unknown' };
    }
  }

  async _callService(name, fn) {
    try {
      const result = await fn();
      return { service: name, result };
    } catch (e) {
      logger.warn(`Service ${name} failed`, { error: e.message });
      return null;
    }
  }

  _buildWorkloadWarning(workload, recommendations) {
    if (workload.workloadLevel === 'overloaded' || workload.workloadLevel === 'heavy') {
      const hasGroupRecs = recommendations.some((r) => r.type === 'study_group' || r.source === 'routing');
      if (hasGroupRecs) {
        return {
          level: workload.workloadLevel,
          message: `Your workload is already ${workload.workloadLevel} this week (${workload.pendingAssignments} assignments, ${workload.upcomingExams} exams). I recommend a focused mentoring session rather than joining another study group.`,
        };
      }
    }
    return null;
  }

  _generateProactiveSuggestions(workload, classification, resultsMap) {
    const suggestions = [];

    // Active discussion in course group
    if (resultsMap.studentRouting?.recommendations?.some((r) => r.type === 'study_group')) {
      suggestions.push({
        type: 'active_discussion',
        message: 'An active discussion is already happening in your course group.',
      });
    }

    // Classmates online
    if (resultsMap.presence?.onlineUsers?.length >= 3) {
      suggestions.push({
        type: 'classmates_online',
        message: `${resultsMap.presence.onlineUsers.length} classmates are currently studying this topic.`,
      });
    }

    // Revision session soon
    if (resultsMap.eventRecommendation?.some((e) => e.isUpcoming)) {
      const upcoming = resultsMap.eventRecommendation.find((e) => e.isUpcoming);
      suggestions.push({
        type: 'upcoming_session',
        message: `A revision session starts soon: ${upcoming.name}.`,
      });
    }

    return suggestions;
  }
}

export const campusIntelligenceEngine = new CampusIntelligenceEngine();
export default campusIntelligenceEngine;
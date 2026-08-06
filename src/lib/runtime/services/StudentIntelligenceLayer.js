/**
 * Student Intelligence Layer — The Student Operating Intelligence
 *
 * The top-level intelligence orchestrator that sits above all intelligence
 * engines. When a student asks any question, this layer:
 *
 *   1. Classifies the domain via LLM (academic, career, opportunity, etc.)
 *   2. Routes to the appropriate intelligence engine(s)
 *   3. Calls engines in parallel
 *   4. Aggregates structured results
 *   5. Returns to Nexus → Spark for natural language composition
 *
 * Bud remains the single visible AI interface. Oracle remains the
 * coordinator. This layer is the academic decision layer that powers
 * recommendations across the entire platform.
 *
 * Pipeline:
 *   Bud → Oracle → Guardian → Nexus → StudentIntelligenceLayer →
 *     DomainClassifier → EngineRouter → [Campus Intelligence Engine,
 *     Academic Planning, Opportunity Engine, Career Intelligence,
 *     Success Prediction, Campus Digital Twin, Cross-Space Intelligence,
 *     Autonomous Task Engine, Personal Knowledge Graph] →
 *     Aggregator → ResponseComposer (Spark)
 */

import { base44 } from '@/api/base44Client';
import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { BaseService } from './BaseService';
import { campusIntelligenceEngine } from './CampusIntelligenceEngine';
import { academicPlanningService } from './AcademicPlanningService';
import { opportunityEngineService } from './OpportunityEngineService';
import { careerIntelligenceService } from './CareerIntelligenceService';
import { studentSuccessPredictionService } from './StudentSuccessPredictionService';
import { campusDigitalTwinService } from './CampusDigitalTwinService';
import { crossSpaceIntelligenceService } from './CrossSpaceIntelligenceService';
import { autonomousTaskEngine } from './AutonomousTaskEngine';
import { personalKnowledgeGraphService } from './PersonalKnowledgeGraphService';

// Broader keyword set — covers all intelligence domains
const INTELLIGENCE_KEYWORDS = [
  // Academic routing (existing)
  'help', 'understand', 'study', 'assignment', 'exam', 'course', 'topic',
  'confused', 'difficult', 'explain', 'learn', 'practice', 'review', 'quiz',
  'mentor', 'group', 'classmate', 'who has', 'who teaches', 'past questions',
  // Academic planning
  'graduate', 'graduation', 'prerequisite', 'cgpa', 'gpa', 'register', 'registration',
  'degree', 'audit', 'timetable', 'fail', 'retake', 'credits',
  // Opportunity
  'scholarship', 'internship', 'competition', 'hackathon', 'research', 'exchange',
  'fellowship', 'grant', 'opportunity', 'campus job',
  // Career
  'career', 'job', 'skill', 'certification', 'alumni', 'company', 'resume', 'cv',
  'portfolio', 'interview', 'career path',
  // Success prediction
  'risk', 'failing', 'burnout', 'stress', 'attendance', 'performance', 'declining',
  // Campus digital twin
  'where is', 'building', 'room', 'hall', 'library', 'lab', 'study room',
  'parking', 'bus', 'queue', 'nearest', 'available room',
  // Cross-space
  'finance', 'wallet', 'market', 'buy', 'sell', 'housing', 'health', 'wellness',
  'club', 'creator', 'balance',
  // Autonomous
  'register me', 'submit', 'apply for', 'book me', 'enroll', 'cancel',
  'sign me up', 'do it for me',
  // Personal graph
  'goal', 'habit', 'interest', 'strength', 'weakness', 'learning style',
  'my progress', 'my profile',
  // Course codes
  'csc', 'mth', 'phy', 'chm', 'bio', 'gst', 'eng',
];

// Domain → Engine mapping
const DOMAIN_ENGINE_MAP = {
  academic_routing: 'campusIntelligence',
  academic_planning: 'academicPlanning',
  opportunity: 'opportunityEngine',
  career: 'careerIntelligence',
  success_prediction: 'studentSuccessPrediction',
  campus_digital_twin: 'campusDigitalTwin',
  cross_space: 'crossSpaceIntelligence',
  autonomous_task: 'autonomousTaskEngine',
  personal_graph: 'personalKnowledgeGraph',
};

class StudentIntelligenceLayer extends BaseService {
  constructor() {
    super({
      id: 'studentIntelligence',
      version: '1.0.0',
      dependencies: [
        'campusIntelligence', 'academicPlanning', 'opportunityEngine',
        'careerIntelligence', 'studentSuccessPrediction', 'campusDigitalTwin',
        'crossSpaceIntelligence', 'autonomousTaskEngine', 'personalKnowledgeGraph', 'model',
      ],
      capabilities: ['route_intelligence', 'classify_domain', 'generate_proactive_insights'],
    });
  }

  async _onInit() { logger.info('StudentIntelligenceLayer initialized'); }

  async _onHealth() {
    const engines = [
      campusIntelligenceEngine, academicPlanningService, opportunityEngineService,
      careerIntelligenceService, studentSuccessPredictionService, campusDigitalTwinService,
      crossSpaceIntelligenceService, autonomousTaskEngine, personalKnowledgeGraphService,
    ];
    const readyCount = engines.filter((e) => e.ready).length;
    const allReady = readyCount === engines.length;
    return { healthy: allReady, detail: `${readyCount}/${engines.length} engines ready` };
  }

  /**
   * Check if a message needs the intelligence layer.
   */
  isIntelligenceRelated(message) {
    if (!message) return false;
    const lower = message.toLowerCase();
    const hasCourseCode = /\b([a-z]{3})\s?\d{3}\b/i.test(message);
    return hasCourseCode || INTELLIGENCE_KEYWORDS.some((kw) => lower.includes(kw));
  }

  /**
   * Route a request through the full intelligence pipeline.
   */
  async route({ message, userId, institutionId, context = {} }) {
    const start = Date.now();
    const correlationId = `sil_${Date.now().toString(36)}`;

    try {
      // 1. Classify domain — determine which intelligence engines are needed
      const classification = await this._classifyDomain(message);
      logger.info('Domain classified', { correlationId, domains: classification.domains });

      // 2. Route to appropriate engines
      const enginePromises = [];
      const domains = classification.domains;

      for (const domain of domains) {
        const engineName = DOMAIN_ENGINE_MAP[domain];
        if (!engineName) continue;

        enginePromises.push(
          this._callEngine(domain, engineName, { message, userId, institutionId, context, classification })
        );
      }

      // If no domains matched, default to campus intelligence
      if (enginePromises.length === 0) {
        enginePromises.push(
          this._callEngine('academic_routing', 'campusIntelligence', { message, userId, institutionId, context, classification })
        );
      }

      // 3. Call engines in parallel
      const engineResults = await Promise.all(enginePromises);
      const resultsMap = {};
      engineResults.forEach((r) => { if (r) resultsMap[r.domain] = r.result; });

      // 4. Aggregate all recommendations from all engines
      const allRecommendations = [];
      const allInsights = [];
      const allWarnings = [];

      for (const [domain, result] of Object.entries(resultsMap)) {
        if (!result) continue;

        if (result.recommendations) {
          allRecommendations.push(...result.recommendations.map((r) => ({ ...r, domain })));
        }
        if (result.proactiveSuggestions) {
          allInsights.push(...result.proactiveSuggestions.map((s) => ({ ...s, domain })));
        }
        if (result.workloadWarning) {
          allWarnings.push({ ...result.workloadWarning, domain });
        }
        // Engine-specific structured results
        if (result.detail && !result.recommendations) {
          allInsights.push({ type: domain, message: result.detail, domain });
        }
      }

      // Sort recommendations by score
      allRecommendations.sort((a, b) => (b.score || 0) - (a.score || 0));

      const result = {
        classification,
        recommendations: allRecommendations.slice(0, 10),
        insights: allInsights,
        warnings: allWarnings,
        domainsQueried: domains,
      };

      eventBus.publish({
        type: 'intelligence.layer_completed',
        category: 'intelligence',
        correlationId,
        payload: {
          domains, recommendations: allRecommendations.length,
          insights: allInsights.length, warnings: allWarnings.length,
        },
      });

      this._recordRequest(Date.now() - start);
      return result;
    } catch (e) {
      this._recordRequest(Date.now() - start, false);
      logger.error('Student intelligence routing failed', { error: e.message, correlationId });
      return {
        classification: { domains: ['academic_routing'], course: null, topic: null, intent: 'general' },
        recommendations: [], insights: [], warnings: [], domainsQueried: [],
      };
    }
  }

  /**
   * Generate proactive insights across all domains.
   * Called by Bud's daily briefing or scheduled tasks.
   */
  async generateProactiveInsights({ userId, institutionId }) {
    try {
      const [academicProactive, risk, burnout, deadlines, knowledgeGraph] = await Promise.all([
        campusIntelligenceEngine.generateProactiveRecommendations({ userId, institutionId }),
        studentSuccessPredictionService.predictRisk({ userId, institutionId }),
        studentSuccessPredictionService.predictBurnout({ userId, institutionId }),
        opportunityEngineService.getDeadlineAlerts({ userId, institutionId }),
        personalKnowledgeGraphService.getKnowledgeGraph({ userId, institutionId }),
      ]);

      const insights = [];

      // Academic proactive suggestions
      insights.push(...(academicProactive || []).map((s) => ({ ...s, domain: 'academic' })));

      // Risk alert
      if (risk.riskLevel === 'high' || risk.riskLevel === 'moderate') {
        insights.push({ type: 'risk_alert', message: risk.detail, domain: 'success_prediction' });
      }

      // Burnout alert
      if (burnout.burnoutLevel === 'high' || burnout.burnoutLevel === 'moderate') {
        insights.push({ type: 'burnout_alert', message: burnout.detail, domain: 'success_prediction' });
      }

      // Opportunity deadlines
      for (const deadline of deadlines.slice(0, 3)) {
        insights.push({
          type: 'opportunity_deadline',
          message: `${deadline.name} (${deadline.organization}) closes in ${deadline.daysLeft} day(s).`,
          domain: 'opportunity',
        });
      }

      return insights;
    } catch (e) {
      logger.error('Proactive insights generation failed', { error: e.message });
      return [];
    }
  }

  // ── Private methods ──

  async _classifyDomain(message) {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this student message and determine which intelligence domains are needed.

Message: "${message}"

Return a JSON object with:
- domains: array of one or more from: "academic_routing", "academic_planning", "opportunity", "career", "success_prediction", "campus_digital_twin", "cross_space", "autonomous_task", "personal_graph"
- course: course code if mentioned (e.g. "CSC302"), or null
- topic: specific topic, or null
- intent: one of "analyze", "find", "execute", "predict", "recommend", "general"

Examples:
- "I don't understand recursion" → domains: ["academic_routing"], topic: "Recursion", intent: "find"
- "If I fail CSC302, how does it affect graduation?" → domains: ["academic_planning"], course: "CSC302", intent: "analyze"
- "Which scholarships am I eligible for?" → domains: ["opportunity"], intent: "find"
- "Which skills am I missing for data science?" → domains: ["career"], intent: "analyze"
- "Am I at risk of failing this semester?" → domains: ["success_prediction"], intent: "predict"
- "Where is the nearest empty study room?" → domains: ["campus_digital_twin"], intent: "find"
- "Register me for CSC402" → domains: ["autonomous_task", "academic_planning"], course: "CSC402", intent: "execute"
- "What are my strengths?" → domains: ["personal_graph"], intent: "analyze"
- "Show me my wallet balance" → domains: ["cross_space"], intent: "find"`,
        response_json_schema: {
          type: 'object',
          properties: {
            domains: { type: 'array', items: { type: 'string' } },
            course: { type: ['string', 'null'] },
            topic: { type: ['string', 'null'] },
            intent: { type: 'string', enum: ['analyze', 'find', 'execute', 'predict', 'recommend', 'general'] },
          },
        },
      });

      return {
        domains: result.domains?.length > 0 ? result.domains : ['academic_routing'],
        course: result.course || null,
        topic: result.topic || null,
        intent: result.intent || 'general',
      };
    } catch (e) {
      logger.warn('Domain classification failed, using fallback', { error: e.message });
      return { domains: ['academic_routing'], course: null, topic: null, intent: 'general' };
    }
  }

  async _callEngine(domain, engineName, params) {
    try {
      const { message, userId, institutionId, context, classification } = params;
      let result = null;

      switch (engineName) {
        case 'campusIntelligence':
          result = await campusIntelligenceEngine.route({
            message, userId, institutionId,
            context: { userHistory: context.userHistory, department: context.department, level: context.level },
          });
          break;

        case 'academicPlanning':
          if (classification.intent === 'analyze' && classification.course) {
            result = await academicPlanningService.analyzeImpact({
              courseCode: classification.course, outcome: 'fail', userId, institutionId,
            });
          } else {
            result = await academicPlanningService.getDegreeAudit({ userId, institutionId });
            result.recommendations = (await academicPlanningService.recommendCourses({ userId, institutionId }))
              .map((c) => ({ type: 'course', name: `${c.code} — ${c.title}`, detail: `${c.credits} credits · Level ${c.level}`, score: 60, reason: 'eligible to register' }));
          }
          break;

        case 'opportunityEngine':
          result = await opportunityEngineService.findOpportunities({
            type: null, interests: context.interests, institutionId, userId,
          });
          result = { recommendations: result.map((o) => ({
            type: 'opportunity', name: o.name, detail: `${o.opportunityType} · ${o.organization || ''}`,
            score: o.matchScore, reason: o.isApplied ? 'already applied' : 'matches your profile', id: o.id,
          })) };
          break;

        case 'careerIntelligence':
          if (classification.topic?.toLowerCase().includes('skill')) {
            result = await careerIntelligenceService.analyzeSkillGaps({ userId, targetRole: classification.topic, institutionId });
          } else {
            result = await careerIntelligenceService.matchCareerPath({ userId, institutionId });
          }
          result.recommendations = [];
          break;

        case 'studentSuccessPrediction':
          if (classification.intent === 'predict') {
            result = await studentSuccessPredictionService.predictRisk({ userId, institutionId });
          } else {
            result = await studentSuccessPredictionService.analyzePerformance({ userId, institutionId });
          }
          break;

        case 'campusDigitalTwin':
          result = await campusDigitalTwinService.findSpaces({ type: null, available: true, institutionId });
          result = { recommendations: result.map((s) => ({
            type: 'space', name: s.name, detail: `${s.spaceType} · ${s.building || ''} · ${s.isAvailable ? 'Available' : 'Occupied'}`,
            score: s.matchScore, reason: s.isAvailable ? 'available now' : 'occupied', id: s.id,
          })) };
          break;

        case 'crossSpaceIntelligence':
          result = await crossSpaceIntelligenceService.getIntegratedRecommendations({ userId, institutionId });
          result = { recommendations: result };
          break;

        case 'autonomousTaskEngine':
          if (classification.intent === 'execute') {
            const intent = this._mapToTaskIntent(message);
            result = await autonomousTaskEngine.executeTask({
              intent, params: { courseCode: classification.course }, userId, institutionId,
            });
          } else {
            result = await autonomousTaskEngine.getPendingTasks({ userId });
            result = { recommendations: result.map((t) => ({
              type: 'task', name: t.title, detail: `status: ${t.status}`,
              score: 50, reason: 'pending task', id: t.taskId,
            })) };
          }
          break;

        case 'personalKnowledgeGraph':
          result = await personalKnowledgeGraphService.getKnowledgeGraph({ userId, institutionId });
          result.recommendations = [];
          break;

        default:
          result = null;
      }

      return { domain, result };
    } catch (e) {
      logger.warn(`Engine ${engineName} failed`, { error: e.message });
      return null;
    }
  }

  _mapToTaskIntent(message) {
    const lower = (message || '').toLowerCase();
    if (lower.includes('register') && (lower.includes('course') || /\b[a-z]{3}\s?\d{3}\b/i.test(message))) return 'register_course';
    if (lower.includes('apply')) return 'apply_opportunity';
    if (lower.includes('book') && lower.includes('tutor')) return 'book_tutor';
    if (lower.includes('join') && lower.includes('club')) return 'join_club';
    if (lower.includes('book') && (lower.includes('room') || lower.includes('space'))) return 'book_space';
    return 'register_course';
  }
}

export const studentIntelligenceLayer = new StudentIntelligenceLayer();
export default studentIntelligenceLayer;
/**
 * Platform Services — Service Registry & Boot
 *
 * The 14 shared platform services. Agents consume these services;
 * they never own these responsibilities.
 *
 * Boot order: services with no dependencies first, then dependent services.
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';

import { memoryService } from './MemoryService';
import { conversationService } from './ConversationService';
import { knowledgeService } from './KnowledgeService';
import { searchService } from './SearchService';
import { promptService } from './PromptService';
import { modelService } from './ModelService';
import { auditService } from './AuditService';
import { notificationService } from './NotificationService';
import { identityService } from './IdentityService';
import { sessionService } from './SessionService';
import { configurationService } from './ConfigurationService';
import { metricsService } from './MetricsService';
import { telemetryService } from './TelemetryService';
import { healthService } from './HealthService';
import { mediaService } from './MediaService';
import { analyticsService } from './AnalyticsService';
import { permissionsService } from './PermissionsService';
import { integrationsService } from './IntegrationsService';
import { storageService } from './StorageService';
import { courseLoadService } from './CourseLoadService';
import { mentorshipService } from './MentorshipService';
import { studyGroupService } from './StudyGroupService';
import { recommendationService } from './RecommendationService';
import { studentRoutingService } from './StudentRoutingService';
import { classmateDiscoveryService } from './ClassmateDiscoveryService';
import { facultyDirectoryService } from './FacultyDirectoryService';
import { resourceRecommendationService } from './ResourceRecommendationService';
import { eventRecommendationService } from './EventRecommendationService';
import { campusKnowledgeService } from './CampusKnowledgeService';
import { presenceService } from './PresenceService';
import { campusIntelligenceEngine } from './CampusIntelligenceEngine';
import { academicPlanningService } from './AcademicPlanningService';
import { opportunityEngineService } from './OpportunityEngineService';
import { careerIntelligenceService } from './CareerIntelligenceService';
import { studentSuccessPredictionService } from './StudentSuccessPredictionService';
import { campusDigitalTwinService } from './CampusDigitalTwinService';
import { crossSpaceIntelligenceService } from './CrossSpaceIntelligenceService';
import { autonomousTaskEngine } from './AutonomousTaskEngine';
import { personalKnowledgeGraphService } from './PersonalKnowledgeGraphService';
import { studentIntelligenceLayer } from './StudentIntelligenceLayer';

export const services = {
  memory: memoryService,
  conversation: conversationService,
  knowledge: knowledgeService,
  search: searchService,
  prompt: promptService,
  model: modelService,
  audit: auditService,
  notification: notificationService,
  identity: identityService,
  session: sessionService,
  configuration: configurationService,
  metrics: metricsService,
  telemetry: telemetryService,
  health: healthService,
  media: mediaService,
  analytics: analyticsService,
  permissions: permissionsService,
  integrations: integrationsService,
  storage: storageService,
  courseLoad: courseLoadService,
  mentorship: mentorshipService,
  studyGroup: studyGroupService,
  recommendation: recommendationService,
  studentRouting: studentRoutingService,
  classmateDiscovery: classmateDiscoveryService,
  facultyDirectory: facultyDirectoryService,
  resourceRecommendation: resourceRecommendationService,
  eventRecommendation: eventRecommendationService,
  campusKnowledge: campusKnowledgeService,
  presence: presenceService,
  campusIntelligence: campusIntelligenceEngine,
  academicPlanning: academicPlanningService,
  opportunityEngine: opportunityEngineService,
  careerIntelligence: careerIntelligenceService,
  studentSuccessPrediction: studentSuccessPredictionService,
  campusDigitalTwin: campusDigitalTwinService,
  crossSpaceIntelligence: crossSpaceIntelligenceService,
  autonomousTaskEngine: autonomousTaskEngine,
  personalKnowledgeGraph: personalKnowledgeGraphService,
  studentIntelligence: studentIntelligenceLayer,
};

/**
 * Boot all platform services in dependency order.
 * Each service validates its own dependencies before initializing.
 */
export async function bootServices() {
  const order = [
    ['configuration', configurationService],
    ['identity', identityService],
    ['session', sessionService],
    ['memory', memoryService],
    ['conversation', conversationService],
    ['knowledge', knowledgeService],
    ['search', searchService],
    ['prompt', promptService],
    ['model', modelService],
    ['audit', auditService],
    ['notification', notificationService],
    ['metrics', metricsService],
    ['telemetry', telemetryService],
    ['health', healthService],
    ['media', mediaService],
    ['analytics', analyticsService],
    ['permissions', permissionsService],
    ['integrations', integrationsService],
    ['storage', storageService],
    ['courseLoad', courseLoadService],
    ['mentorship', mentorshipService],
    ['studyGroup', studyGroupService],
    ['recommendation', recommendationService],
    ['studentRouting', studentRoutingService],
    ['classmateDiscovery', classmateDiscoveryService],
    ['facultyDirectory', facultyDirectoryService],
    ['resourceRecommendation', resourceRecommendationService],
    ['eventRecommendation', eventRecommendationService],
    ['campusKnowledge', campusKnowledgeService],
    ['presence', presenceService],
    ['campusIntelligence', campusIntelligenceEngine],
    ['academicPlanning', academicPlanningService],
    ['opportunityEngine', opportunityEngineService],
    ['careerIntelligence', careerIntelligenceService],
    ['studentSuccessPrediction', studentSuccessPredictionService],
    ['campusDigitalTwin', campusDigitalTwinService],
    ['crossSpaceIntelligence', crossSpaceIntelligenceService],
    ['autonomousTaskEngine', autonomousTaskEngine],
    ['personalKnowledgeGraph', personalKnowledgeGraphService],
    ['studentIntelligence', studentIntelligenceLayer],
  ];

  const results = {};
  for (const [name, service] of order) {
    try {
      await service.init();
      results[name] = 'ready';
      eventBus.publish({ type: 'service.ready', category: 'lifecycle', payload: { service: name } });
    } catch (e) {
      logger.error(`Service boot failed: ${name}`, { error: e.message });
      results[name] = `failed: ${e.message}`;
    }
  }
  return results;
}

/** Graceful shutdown of all services. */
export async function shutdownServices() {
  logger.info('Shutting down platform services...');
  if (metricsService.shutdown) await metricsService.shutdown();
  eventBus.publish({ type: 'services.shutdown', category: 'lifecycle', payload: {} });
  logger.info('Platform services shut down');
}

export default services;
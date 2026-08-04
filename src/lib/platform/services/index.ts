/**
 * Platform Services — Unified Export
 *
 * All platform service interfaces are re-exported from this single entry
 * point. Experiences and intelligences import platform services from here.
 *
 * Service implementations (local/live) are injected at runtime via the
 * PlatformProvider and PlatformCore — consumers never import concrete
 * implementations directly.
 *
 * Usage:
 *   import type { RecommendationService } from "@/lib/platform/services";
 *   import type { NotificationService }   from "@/lib/platform/services";
 */

export type {
  RecommendationCandidate,
  Recommendation,
  RecommendationRequest,
  RecommendationService,
} from "./recommendation";

export type {
  ModerationCategory,
  ModerationFlag,
  ModerationResult,
  ModerationService,
} from "./moderation";

export type {
  SecurityCheckResult,
  ThreatSignal,
  SecurityService,
} from "./security";

export type {
  PiiType,
  PiiFinding,
  PrivacyService,
} from "./privacy";

export type {
  AnalyticsEvent,
  AnalyticsMetric,
  AnalyticsService,
} from "./analytics";

export type {
  AutomationStatus,
  AutomationTask,
  AutomationHandler,
  AutomationService,
} from "./automation";

export type {
  NotificationPriority,
  NotificationCategory,
  NotificationPayload,
  Notification,
  NotificationService,
} from "./notifications";

export type {
  IntegrationStatus,
  Integration,
  IntegrationService,
} from "./integration";

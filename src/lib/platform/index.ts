/**
 * Platform — Unified Entry Point
 *
 * The single import path for all platform capabilities.
 * Experiences and intelligences import from "@/lib/platform".
 *
 * Layers exported:
 *   services       — 8 platform service interfaces (Recommendation, Moderation,
 *                    Security, Privacy, Analytics, Automation, Notifications, Integration)
 *   infrastructure — All platform infrastructure interfaces (Memory, Search,
 *                    Knowledge, Feed, Community, etc.)
 *   PlatformCore   — Runtime facade (existing, unchanged)
 *
 * Usage:
 *   import type { RecommendationService } from "@/lib/platform";
 *   import { PlatformCore }               from "@/lib/platform";
 */

// ── Service Interfaces ────────────────────────────────────────────────────────
export type {
  RecommendationCandidate,
  Recommendation,
  RecommendationRequest,
  RecommendationService,
} from "./services/recommendation";

export type {
  ModerationCategory,
  ModerationFlag,
  ModerationResult,
  ModerationService,
} from "./services/moderation";

export type {
  SecurityCheckResult,
  ThreatSignal,
  SecurityService,
} from "./services/security";

export type {
  PiiType,
  PiiFinding,
  PrivacyService,
} from "./services/privacy";

export type {
  AnalyticsEvent,
  AnalyticsMetric,
  AnalyticsService,
} from "./services/analytics";

export type {
  AutomationStatus,
  AutomationTask,
  AutomationHandler,
  AutomationService,
} from "./services/automation";

export type {
  NotificationPriority,
  NotificationCategory,
  NotificationPayload,
  Notification,
  NotificationService,
} from "./services/notifications";

export type {
  IntegrationStatus,
  Integration,
  IntegrationService,
} from "./services/integration";

// ── Infrastructure Interfaces ─────────────────────────────────────────────────
export type {
  FeedService,
  CommunityService,
  MarketplaceService,
  UniversityService,
  VideoService,
  AudioService,
  ImageService,
  FeatureFlagsService,
} from "./infrastructure/index";

// ── Runtime Facade (existing) ─────────────────────────────────────────────────
export { PlatformCore } from "./PlatformCore";
export { default as PlatformCoreDefault } from "./PlatformCore";

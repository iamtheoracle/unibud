/**
 * Platform Infrastructure — Unified Export
 *
 * Re-exports all infrastructure service interfaces from Spark and the
 * platform layer. Experiences and intelligences import infrastructure
 * services from here, not from Spark's internals.
 *
 * ─────────────────────────────────────────────────────────────────────
 * IMPLEMENTED (backed by Spark)
 * ─────────────────────────────────────────────────────────────────────
 *   Identity        src/lib/spark/core/identity/interface.ts
 *   Reasoning       src/lib/spark/core/reasoning/interface.ts
 *   Planning        src/lib/spark/core/planning/interface.ts
 *   Memory          src/lib/spark/memory/interface.ts
 *   Context         src/lib/spark/context/interface.ts
 *   Knowledge       src/lib/spark/knowledge/interface.ts
 *   Search          src/lib/spark/intelligence/search/interface.ts
 *   Recommendations src/lib/spark/intelligence/recommendations/interface.ts
 *   Privacy         src/lib/spark/trust/privacy/interface.ts
 *   Security        src/lib/spark/trust/security/interface.ts
 *   Automation      src/lib/spark/automation/interface.ts
 *   Notifications   src/lib/spark/notifications/interface.ts
 *   Learning        src/lib/spark/learning/interface.ts
 *
 * ─────────────────────────────────────────────────────────────────────
 * STUBBED (interfaces defined, implementations pending)
 * ─────────────────────────────────────────────────────────────────────
 *   Feed            FeedService
 *   Community       CommunityService
 *   Marketplace     MarketplaceService
 *   University      UniversityService
 *   Video           VideoService
 *   Audio           AudioService
 *   Image           ImageService
 *   EventBus        (→ see src/lib/intelligence/bus.ts)
 *   FeatureFlags    FeatureFlagsService
 */

// ── Implemented — from Spark ─────────────────────────────────────────────────
export type { IdentityService }        from "@/lib/spark/core/identity/interface";
export type { ReasoningService }       from "@/lib/spark/core/reasoning/interface";
export type { PlanningService }        from "@/lib/spark/core/planning/interface";
export type { MemoryService }          from "@/lib/spark/memory/interface";
export type { ContextService }         from "@/lib/spark/context/interface";
export type { KnowledgeService }       from "@/lib/spark/knowledge/interface";
export type { SearchService }          from "@/lib/spark/intelligence/search/interface";
export type { RecommendationsService } from "@/lib/spark/intelligence/recommendations/interface";
export type { PrivacyService }         from "@/lib/spark/trust/privacy/interface";
export type { SecurityService as SparkSecurityService } from "@/lib/spark/trust/security/interface";
export type { AutomationService as SparkAutomationService } from "@/lib/spark/automation/interface";
export type { NotificationEngineService } from "@/lib/spark/notifications/interface";

// ── Stubbed — pending live implementations ───────────────────────────────────

/** Feed infrastructure — powers Square, Quad, and all social surfaces */
export interface FeedService {
  getFeed(userId: string, options?: { limit?: number; cursor?: string }): Promise<{
    items: Array<{ id: string; type: string; payload: unknown; publishedAt: string }>;
    nextCursor?: string;
  }>;
  publishItem(item: { type: string; payload: unknown; authorId: string }): Promise<{ id: string }>;
}

/** Community infrastructure — powers all community surfaces */
export interface CommunityService {
  getCommunity(id: string): Promise<{ id: string; name: string; memberCount: number } | null>;
  listMembers(communityId: string): Promise<Array<{ userId: string; role: string }>>;
  join(userId: string, communityId: string): Promise<void>;
  leave(userId: string, communityId: string): Promise<void>;
}

/** Marketplace infrastructure */
export interface MarketplaceService {
  listListings(filters?: Record<string, unknown>): Promise<unknown[]>;
  createListing(listing: Record<string, unknown>): Promise<{ id: string }>;
  getOrder(orderId: string): Promise<unknown | null>;
}

/** University data infrastructure */
export interface UniversityService {
  getUniversity(id: string): Promise<{ id: string; name: string; country: string } | null>;
  listCourses(universityId: string): Promise<unknown[]>;
  getAcademicCalendar(universityId: string): Promise<unknown>;
}

/** Video streaming infrastructure */
export interface VideoService {
  getStreamUrl(videoId: string): Promise<string>;
  uploadVideo(file: Blob, metadata: Record<string, unknown>): Promise<{ id: string; url: string }>;
  getTranscript(videoId: string): Promise<{ segments: Array<{ start: number; end: number; text: string }> }>;
}

/** Audio streaming infrastructure */
export interface AudioService {
  getStreamUrl(audioId: string): Promise<string>;
  uploadAudio(file: Blob, metadata: Record<string, unknown>): Promise<{ id: string; url: string }>;
}

/** Image processing infrastructure */
export interface ImageService {
  getResizedUrl(imageUrl: string, width: number, height: number): string;
  uploadImage(file: Blob, metadata?: Record<string, unknown>): Promise<{ id: string; url: string }>;
  removeBackground(imageUrl: string): Promise<{ url: string }>;
}

/** Feature flags infrastructure */
export interface FeatureFlagsService {
  isEnabled(flag: string, userId?: string): boolean;
  getVariant(flag: string, userId?: string): string | null;
  getAllFlags(userId?: string): Record<string, boolean | string>;
}

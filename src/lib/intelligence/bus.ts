/**
 * UNIBUD Intelligence Event Bus
 *
 * A lightweight, typed publish/subscribe bus that connects all six
 * intelligences: Bud, Spark, Oracle, Orbit, Lens, and The Artist.
 *
 * Design principles:
 *  - Opt-in: existing direct function calls continue to work unchanged.
 *    The bus is purely additive.
 *  - Typed: every event has a declared payload type. TypeScript enforces
 *    that publishers and subscribers agree on the shape.
 *  - Observable: every publish/subscribe action is traceable via the
 *    built-in event log, which powers the Intelligence Center dashboard.
 *  - Synchronous delivery: handlers are called in the order they were
 *    registered, in the same microtask. Async handlers are supported via
 *    the `publishAsync` method which awaits all handlers.
 *  - No external dependencies: pure TypeScript, zero runtime overhead.
 *
 * Usage — publishing:
 *   import { intelligenceBus } from "@/lib/intelligence/bus";
 *   intelligenceBus.publish("bud:request", { message, sessionId, context });
 *
 * Usage — subscribing:
 *   import { intelligenceBus } from "@/lib/intelligence/bus";
 *   const unsub = intelligenceBus.subscribe("spark:assemble", (payload) => {
 *     // handle assembled response
 *   });
 *   // later: unsub(); // remove listener
 */

// ─────────────────────────────────────────────────────────────────────────────
// Event Payload Types
// ─────────────────────────────────────────────────────────────────────────────

/** Shared screen context shape passed through all events */
export interface ScreenContext {
  name: string;
  description?: string;
  entityId?: string;
  entityType?: string;
}

/** A single turn in the conversation history */
export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

// ── Bud ──────────────────────────────────────────────────────────────────────

/** Fired by Bud when delegating a student request to the intelligence layer */
export interface BudRequestPayload {
  message: string;
  sessionId: string;
  userId?: string;
  screenContext: ScreenContext;
  history: ConversationTurn[];
  requestId: string;
}

/** Fired by Bud after delivering a response to the student */
export interface BudResponseDeliveredPayload {
  requestId: string;
  sessionId: string;
  responseText: string;
  durationMs: number;
}

// ── Spark ─────────────────────────────────────────────────────────────────────

/** Fired by Spark when it has assembled a complete response for Bud */
export interface SparkAssemblePayload {
  requestId: string;
  sessionId: string;
  responseText: string;
  trace: {
    agentsInvoked: string[];
    oracleInvoked: boolean;
    orbitInvoked: boolean;
    lensInvoked: boolean;
    artistInvoked: boolean;
    reasoningConfidence: number;
    durationMs: number;
  };
}

/** Fired by Spark when it writes a new memory record */
export interface SparkMemoryUpdatedPayload {
  sessionId: string;
  userId: string;
  scope: string;
  key: string;
  preview?: string;
}

// ── Oracle ────────────────────────────────────────────────────────────────────

/** Fired by Spark to ask Oracle to perform research */
export interface OracleResearchPayload {
  requestId: string;
  topic: string;
  depth?: "shallow" | "deep";
  preferredSources?: Array<"academic" | "web" | "campus">;
  context?: string;
}

/** Fired by Oracle returning structured research to Spark */
export interface OracleResultPayload {
  requestId: string;
  topic: string;
  findings: string[];
  sources: Array<{
    title: string;
    url?: string;
    author?: string;
    date?: string;
    type: "academic" | "web" | "campus";
  }>;
  confidence: number;
  timestamp: string;
}

/** Fired by Spark to ask Oracle to verify a claim */
export interface OracleFactCheckPayload {
  requestId: string;
  claim: string;
  context?: string;
}

/** Fired by Oracle returning a fact-check verdict to Spark */
export interface OracleFactCheckedPayload {
  requestId: string;
  claim: string;
  verdict: "verified" | "refuted" | "uncertain";
  evidence: string[];
  confidence: number;
}

// ── Orbit ─────────────────────────────────────────────────────────────────────

/** Fired by Orbit when it has new live intelligence items */
export interface OrbitPulsePayload {
  items: Array<{
    id: string;
    title: string;
    summary: string;
    source: string;
    sourceUrl?: string;
    category:
      | "campus"
      | "education"
      | "technology"
      | "scholarships"
      | "competitions"
      | "research"
      | "ai"
      | "global_news"
      | "trending";
    publishedAt: string;
    imageUrl?: string;
    tags: string[];
  }>;
  batchId: string;
  timestamp: string;
}

/** Fired by Orbit for time-sensitive campus or global alerts */
export interface OrbitAlertPayload {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  category: string;
  publishedAt: string;
  expiresAt?: string;
}

/** Fired by Spark or Square to subscribe to Orbit categories */
export interface OrbitSubscribePayload {
  subscriberId: string;
  categories: string[];
}

// ── Lens ──────────────────────────────────────────────────────────────────────

/** Fired by Spark to ask Lens to perform a search */
export interface LensSearchPayload {
  requestId: string;
  query: string;
  scope?:
    | "all"
    | "platform"
    | "web"
    | "communities"
    | "courses"
    | "library"
    | "people"
    | "media"
    | "campus"
    | "knowledge";
  filters?: Record<string, string>;
  limit?: number;
  userId?: string;
}

/** Fired by Lens returning ranked search results to Spark */
export interface LensResultsPayload {
  requestId: string;
  query: string;
  results: Array<{
    id: string;
    type: string;
    title: string;
    snippet: string;
    imageUrl?: string;
    deepLink: string;
    score: number;
    source: "platform" | "web";
  }>;
  totalCount: number;
  interpretedAs?: string;
  durationMs: number;
}

// ── Artist ────────────────────────────────────────────────────────────────────

/** Fired by Bud or Spark to ask The Artist to create a visual asset */
export interface ArtistCreatePayload {
  requestId: string;
  type:
    | "diagram"
    | "illustration"
    | "animation"
    | "visual_explanation"
    | "educational_graphic"
    | "creator_asset"
    | "brand_asset"
    | "ui_asset";
  subject: string;
  style?: string;
  dimensions?: { width: number; height: number };
  format?: "png" | "svg" | "webp" | "gif";
  context?: string;
}

/** Fired by The Artist returning a created asset */
export interface ArtistAssetPayload {
  requestId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  altText: string;
  generatedAt: string;
}

// ── Specialist — shared payload types ────────────────────────────────────────

/**
 * Generic query dispatched by Spark to any specialist intelligence.
 * The `domain` field identifies the specialist; the `query` field carries
 * the natural-language or structured request.
 */
export interface SpecialistQueryPayload {
  requestId: string;
  domain: string;
  query: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

/**
 * Generic result returned by any specialist intelligence to Spark.
 */
export interface SpecialistResultPayload {
  requestId: string;
  domain: string;
  result: string;
  structured?: Record<string, unknown>;
  confidence?: number;
  durationMs?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Map — all events the bus carries
// ─────────────────────────────────────────────────────────────────────────────

export interface IntelligenceBusEventMap {
  // Bud
  "bud:request": BudRequestPayload;
  "bud:response_delivered": BudResponseDeliveredPayload;

  // Spark
  "spark:assemble": SparkAssemblePayload;
  "spark:memory_updated": SparkMemoryUpdatedPayload;

  // Oracle
  "oracle:research": OracleResearchPayload;
  "oracle:result": OracleResultPayload;
  "oracle:fact_check": OracleFactCheckPayload;
  "oracle:fact_checked": OracleFactCheckedPayload;

  // Orbit
  "orbit:pulse": OrbitPulsePayload;
  "orbit:alert": OrbitAlertPayload;
  "orbit:subscribe": OrbitSubscribePayload;

  // Lens
  "lens:search": LensSearchPayload;
  "lens:results": LensResultsPayload;

  // Artist
  "artist:create": ArtistCreatePayload;
  "artist:asset": ArtistAssetPayload;

  // ── Specialist Intelligence Events ─────────────────────────────────────────
  // Spark dispatches these to the appropriate specialist; specialists return
  // typed result events. All payloads share a common requestId for tracing.

  // Campus AI
  "campus_ai:query": SpecialistQueryPayload;
  "campus_ai:result": SpecialistResultPayload;

  // Community AI
  "community_ai:query": SpecialistQueryPayload;
  "community_ai:result": SpecialistResultPayload;

  // Marketplace AI
  "marketplace_ai:query": SpecialistQueryPayload;
  "marketplace_ai:result": SpecialistResultPayload;

  // Event AI
  "event_ai:query": SpecialistQueryPayload;
  "event_ai:result": SpecialistResultPayload;

  // Challenge AI
  "challenge_ai:query": SpecialistQueryPayload;
  "challenge_ai:result": SpecialistResultPayload;

  // News AI
  "news_ai:query": SpecialistQueryPayload;
  "news_ai:result": SpecialistResultPayload;

  // Podcast AI
  "podcast_ai:query": SpecialistQueryPayload;
  "podcast_ai:result": SpecialistResultPayload;

  // Movies AI
  "movies_ai:query": SpecialistQueryPayload;
  "movies_ai:result": SpecialistResultPayload;

  // Anime AI
  "anime_ai:query": SpecialistQueryPayload;
  "anime_ai:result": SpecialistResultPayload;

  // Sports AI
  "sports_ai:query": SpecialistQueryPayload;
  "sports_ai:result": SpecialistResultPayload;

  // Library AI
  "library_ai:query": SpecialistQueryPayload;
  "library_ai:result": SpecialistResultPayload;

  // Learning AI
  "learning_ai:query": SpecialistQueryPayload;
  "learning_ai:result": SpecialistResultPayload;

  // Assignment AI
  "assignment_ai:query": SpecialistQueryPayload;
  "assignment_ai:result": SpecialistResultPayload;

  // Quiz AI
  "quiz_ai:query": SpecialistQueryPayload;
  "quiz_ai:result": SpecialistResultPayload;

  // Career AI
  "career_ai:query": SpecialistQueryPayload;
  "career_ai:result": SpecialistResultPayload;

  // Scholarship AI
  "scholarship_ai:query": SpecialistQueryPayload;
  "scholarship_ai:result": SpecialistResultPayload;

  // Creator AI
  "creator_ai:query": SpecialistQueryPayload;
  "creator_ai:result": SpecialistResultPayload;

  // Camera AI
  "camera_ai:query": SpecialistQueryPayload;
  "camera_ai:result": SpecialistResultPayload;

  // Voice AI
  "voice_ai:query": SpecialistQueryPayload;
  "voice_ai:result": SpecialistResultPayload;

  // Language AI
  "language_ai:query": SpecialistQueryPayload;
  "language_ai:result": SpecialistResultPayload;

  // Wellness AI
  "wellness_ai:query": SpecialistQueryPayload;
  "wellness_ai:result": SpecialistResultPayload;

  // Gamification AI
  "gamification_ai:query": SpecialistQueryPayload;
  "gamification_ai:result": SpecialistResultPayload;

  // Architect
  "architect:query": SpecialistQueryPayload;
  "architect:result": SpecialistResultPayload;

  // ── Platform-level events ───────────────────────────────────────────────────
  // Published by any intelligence; consumed by authorised platform services.

  "platform:assignment_created": { userId: string; assignmentId: string; courseId: string; dueAt: string };
  "platform:assignment_submitted": { userId: string; assignmentId: string; submittedAt: string };
  "platform:course_completed": { userId: string; courseId: string; completedAt: string };
  "platform:community_joined": { userId: string; communityId: string; joinedAt: string };
  "platform:friend_added": { userId: string; friendId: string; addedAt: string };
  "platform:story_published": { userId: string; storyId: string; publishedAt: string };
  "platform:video_uploaded": { userId: string; videoId: string; uploadedAt: string };
  "platform:scholarship_discovered": { userId: string; scholarshipId: string; discoveredAt: string };
  "platform:marketplace_order_created": { buyerId: string; sellerId: string; orderId: string; createdAt: string };
  "platform:message_sent": { senderId: string; recipientId: string; messageId: string; sentAt: string };
  "platform:exam_scheduled": { userId: string; examId: string; scheduledAt: string };
  "platform:profile_updated": { userId: string; updatedFields: string[]; updatedAt: string };
  "platform:learning_progress_updated": { userId: string; courseId: string; progress: number; updatedAt: string };
}

export type IntelligenceBusEvent = keyof IntelligenceBusEventMap;

// ─────────────────────────────────────────────────────────────────────────────
// Log Entry — for observability / Intelligence Center
// ─────────────────────────────────────────────────────────────────────────────

export interface BusLogEntry {
  event: string;
  payload: unknown;
  timestamp: string;
  listenerCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bus Implementation
// ─────────────────────────────────────────────────────────────────────────────

type Handler<T> = (payload: T) => void | Promise<void>;
type Unsubscribe = () => void;

export class IntelligenceBus {
  private readonly listeners = new Map<string, Set<Handler<unknown>>>();
  private readonly log: BusLogEntry[] = [];
  private readonly maxLogSize: number;

  constructor(options: { maxLogSize?: number } = {}) {
    this.maxLogSize = options.maxLogSize ?? 500;
  }

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   *
   * @example
   * const unsub = bus.subscribe("spark:assemble", (payload) => { ... });
   * // later:
   * unsub();
   */
  subscribe<E extends IntelligenceBusEvent>(
    event: E,
    handler: Handler<IntelligenceBusEventMap[E]>
  ): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Handler<unknown>);
    return () => {
      this.listeners.get(event)?.delete(handler as Handler<unknown>);
    };
  }

  /**
   * Publish an event synchronously. All registered handlers are called
   * immediately, in registration order.
   *
   * For async handlers, use `publishAsync` instead.
   */
  publish<E extends IntelligenceBusEvent>(
    event: E,
    payload: IntelligenceBusEventMap[E]
  ): void {
    const handlers = this.listeners.get(event);
    this._log(event, payload, handlers?.size ?? 0);
    if (!handlers || handlers.size === 0) return;
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[IntelligenceBus] Error in handler for "${event}":`, err);
      }
    }
  }

  /**
   * Publish an event asynchronously. Returns a promise that resolves when
   * all handlers have settled (fulfilled or rejected). Rejections are
   * caught and logged individually — they never fail the entire publish.
   */
  async publishAsync<E extends IntelligenceBusEvent>(
    event: E,
    payload: IntelligenceBusEventMap[E]
  ): Promise<void> {
    const handlers = this.listeners.get(event);
    this._log(event, payload, handlers?.size ?? 0);
    if (!handlers || handlers.size === 0) return;
    await Promise.allSettled(
      Array.from(handlers).map(async (handler) => {
        try {
          await handler(payload);
        } catch (err) {
          console.error(`[IntelligenceBus] Error in async handler for "${event}":`, err);
        }
      })
    );
  }

  /**
   * Returns the number of listeners currently registered for an event.
   */
  listenerCount(event: IntelligenceBusEvent): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Returns the observable event log (capped at maxLogSize).
   * Used by the Intelligence Center dashboard for observability.
   */
  getLog(): ReadonlyArray<BusLogEntry> {
    return this.log;
  }

  /** Clear the observable log. */
  clearLog(): void {
    this.log.splice(0, this.log.length);
  }

  private _log(event: string, payload: unknown, listenerCount: number): void {
    this.log.push({ event, payload, timestamp: new Date().toISOString(), listenerCount });
    if (this.log.length > this.maxLogSize) {
      this.log.shift();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton — import this everywhere
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The shared Intelligence Bus singleton.
 *
 * Import this in any intelligence module:
 *   import { intelligenceBus } from "@/lib/intelligence/bus";
 */
export const intelligenceBus = new IntelligenceBus();

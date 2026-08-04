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

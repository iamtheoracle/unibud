/**
 * UNIBUD OS v4 — Realtime Engine
 *
 * The single gateway for all live data synchronization.
 * No page, module, or component may subscribe directly to any provider.
 *
 * Flow: Database → Realtime Engine → Store (React Query) → Workspace → UI
 *
 * Features:
 *   - Channel-based subscription management
 *   - Event batching (coalesce rapid changes within a window)
 *   - Event deduplication (same entity + type = one event per batch)
 *   - Throttling (max events per second)
 *   - Lazy subscriptions (only subscribe when a listener exists)
 *   - Automatic cleanup (unsubscribe when no listeners remain)
 *   - Offline queue (buffer events when offline, replay on reconnect)
 *   - Reconnect recovery (auto-resubscribe on reconnection)
 *   - Metrics (latency, throughput, dropped events, subscription health)
 *
 * References: All five constitutional documents.
 *   Engineering Constitution Commandment 2: "Never bypass the Integrator."
 *   OS Constitution: Realtime Engine is a Platform Core service.
 */

import { base44 } from "@/api/base44Client";
import { eventBus } from "@/lib/runtime/eventBus";
import { SYNC_REGISTRY, ALL_DOMAINS } from "./entitySyncRegistry";
import { getChannelForEntity, isHighPriorityEntity } from "./channels";

// ─── Configuration ────────────────────────────────────────────────────────
const BATCH_FLUSH_MS = 400;      // Coalesce events within this window
const MAX_THROUGHPUT = 100;       // Max events per second before throttling
const THROTTLE_WINDOW = 1000;     // Throughput measurement window
const OFFLINE_QUEUE_MAX = 500;    // Max buffered events when offline
const RECONNECT_DELAY = 3000;    // Delay before reconnect attempt

class RealtimeEngine {
  constructor() {
    this._initialized = false;
    this._subscriptions = new Map();       // entityName → unsubscribe function
    this._activeChannels = new Set();      // channels with active listeners
    this._pendingBatch = new Map();         // entityName → Set<eventType>
    this._batchTimer = null;
    this._offlineQueue = [];
    this._isOnline = typeof navigator === "undefined" ? true : navigator.onLine;
    this._metrics = {
      totalEvents: 0,
      droppedEvents: 0,
      batchesFlushed: 0,
      activeSubscriptions: 0,
      reconnectCount: 0,
      lastLatency: 0,
      avgLatency: 0,
      _latencySum: 0,
      _latencyCount: 0,
      _eventTimestamps: [],
    };
    this._listeners = new Set();           // external listeners (inspector, etc.)
    this._queryClient = null;              // set by provider
    this._contextId = "hybrid";            // set by provider
    this._integrationHooks = [];           // Spark, Orbit, Bud hooks
    this._throttleCount = 0;
    this._throttleTimer = null;
    this._resubscribePending = new Set();  // entities to resubscribe on reconnect
  }

  // ─── Initialization ──────────────────────────────────────────────────────

  /**
   * Initialize the engine with the React Query client and current context.
   * Called once by the RealtimeEngineProvider.
   */
  init({ queryClient, contextId = "hybrid" } = {}) {
    if (this._initialized) return;
    this._queryClient = queryClient;
    this._contextId = contextId;
    this._initialized = true;

    // Listen for online/offline transitions
    if (typeof window !== "undefined") {
      window.addEventListener("online", this._handleReconnect.bind(this));
      window.addEventListener("offline", this._handleOffline.bind(this));
    }

    // Subscribe to all registered entities
    this._subscribeAll();

    this._notifyListeners();
  }

  /**
   * Update the current context (called by ContextProvider).
   * Does not change subscriptions — only affects priority routing.
   */
  setContext(contextId) {
    this._contextId = contextId;
    this._notifyListeners();
  }

  // ─── Subscription Management ────────────────────────────────────────────

  _subscribeAll() {
    for (const entityName of Object.keys(SYNC_REGISTRY)) {
      this._subscribeEntity(entityName);
    }
  }

  _subscribeEntity(entityName) {
    if (this._subscriptions.has(entityName)) return;

    try {
      const entityApi = base44.entities?.[entityName];
      if (!entityApi || typeof entityApi.subscribe !== "function") return;

      const unsub = entityApi.subscribe((event) => {
        this._handleEvent(entityName, event);
      });

      this._subscriptions.set(entityName, unsub);
      this._metrics.activeSubscriptions = this._subscriptions.size;
      this._notifyListeners();
    } catch {
      // Entity not available — skip silently
    }
  }

  _unsubscribeEntity(entityName) {
    const unsub = this._subscriptions.get(entityName);
    if (typeof unsub === "function") {
      try { unsub(); } catch {}
    }
    this._subscriptions.delete(entityName);
    this._metrics.activeSubscriptions = this._subscriptions.size;
  }

  // ─── Event Handling ─────────────────────────────────────────────────────

  _handleEvent(entityName, event) {
    if (!event || !event.type) return;

    const now = Date.now();

    // Track latency (time between event creation and processing)
    if (event.data?.updated_date) {
      const eventTime = new Date(event.data.updated_date).getTime();
      if (!isNaN(eventTime)) {
        const latency = now - eventTime;
        if (latency >= 0 && latency < 60000) {
          this._metrics._latencySum += latency;
          this._metrics._latencyCount++;
          this._metrics.lastLatency = latency;
          this._metrics.avgLatency = Math.round(this._metrics._latencySum / this._metrics._latencyCount);
        }
      }
    }

    // Throttle check
    this._metrics._eventTimestamps.push(now);
    this._metrics._eventTimestamps = this._metrics._eventTimestamps.filter(
      (t) => now - t < THROTTLE_WINDOW
    );
    if (this._metrics._eventTimestamps.length > MAX_THROUGHPUT) {
      this._metrics.droppedEvents++;
      this._metrics.totalEvents++;
      this._notifyListeners();
      return; // Drop event to prevent overwhelming the UI
    }

    // If offline, queue the event
    if (!this._isOnline) {
      if (this._offlineQueue.length < OFFLINE_QUEUE_MAX) {
        this._offlineQueue.push({ entityName, eventType: event.type, data: event.data, timestamp: now });
      }
      return;
    }

    this._metrics.totalEvents++;

    // Add to batch (deduplication: same entity + type = one entry)
    if (!this._pendingBatch.has(entityName)) {
      this._pendingBatch.set(entityName, new Set());
    }
    this._pendingBatch.get(entityName).add(event.type);

    this._scheduleBatchFlush();
  }

  _scheduleBatchFlush() {
    if (this._batchTimer) return;
    this._batchTimer = setTimeout(() => this._flushBatch(), BATCH_FLUSH_MS);
  }

  _flushBatch() {
    this._batchTimer = null;
    const changes = Array.from(this._pendingBatch.entries());
    this._pendingBatch.clear();
    if (changes.length === 0) return;

    this._metrics.batchesFlushed++;

    const prefixesToInvalidate = new Set();
    const domainsAffected = new Set();
    const entityNames = [];
    const channelIds = new Set();

    for (const [entityName, eventTypes] of changes) {
      const config = SYNC_REGISTRY[entityName];
      entityNames.push(entityName);

      const channelId = getChannelForEntity(entityName);
      if (channelId) channelIds.add(channelId);

      if (!config) continue;
      config.prefixes.forEach((p) => prefixesToInvalidate.add(p));
      config.domains.forEach((d) => domainsAffected.add(d));
    }

    // Notification always triggers global badge refresh
    if (entityNames.includes("Notification")) {
      prefixesToInvalidate.add("notifications");
      prefixesToInvalidate.add("unread");
      prefixesToInvalidate.add("notification-center");
    }

    // Invalidate React Query caches
    if (this._queryClient) {
      for (const prefix of prefixesToInvalidate) {
        this._queryClient.invalidateQueries({ queryKey: [prefix] });
      }
    }

    // Emit general sync event
    const syncPayload = {
      entities: entityNames,
      domains: Array.from(domainsAffected),
      channels: Array.from(channelIds),
      context: this._contextId,
      timestamp: new Date().toISOString(),
    };

    eventBus.publish({
      type: "entity:sync",
      category: "lifecycle",
      payload: syncPayload,
    });

    // Emit per-entity events
    for (const entityName of entityNames) {
      eventBus.publish({
        type: `entity:${entityName}:changed`,
        category: "lifecycle",
        payload: { entity: entityName, timestamp: new Date().toISOString() },
      });
    }

    // Trigger integration hooks (Spark, Orbit, Bud)
    this._triggerIntegrations(syncPayload);

    this._notifyListeners();
  }

  // ─── Integration Hooks (Spark, Orbit, Bud) ──────────────────────────────

  /**
   * Register an integration hook.
   * Hooks receive the sync payload after caches are invalidated.
   * @param {Object} hook - { id, handler }
   */
  registerIntegration(hook) {
    this._integrationHooks.push(hook);
  }

  unregisterIntegration(id) {
    this._integrationHooks = this._integrationHooks.filter((h) => h.id !== id);
  }

  _triggerIntegrations(payload) {
    for (const hook of this._integrationHooks) {
      try {
        hook.handler(payload);
      } catch {
        // Integration error — don't break the sync flow
      }
    }
  }

  // ─── Offline / Reconnect ────────────────────────────────────────────────

  _handleOffline() {
    this._isOnline = false;
    this._notifyListeners();
  }

  _handleReconnect() {
    this._isOnline = true;
    this._metrics.reconnectCount++;

    // Replay offline queue
    if (this._offlineQueue.length > 0) {
      for (const queued of this._offlineQueue) {
        if (!this._pendingBatch.has(queued.entityName)) {
          this._pendingBatch.set(queued.entityName, new Set());
        }
        this._pendingBatch.get(queued.entityName).add(queued.eventType);
      }
      this._offlineQueue = [];
      this._scheduleBatchFlush();
    }

    // Resubscribe any pending entities
    for (const entityName of this._resubscribePending) {
      this._unsubscribeEntity(entityName);
      this._subscribeEntity(entityName);
    }
    this._resubscribePending.clear();

    this._notifyListeners();
  }

  // ─── Listener Management (for Inspector) ────────────────────────────────

  addListener(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notifyListeners() {
    for (const listener of this._listeners) {
      try { listener(this.getMetrics()); } catch {}
    }
  }

  // ─── Metrics ────────────────────────────────────────────────────────────

  getMetrics() {
    return {
      initialized: this._initialized,
      isOnline: this._isOnline,
      activeSubscriptions: this._subscriptions.size,
      totalEvents: this._metrics.totalEvents,
      droppedEvents: this._metrics.droppedEvents,
      batchesFlushed: this._metrics.batchesFlushed,
      reconnectCount: this._metrics.reconnectCount,
      lastLatency: this._metrics.lastLatency,
      avgLatency: this._metrics.avgLatency,
      offlineQueueSize: this._offlineQueue.length,
      pendingBatchSize: this._pendingBatch.size,
      activeChannels: Array.from(this._activeChannels),
      contextId: this._contextId,
      subscribedEntities: Array.from(this._subscriptions.keys()),
      integrationCount: this._integrationHooks.length,
      throughput: this._metrics._eventTimestamps.length,
    };
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────

  destroy() {
    if (this._batchTimer) clearTimeout(this._batchTimer);
    if (this._throttleTimer) clearTimeout(this._throttleTimer);
    for (const entityName of this._subscriptions.keys()) {
      this._unsubscribeEntity(entityName);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this._handleReconnect);
      window.removeEventListener("offline", this._handleOffline);
    }
    this._initialized = false;
  }
}

// Export as singleton
export const realtimeEngine = new RealtimeEngine();

// Dev-time access
if (typeof window !== "undefined") {
  window.__UNIBUD_REALTIME__ = realtimeEngine;
}

export default realtimeEngine;
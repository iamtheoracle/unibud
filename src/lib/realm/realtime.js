/**
 * Realtime Service — entity subscriptions + cache invalidation.
 * Reuses base44.entities.<Name>.subscribe() (WebSocket) and the shared
 * query-client invalidation helpers used by LiveReflectionProvider.
 */
import { queryClientInstance, invalidateEntity, invalidateAll, setQueryData } from "@/lib/query-client";

export function realtimeService(base44) {
  return {
    /** Subscribe to create/update/delete events for an entity. Returns unsubscribe. */
    subscribe: (entityName, handler) => {
      const entity = base44.entities[entityName];
      if (!entity || typeof entity.subscribe !== "function") return () => {};
      return entity.subscribe(handler);
    },

    /** Invalidate all queries scoped to an entity (key prefix = entity name). */
    invalidate: (entityName) => invalidateEntity(entityName),

    /** Invalidate every cached query. */
    invalidateAll,

    /** Optimistically update cached query data for an entity. */
    setQueryData: (entityName, updater) => setQueryData(entityName, updater),

    /** Read a cached query value by exact key. */
    getQueryData: (queryKey) => queryClientInstance.getQueryData(queryKey),
  };
}
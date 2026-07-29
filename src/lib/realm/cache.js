/**
 * Cache Service — query cache management over @tanstack/react-query.
 * Reuses the shared queryClientInstance + invalidation helpers
 * (src/lib/query-client). No new cache store is introduced.
 */
import { queryClientInstance, invalidateEntity, invalidateAll, setQueryData } from "@/lib/query-client";

export function cacheService(base44) {
  return {
    invalidate: (entityName) => invalidateEntity(entityName),
    invalidateAll,
    set: (entityName, updater) => setQueryData(entityName, updater),
    get: (queryKey) => queryClientInstance.getQueryData(queryKey),
    prefetch: async (queryKey, queryFn) =>
      queryClientInstance.prefetchQuery({ queryKey, queryFn }),
    remove: (queryKey) => queryClientInstance.removeQueries({ queryKey }),
  };
}
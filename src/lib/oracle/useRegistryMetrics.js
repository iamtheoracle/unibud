/**
 * useRegistryMetrics — live, auto-refreshing registry metrics.
 *
 * One React Query that fans out to every registry entity in parallel,
 * scoped by the active filters. Derives a single metrics tree so the
 * dashboard re-renders once per refresh, not once per entity.
 *
 * Live behaviour: refetches every 30s + on window focus. Every value
 * comes from real registry entities — no duplicated state, no mocks.
 */
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { REGISTRY_ENTITIES, buildEntityFilter, registryLimit, deriveMetrics } from "./registryMetrics";

async function fetchRegistryEntities(filters) {
  const entries = await Promise.all(
    REGISTRY_ENTITIES.map(async (name) => {
      try {
        const filter = buildEntityFilter(name, filters);
        const limit = registryLimit(name);
        const result =
          Object.keys(filter).length > 0
            ? await base44.entities[name].filter(filter, "-created_date", limit)
            : await base44.entities[name].list("-created_date", limit);
        return [name, Array.isArray(result) ? result : []];
      } catch {
        return [name, []];
      }
    })
  );
  return Object.fromEntries(entries);
}

export function useRegistryMetrics(filters = {}) {
  return useQuery({
    queryKey: ["registry-metrics", filters],
    queryFn: () => fetchRegistryEntities(filters),
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
    select: (raw) => deriveMetrics(raw, filters),
  });
}

// Raw audit log feed (newest first) for the Live Activity panel.
export function useRegistryActivity(filters = {}) {
  return useQuery({
    queryKey: ["registry-activity", filters],
    queryFn: async () => {
      try {
        const list = await base44.entities.AuditLog.list("-created_date", 60);
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

// Lightweight institution list to power the filter dropdown.
export function useRegistryInstitutions() {
  return useQuery({
    queryKey: ["registry-institutions"],
    queryFn: async () => {
      try {
        const list = await base44.entities.Institution.list("-created_date", 500);
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
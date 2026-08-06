import { useState, useDeferredValue, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SEARCH_INDEX } from "@/lib/search/searchConfig";

const RECENT_KEY = "unibud_recent_searches";
const MAX_RECENT = 8;

export function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const trimmed = term.trim();
  if (!trimmed) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    localStorage.setItem(RECENT_KEY, JSON.stringify([trimmed, ...filtered].slice(0, MAX_RECENT)));
  } catch {}
}

export function clearRecentSearches() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

/**
 * Fetches a batch of recent records from one entity and filters client-side
 * by the query string across the configured text fields.
 *
 * RLS is enforced by the SDK — only records the authenticated student has
 * permission to read are returned by .list().
 */
async function searchEntity(entityName, fields, limit, query) {
  try {
    const results = await base44.entities[entityName].list("-updated_date", limit * 3);
    if (!results || !Array.isArray(results)) return [];
    const lower = query.toLowerCase();
    return results
      .filter((item) =>
        fields.some((f) => {
          const val = item[f];
          return val && typeof val === "string" && val.toLowerCase().includes(lower);
        })
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * useUniversalSearch — searches across all 13 UNIBUD resource types in
 * parallel. Returns categorized results grouped by entity type.
 *
 * Uses useDeferredValue so the search fires after the user pauses typing,
 * not on every keystroke. Results are cached for 15s per query.
 */
export function useUniversalSearch() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const q = deferredQuery.trim().toLowerCase();
  const enabled = q.length >= 2;

  const { data, isLoading } = useQuery({
    queryKey: ["universalSearch", q],
    queryFn: async () => {
      const searches = SEARCH_INDEX.map(async (config) => {
        const results = await searchEntity(config.entity, config.fields, config.limit, q);
        return { key: config.key, label: config.label, results };
      });

      const settled = await Promise.allSettled(searches);
      const categories = settled
        .filter((s) => s.status === "fulfilled" && s.value.results.length > 0)
        .map((s) => s.value);
      const total = categories.reduce((sum, c) => sum + c.results.length, 0);
      return { categories, total };
    },
    enabled,
    staleTime: 15000,
    gcTime: 60000,
  });

  const clear = useCallback(() => setQuery(""), []);

  useEffect(() => {
    return () => setQuery("");
  }, []);

  return {
    query,
    setQuery,
    results: data || { categories: [], total: 0 },
    isLoading: enabled && isLoading,
    clear,
  };
}
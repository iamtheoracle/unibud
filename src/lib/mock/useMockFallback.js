import { useMemo } from "react";

/**
 * useMockFallback — neutralized.
 *
 * Previously returned mock data when real data was empty. Now returns real
 * data only. If no data exists, consumers receive empty values and show
 * Bud empty states. Empty is better than fake.
 */
export function useMockFallback(query) {
  return useMemo(() => ({
    data: query?.data ?? [],
    isMock: false,
    isLoading: query?.isLoading,
    isError: query?.isError,
  }), [query?.data, query?.isLoading, query?.isError]);
}

/** Non-hook variant — returns real data only, no mock fallback. */
export function fallbackIfEmpty(real) {
  return real;
}
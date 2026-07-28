/**
 * UNIBUD Mock Fallback — the auto-replace pattern.
 *
 * Screens call `useMockFallback(realQuery, mock)` and receive real entity data
 * when present, or realistic mock content when it is empty/unavailable. When a
 * real API is connected and populated, mock is silently dropped — no UI change.
 *
 *   const posts = useMockFallback(
 *     useQuery({ queryKey: ["quad"], queryFn: () => base44.entities.QuadPost.list() }),
 *     MOCK_POSTS,
 *   );
 */
import { useMemo } from "react";

/**
 * @param {object} query  A React Query result object ({ data, isLoading, isError, isFetching }).
 * @param {any} mock      Fallback content used when real data is empty/unavailable.
 * @returns {{ data, isMock, isLoading }}
 */
export function useMockFallback(query, mock) {
  return useMemo(() => {
    const real = query?.data;
    const isEmpty = real == null || (Array.isArray(real) && real.length === 0);
    const useMock = !real || isEmpty;
    return {
      data: useMock ? mock : real,
      isMock: useMock,
      isLoading: query?.isLoading && useMock,
    };
  }, [query?.data, query?.isLoading, mock]);
}

/** Non-hook variant for use inside event handlers / mappers. */
export function fallbackIfEmpty(real, mock) {
  if (real == null) return mock;
  if (Array.isArray(real) && real.length === 0) return mock;
  return real;
}
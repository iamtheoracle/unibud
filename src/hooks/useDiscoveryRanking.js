import { useState, useEffect, useCallback } from "react";

const KEY = "discover.ranking";

/**
 * useDiscoveryRanking — Spark's adaptive ranking for Discover categories.
 * Records per-category views in localStorage and reorders categories so the
 * ones a student engages with most rise, while "For You" stays pinned first
 * and the overall structure stays familiar (ties resolve to the base order).
 */
export function useDiscoveryRanking(baseKeys) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    try { setCounts(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
  }, []);

  const recordView = useCallback((key) => {
    setCounts((c) => {
      const next = { ...c, [key]: (c[key] || 0) + 1 };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const rest = baseKeys.filter((k) => k !== "foryou");
  const sortedRest = [...rest].sort((a, b) => {
    const diff = (counts[b] || 0) - (counts[a] || 0);
    if (diff !== 0) return diff;
    return baseKeys.indexOf(a) - baseKeys.indexOf(b);
  });

  const ranked = ["foryou", ...sortedRest];
  return { ranked, recordView, counts };
}
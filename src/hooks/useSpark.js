import { useMemo } from "react";
import { createSpark } from "@/lib/spark";

/**
 * useSpark — memoized Spark intelligence instance.
 * Returns a stable Spark SDK instance for the component's lifetime,
 * exposing .recommendations, .search, .summaries, .personalization, etc.
 */
export function useSpark() {
  return useMemo(() => createSpark(), []);
}
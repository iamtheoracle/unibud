/**
 * homeOrchestrator — thin re-export of the Adaptive Experience Engine.
 * Spark's context evaluation now lives in @/lib/aee/aeeEngine so it can be
 * shared across surfaces (Home, Bud context cards, proactive prompts).
 */
export { orchestrateHome, buildAdaptiveGreeting } from "@/lib/aee/aeeEngine";
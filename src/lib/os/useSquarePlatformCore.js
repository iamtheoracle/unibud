import { useMemo } from "react";
import { useContextSystem } from "./ContextProvider";
import { getModulePriority } from "./manifest";
import { getModule, getModulesByCategory } from "./moduleRegistry";
import { getContract } from "./experienceContract";
import { SYNC_REGISTRY } from "@/lib/realtime/entitySyncRegistry";

/**
 * Maps Square feed section IDs to registered shared module IDs.
 * When context changes, sections are reordered by their module's priority.
 *
 * Social context: feed, stories, live prioritized.
 * Academic context: social modules remain available but lower priority.
 * Navigation never changes — only module priority shifts.
 */
export const SQUARE_SECTION_MODULES = {
  "feed": "posts",
  "stories": "stories",
  "live": "live",
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/**
 * useSquarePlatformCore — the migration bridge between Square and Platform Core.
 *
 * Square no longer owns data fetching logic, realtime subscriptions, or AI
 * context. This hook wires Square to every Platform Core service through
 * registries and hooks:
 *
 *   • ContextProvider  — sections are reordered by context priority
 *   • Module Registry  — every section maps to a registered shared module
 *   • Realtime Engine  — entity sync coverage is verified at mount
 *   • Experience Contract — Platform Core adoption is validated
 *   • Bud              — social context is built for proactive assistance
 *
 * References: Phase 7 Square Migration, OS Constitution.
 */
export function useSquarePlatformCore() {
  const ctx = useContextSystem();
  const contract = getContract("square");

  // ── Context-prioritized feed section ordering ──
  // Social context: feed, stories, live prioritized.
  // Academic context: social modules remain available but lower priority.
  const orderedSections = useMemo(() => {
    const priorities = getModulePriority("square", ctx.contextId);

    const sections = Object.entries(SQUARE_SECTION_MODULES).map(([sectionId, moduleId]) => {
      let priority = "medium";
      if (priorities) {
        if (priorities.high?.includes(moduleId)) priority = "high";
        else if (priorities.medium?.includes(moduleId)) priority = "medium";
        else if (priorities.low?.includes(moduleId)) priority = "low";
      }
      return { sectionId, moduleId, priority };
    });

    return sections
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
      .map((s) => s.sectionId);
  }, [ctx.contextId]);

  // ── Realtime entity coverage ──
  // Verifies every content entity is synced by the Realtime Engine.
  const realtimeCoverage = useMemo(() => {
    const contentModules = getModulesByCategory("content");
    const entities = [...new Set(contentModules.map((m) => m.entity).filter(Boolean))];
    const synced = entities.filter((e) => SYNC_REGISTRY[e]);
    const unsynced = entities.filter((e) => !SYNC_REGISTRY[e]);
    return {
      total: entities.length,
      synced: synced.length,
      unsynced,
      coverage: entities.length > 0 ? Math.round((synced.length / entities.length) * 100) : 0,
    };
  }, []);

  // ── Platform Core adoption status ──
  const platformCore = useMemo(() => {
    const modules = contract?.modules || [];
    return {
      contextProvider: true,
      realtimeEngine: contract?.hooks?.realtime || false,
      bud: contract?.hooks?.bud || false,
      orbit: contract?.hooks?.orbit || false,
      spark: contract?.hooks?.spark || false,
      moduleRegistry: modules.every((id) => getModule(id)),
      experienceContract: !!contract,
    };
  }, [contract]);

  // ── Bud social context ──
  // When Square is active, Bud proactively assists with:
  // summarizing discussions, recommending communities, surfacing relevant
  // posts, and assisting with content creation.
  // Bud remains floating and never becomes a Square screen.
  const budContext = useMemo(() => ({
    experience: "square",
    context: ctx.contextId,
    isSocial: ctx.isSocial,
    proactiveAssist: [
      "summarize-discussions",
      "recommend-communities",
      "surface-relevant-posts",
      "assist-content-creation",
    ],
  }), [ctx.contextId, ctx.isSocial]);

  return {
    contextId: ctx.contextId,
    isSocial: ctx.isSocial,
    orderedSections,
    realtimeCoverage,
    platformCore,
    budContext,
    contract,
  };
}
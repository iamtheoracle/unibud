import { useMemo } from "react";
import { useContextSystem } from "./ContextProvider";
import { getModulePriority } from "./manifest";
import { getModule, getModulesByCategory } from "./moduleRegistry";
import { getContract } from "./experienceContract";
import { SYNC_REGISTRY } from "@/lib/realtime/entitySyncRegistry";

/**
 * Maps Connect tab keys to registered shared module IDs.
 * When context changes, tabs are reordered by their module's priority.
 *
 * Social context: messages, calls prioritized.
 * Academic context: groups, collaboration prioritized.
 * Navigation never changes — only tab priority shifts.
 */
export const CONNECT_TAB_MODULES = {
  "messages": "messages",
  "calls": "calls",
  "collaboration": "members",
  "groups": "communities",
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/**
 * useConnectPlatformCore — the migration bridge between Connect and Platform Core.
 *
 * Connect no longer owns realtime subscriptions, presence polling, or AI
 * context. This hook wires Connect to every Platform Core service through
 * registries and hooks:
 *
 *   • ContextProvider  — tabs are reordered by context priority
 *   • Module Registry  — every tab maps to a registered shared module
 *   • Realtime Engine  — entity sync coverage is verified at mount
 *   • Experience Contract — Platform Core adoption is validated
 *   • Bud              — communication context is built for proactive assistance
 *
 * References: Phase 8 Connect Migration, OS Constitution.
 */
export function useConnectPlatformCore() {
  const ctx = useContextSystem();
  const contract = getContract("connect");

  // ── Context-prioritized tab ordering ──
  // Social context: messages, calls prioritized.
  // Academic context: groups, collaboration prioritized.
  const orderedTabs = useMemo(() => {
    const priorities = getModulePriority("connect", ctx.contextId);

    const tabs = Object.entries(CONNECT_TAB_MODULES).map(([tabKey, moduleId]) => {
      let priority = "medium";
      if (priorities) {
        if (priorities.high?.includes(moduleId)) priority = "high";
        else if (priorities.medium?.includes(moduleId)) priority = "medium";
        else if (priorities.low?.includes(moduleId)) priority = "low";
      }
      return { tabKey, moduleId, priority };
    });

    return tabs
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
      .map((t) => t.tabKey);
  }, [ctx.contextId]);

  // ── Realtime entity coverage ──
  // Verifies every communication entity is synced by the Realtime Engine.
  const realtimeCoverage = useMemo(() => {
    const commModules = getModulesByCategory("communication");
    const entities = [...new Set(commModules.map((m) => m.entity).filter(Boolean))];
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

  // ── Bud communication context ──
  // When Connect is active, Bud proactively assists with:
  // summarizing long conversations, highlighting action items, suggesting
  // meeting times, drafting replies, and surfacing unread priorities.
  // Bud orchestrates only — never owns communication UI.
  const budContext = useMemo(() => ({
    experience: "connect",
    context: ctx.contextId,
    isSocial: ctx.isSocial,
    proactiveAssist: [
      "summarize-conversations",
      "highlight-action-items",
      "suggest-meeting-times",
      "draft-replies",
      "surface-unread-priorities",
    ],
  }), [ctx.contextId, ctx.isSocial]);

  return {
    contextId: ctx.contextId,
    isSocial: ctx.isSocial,
    orderedTabs,
    realtimeCoverage,
    platformCore,
    budContext,
    contract,
  };
}
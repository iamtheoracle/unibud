import { useMemo } from "react";
import { useContextSystem } from "./ContextProvider";
import { getModulePriority } from "./manifest";
import { getModule, getModulesByCategory } from "./moduleRegistry";
import { getContract } from "./experienceContract";
import { SYNC_REGISTRY } from "@/lib/realtime/entitySyncRegistry";

/**
 * Maps Campus feed section IDs to registered shared module IDs.
 * When context changes, sections are reordered by their module's priority.
 */
export const CAMPUS_SECTION_MODULES = {
  "academic-summary": "gpa",
  "announcements": "announcements",
  "upcoming-classes": "timetable",
  "course-discussions": "discussions",
  "assignments-due": "assignments",
  "research-opportunities": "research",
  "department-highlights": "courses",
  "campus-scholarships": "scholarships",
};

// Summary always stays at top — it's the overview, not a prioritizable section
const PINNED_SECTIONS = ["academic-summary"];
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/**
 * useCampusPlatformCore — the migration bridge between Campus and Platform Core.
 *
 * Campus no longer owns data fetching logic, realtime subscriptions, or AI
 * context. This hook wires Campus to every Platform Core service through
 * registries and hooks:
 *
 *   • ContextProvider  — sections are reordered by context priority
 *   • Module Registry  — every section maps to a registered shared module
 *   • Realtime Engine  — entity sync coverage is verified at mount
 *   • Experience Contract — Platform Core adoption is validated
 *   • Bud              — academic context is built for proactive assistance
 *
 * References: Phase 6 Campus Migration, OS Constitution.
 */
export function useCampusPlatformCore() {
  const ctx = useContextSystem();
  const contract = getContract("campus");

  // ── Context-prioritized feed section ordering ──
  // Academic context: timetable, assignments, research, scholarships first.
  // Social context: upcoming classes and deadlines first.
  // Hybrid: balanced presentation.
  // Navigation is never changed — only module priority shifts.
  const orderedSections = useMemo(() => {
    const priorities = getModulePriority("campus", ctx.contextId);

    const sections = Object.entries(CAMPUS_SECTION_MODULES).map(([sectionId, moduleId]) => {
      let priority = "medium";
      if (priorities) {
        if (priorities.high?.includes(moduleId)) priority = "high";
        else if (priorities.medium?.includes(moduleId)) priority = "medium";
        else if (priorities.low?.includes(moduleId)) priority = "low";
      }
      return { sectionId, moduleId, priority };
    });

    const pinned = sections.filter((s) => PINNED_SECTIONS.includes(s.sectionId));
    const rest = sections
      .filter((s) => !PINNED_SECTIONS.includes(s.sectionId))
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));

    return [...pinned, ...rest].map((s) => s.sectionId);
  }, [ctx.contextId]);

  // ── Realtime entity coverage ──
  // Verifies every academic entity is synced by the Realtime Engine.
  // If any entity is missing from SYNC_REGISTRY, Campus would require
  // manual refresh for that data — a constitutional violation.
  const realtimeCoverage = useMemo(() => {
    const academicModules = getModulesByCategory("academic");
    const entities = [...new Set(academicModules.map((m) => m.entity).filter(Boolean))];
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

  // ── Bud academic context ──
  // When Campus is active, Bud proactively assists with:
  // overdue assignments, GPA changes, exam preparation, study recommendations,
  // scholarship opportunities, and academic insights.
  // Bud remains floating and never becomes a Campus screen.
  const budContext = useMemo(() => ({
    experience: "campus",
    context: ctx.contextId,
    isAcademic: ctx.isAcademic,
    proactiveAssist: [
      "overdue-assignments",
      "gpa-changes",
      "exam-preparation",
      "study-recommendations",
      "scholarship-opportunities",
      "academic-insights",
    ],
  }), [ctx.contextId, ctx.isAcademic]);

  return {
    contextId: ctx.contextId,
    isAcademic: ctx.isAcademic,
    orderedSections,
    realtimeCoverage,
    platformCore,
    budContext,
    contract,
  };
}
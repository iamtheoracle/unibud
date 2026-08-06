import { useUnibudContext } from "@/lib/UnibudContext";
import { ACADEMIC_CATEGORIES } from "@/lib/academics/registry";

/**
 * useAcademicRecommendations — Spark's academic personalization.
 * Prioritizes experiences from real context (impending exams, open
 * assignments, study streaks) so the hub surfaces the next right action.
 */
export function useAcademicRecommendations() {
  const ctx = useUnibudContext() || {};
  const score = (key) => {
    let s = 0;
    if (key === "exams") s += (ctx.exams?.length || 0) * 1.2;
    if (key === "assignments") s += (ctx.assignments?.length || 0) * 0.8;
    if (key === "notes" || key === "projects") s += (ctx.assignments?.length || 0) * 0.3 + 0.5;
    if (key === "results") s += (ctx.exams?.length ? 1 : 0) + 0.6;
    if (key === "attendance") s += 0.5;
    if (key === "timetable" || key === "calendar") s += 0.8;
    if (key === "planner") s += (ctx.sessions?.length || 0) * 0.4 + 0.4;
    if (key === "studygroups") s += 0.4;
    return s;
  };
  return [...ACADEMIC_CATEGORIES]
    .map((c) => ({ key: c.key, s: score(c.key), live: c.live }))
    .filter((x) => x.live)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.key);
}
import { useUnibudContext } from "@/lib/UnibudContext";
import { CAMPUS_CATEGORIES } from "@/lib/campus/registry";

/**
 * useCampusRecommendations — Spark's lightweight campus personalization.
 * Ranks live experiences using real context signals (deadlines, exams,
 * social activity, wallet) so the hub surfaces what each student needs now.
 */
export function useCampusRecommendations() {
  const ctx = useUnibudContext() || {};
  const score = (key) => {
    let s = 0;
    if (key === "library" || key === "research") {
      s += (ctx.assignments?.length || 0) * 0.5 + (ctx.exams?.length || 0) * 0.6;
    }
    if (key === "events") s += (ctx.exams?.length ? 0 : 2) + 1.5;
    if (key === "clubs" || key === "organizations") s += (ctx.quadPosts?.length || 0) * 0.3 + 1;
    if (key === "marketplace") s += 0.8;
    if (key === "opportunities" || key === "internships" || key === "scholarships") s += 1.2;
    if (key === "sports") s += 0.6;
    if (key === "lostfound") s += 0.4;
    return s;
  };
  return [...CAMPUS_CATEGORIES]
    .map((c) => ({ key: c.key, s: score(c.key), live: c.live }))
    .filter((x) => x.live)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.key);
}
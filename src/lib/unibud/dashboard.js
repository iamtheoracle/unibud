import { TOOL_DEFINITIONS } from "./tools";
import { getGoals } from "./goals";

/**
 * Mirrors assembleDashboard() from the spec.
 * Ranks tools against stored goal tags (tag-overlap scoring).
 */
export function rankTools(goalTags) {
  if (!goalTags || goalTags.length === 0) return null;
  const scored = TOOL_DEFINITIONS.map((tool) => {
    const overlap = tool.tags.filter((t) => goalTags.includes(t)).length;
    return { tool, score: overlap / goalTags.length };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0] : null;
}

export function buildGreeting(name, goalTags) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  if (!goalTags || goalTags.length === 0) {
    return `${time}, ${name}. Tell me what you're working toward and I'll point you at where to start.`;
  }
  return `${time}, ${name}. Based on what you told me, here's where I'd start.`;
}

export { getGoals, TOOL_DEFINITIONS };
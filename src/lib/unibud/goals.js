const GOALS_KEY = "unibud_academic_goal_tags";

/**
 * UNIBUD-specific goal persistence over localStorage.
 * Mirrors the Spark.personalization API shape from the spec.
 */
export function setGoals(userId, tags) {
  try {
    localStorage.setItem(`${GOALS_KEY}_${userId}`, JSON.stringify(tags));
  } catch {}
}

export function getGoals(userId) {
  try {
    const raw = localStorage.getItem(`${GOALS_KEY}_${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
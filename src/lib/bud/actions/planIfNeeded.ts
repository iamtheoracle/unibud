import type { BudSparkPort } from "../adapters/sparkPort";
import type { Plan } from "../../spark/core/planning/interface";

const STEP_SEPARATORS = /\bthen\b|;|\n-|\n\d+\./i;

/**
 * This is mechanical text splitting, not reasoning about intent — Bud
 * detects a shape (multiple steps separated by "then"/semicolons/list
 * markers) and hands the actual planning off to Spark. If the message
 * doesn't look like a multi-step request, no plan is created.
 */
export function planIfNeeded(spark: BudSparkPort, message: string): Plan | null {
  if (!STEP_SEPARATORS.test(message)) {
    return null;
  }
  const steps = message
    .split(STEP_SEPARATORS)
    .map((s) => s.replace(/^[\s\-.\d]+/, "").trim())
    .filter((s) => s.length > 0);
  if (steps.length < 2) {
    return null;
  }
  return spark.planning.createPlan(message, steps);
}

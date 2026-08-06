/**
 * Super Agent Router
 *
 * Classifies user messages and determines which cognitive specialist(s)
 * should handle the request. In AUTO mode, routing is automatic.
 * In manual mode, the user-selected specialist is always used.
 *
 * The user never sees this — Bud handles routing silently.
 */

import { SPECIALISTS, SPECIALIST_IDS, isDestructiveAction } from "./personas";

/**
 * Classify a user message and determine which specialists to invoke.
 *
 * @param {string} message — The user's message
 * @param {"auto"|"spark"|"oracle"|"orbit"} mode — Current routing mode
 * @returns {{
 *   specialists: string[],
 *   isDestructive: boolean,
 *   confidence: number,
 *   reason: string,
 * }}
 */
export function routeMessage(message, mode = "auto") {
  const msg = message.toLowerCase().trim();

  // Manual mode — always use the selected specialist
  if (mode !== "auto" && SPECIALIST_IDS.includes(mode)) {
    return {
      specialists: [mode],
      isDestructive: isDestructiveAction(message),
      confidence: 1.0,
      reason: `Manual mode: ${SPECIALISTS[mode].name}`,
    };
  }

  // Auto mode — classify by keyword matching
  const scores = { spark: 0, oracle: 0, orbit: 0 };

  for (const id of SPECIALIST_IDS) {
    const specialist = SPECIALISTS[id];
    for (const keyword of specialist.keywords) {
      if (msg.includes(keyword)) {
        scores[id] += 1;
      }
    }
  }

  // Multi-keyword boost — if multiple keywords from same specialist, boost
  for (const id of SPECIALIST_IDS) {
    if (scores[id] >= 3) scores[id] += 2;
    if (scores[id] >= 5) scores[id] += 3;
  }

  const maxScore = Math.max(scores.spark, scores.oracle, scores.orbit);

  // If no keywords match, default to oracle (general reasoning)
  if (maxScore === 0) {
    return {
      specialists: ["oracle"],
      isDestructive: isDestructiveAction(message),
      confidence: 0.3,
      reason: "No specific keywords — defaulting to general reasoning",
    };
  }

  // Determine active specialists — those above 60% of max score collaborate
  const threshold = maxScore * 0.6;
  const active = SPECIALIST_IDS
    .filter((id) => scores[id] >= threshold && scores[id] > 0)
    .sort((a, b) => scores[b] - scores[a]);

  const confidence = Math.min(0.5 + (maxScore * 0.1), 0.95);
  const specialistNames = active.map((id) => SPECIALISTS[id].name).join(" + ");

  return {
    specialists: active,
    isDestructive: isDestructiveAction(message),
    confidence,
    reason: `${specialistNames} (scores: spark=${scores.spark}, oracle=${scores.oracle}, orbit=${scores.orbit})`,
  };
}

/**
 * Get status message for the active specialists.
 * Always attributed to Bud — specialist names are never surfaced to the user.
 */
export function getStatusMessage(_specialistIds) {
  return "Bud is thinking...";
}
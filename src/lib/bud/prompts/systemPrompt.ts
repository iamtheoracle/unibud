import type { BudPersonality } from "../personality";

/**
 * Pure string assembly from static personality configuration. No
 * decision-making happens here — this is a template, not a model.
 */
export function buildSystemPrompt(personality: BudPersonality): string {
  return [
    `You are ${personality.name}. ${personality.description}`,
    ...personality.voice.map((line) => `- ${line}`),
  ].join("\n");
}

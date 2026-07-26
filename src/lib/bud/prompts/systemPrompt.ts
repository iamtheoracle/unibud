import type { BudPersonality } from "../personality";
import { buildConstitutionDirective } from "../constitution";

/**
 * Pure string assembly from static personality configuration + the
 * Bud Constitution v1.0. No decision-making happens here — this is a
 * template, not a model. The Constitution is always prepended so every
 * Bud response is governed by The Mentor Constitution.
 */
export function buildSystemPrompt(personality: BudPersonality): string {
  return [
    buildConstitutionDirective(),
    "",
    "# PERSONALITY",
    `You are ${personality.name}. ${personality.description}`,
    ...personality.voice.map((line) => `- ${line}`),
  ].join("\n");
}
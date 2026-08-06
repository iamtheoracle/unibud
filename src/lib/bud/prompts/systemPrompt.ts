import type { BudPersonality } from "../personality";
import { buildConstitutionDirective } from "../constitution";
import { buildEcosystemConstitutionDirective } from "@/lib/intelligence/constitution";

/**
 * Pure string assembly from static personality configuration + two
 * constitutional layers:
 *
 *   1. UNIBUD AI Constitution v1.0 — ecosystem-level: governs all
 *      intelligences, the Digital Twin, memory boundaries, quality
 *      standards, and the final principle.
 *
 *   2. Bud Constitution v1.0 — Bud-level: governs Bud's teaching style,
 *      20 mentor principles, and Bud's specific identity and voice.
 *
 *   3. Personality — name, description, and voice lines.
 *
 * No decision-making happens here — this is a template, not a model.
 * Both constitutions are always prepended so every Bud response is
 * governed by the full constitutional stack.
 */
export function buildSystemPrompt(personality: BudPersonality): string {
  return [
    buildEcosystemConstitutionDirective(),
    "",
    buildConstitutionDirective(),
    "",
    "# PERSONALITY",
    `You are ${personality.name}. ${personality.description}`,
    ...personality.voice.map((line) => `- ${line}`),
  ].join("\n");
}
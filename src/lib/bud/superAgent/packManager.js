/**
 * Experience Pack Manager
 *
 * Manages which Experience Packs are active for the current user.
 * Combines active packs' knowledge, tools, and skills into a single
 * "Experience Context" that gets injected into Bud's system prompt.
 *
 * Multiple packs can be active simultaneously — their knowledge layers
 * are combined naturally, and all tools from all active packs are available.
 */

import { EXPERIENCE_PACKS, PACK_IDS, isValidPack } from "./experiencePacks";

/**
 * Build the combined experience context from active packs.
 *
 * @param {string[]} packIds — Active pack IDs (e.g. ["student", "health"])
 * @returns {{
 *   knowledgeBlock: string,
 *   tools: string[],
 *   skills: string[],
 *   styleNote: string,
 *   activePacks: object[],
 * }}
 */
export function buildExperienceContext(packIds = []) {
  const valid = packIds.filter(isValidPack);
  if (valid.length === 0) {
    // Default to student pack if none active
    const def = EXPERIENCE_PACKS.student;
    return {
      knowledgeBlock: def.knowledge,
      tools: def.tools,
      skills: def.skills,
      styleNote: def.style,
      activePacks: [def],
    };
  }

  const packs = valid.map((id) => EXPERIENCE_PACKS[id]);

  // Combine knowledge blocks — each pack contributes its domain knowledge
  const knowledgeBlock = packs
    .map((p) => p.knowledge)
    .join("\n\n");

  // Merge all tools (unique)
  const tools = [...new Set(packs.flatMap((p) => p.tools))];

  // Merge all skills (unique)
  const skills = [...new Set(packs.flatMap((p) => p.skills))];

  // Combine style notes — primary pack's style takes lead, others influence
  const styleNote = packs.length === 1
    ? packs[0].style
    : `Blend these communication styles: ${packs.map((p) => `${p.name.toLowerCase()} (${p.style})`).join(", ")}. Prioritize the primary pack's style.`;

  return { knowledgeBlock, tools, skills, styleNote, activePacks: packs };
}

/**
 * Get the list of all available packs for UI display.
 */
export function getAvailablePacks() {
  return PACK_IDS.map((id) => {
    const p = EXPERIENCE_PACKS[id];
    return {
      id: p.id,
      name: p.name,
      icon: p.icon,
      color: p.color,
      bg: p.bg,
      description: p.description,
      isDefault: p.isDefault,
      skillCount: p.skills.length,
      toolCount: p.tools.length,
    };
  });
}

/**
 * Get the default active packs for a new user.
 * For UNIBUD, this is just the Student pack.
 */
export function getDefaultPacks() {
  return ["student"];
}

/**
 * Check if a tool is available given the active packs.
 */
export function isToolAvailable(toolName, packIds = []) {
  const ctx = buildExperienceContext(packIds);
  return ctx.tools.includes(toolName);
}
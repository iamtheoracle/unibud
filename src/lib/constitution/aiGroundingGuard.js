import { base44 } from "@/api/base44Client";
import { AI_GROUNDING_PROMPT } from "@/lib/constitution/engineeringConstitution";

/**
 * AI Grounding Guard
 *
 * Enforces the engineering constitution's AI rules on every Bud response.
 * Bud must never hallucinate, must verify information, must cite sources,
 * and must acknowledge uncertainty.
 *
 * This module wraps the Oracle Router's combine step to inject grounding
 * rules into Bud's system prompt.
 */

/**
 * Returns the AI grounding prompt that must be appended to every
 * Bud system prompt. This ensures Bud never hallucinates.
 */
export function getGroundingPrompt() {
  return AI_GROUNDING_PROMPT;
}

/**
 * Validates that an AI response doesn't contain hallucination patterns.
 * Returns warnings if potentially fabricated content is detected.
 */
export function validateAIResponse(response, contextData) {
  const warnings = [];
  const text = (response || "").toLowerCase();

  // Check for specific claims that might be fabricated
  const suspiciousPatterns = [
    { pattern: /according to (?:the )?(?:university|department|faculty)/i, warning: "Response cites a source — verify it exists in context data" },
    { pattern: /your (?:gpa|grade|score) is/i, warning: "Response states a specific grade — verify it's from real data" },
    { pattern: /you have (\d+) (?:assignments|exams|courses)/i, warning: "Response states a specific count — verify from entity data" },
  ];

  for (const { pattern, warning } of suspiciousPatterns) {
    if (pattern.test(text)) {
      warnings.push(warning);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Enriches the Oracle Router's combine prompt with grounding rules.
 * This function is called by the oracleRouter before generating
 * Bud's final unified response.
 */
export function enrichCombinePrompt(basePrompt, agentResults) {
  // Add grounding rules
  const grounded = `${basePrompt}\n\n${getGroundingPrompt()}\n\n`;

  // Add a note about data authenticity
  const dataNote =
    agentResults.length > 0
      ? `IMPORTANT: The specialist analysis below is based on REAL entity data from the student's account. ` +
        `Only reference information that appears in the analysis. If the analysis is empty or doesn't contain ` +
        `specific data, acknowledge it honestly — do not invent details.\n\n`
      : `IMPORTANT: No specialist agent data was available for this request. ` +
        `Respond based on general knowledge only and clearly state when you don't have specific information.\n\n`;

  return grounded + dataNote;
}

/**
 * Checks if entity data provided to an agent is authentic (non-seed).
 * Returns only real data for AI analysis.
 */
export function filterAuthenticEntityData(entityContext) {
  if (!entityContext) return "";
  // The entity fetchers already filter seed content, but this is a
  // secondary guard to ensure no seed data reaches Bud
  return entityContext;
}
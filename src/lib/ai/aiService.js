// Provider-independent AI service for UNIBUD.
// Wraps Base44's InvokeLLM (platform-managed, replaceable adapter) behind a single seam.
//
// ARCHITECTURE RULE: UNIBUD's core must NOT depend on this module or on any LLM.
// AI is an OPTIONAL intelligence layer. All callers must handle a null return
// (AI unavailable) by degrading gracefully to a non-AI experience — never by crashing.
//
// This module never imports a provider-specific SDK (OpenAI, Anthropic, Gemini, etc.).
// The platform selects the underlying model; business code stays provider-agnostic.

import { base44 } from "@/api/base44Client";

/**
 * Ask Bud (the AI layer) a question.
 * @param {string} prompt
 * @param {{ fileUrls?: string[], model?: string, responseJsonSchema?: object }} [options]
 * @returns {Promise<string|null>} The AI response text, or null when AI is unavailable.
 *   Never throws — a null return signals "AI unavailable, use fallback."
 */
export async function askBud(prompt, options = {}) {
  if (!prompt) return null;
  try {
    const payload = { prompt };
    if (options.fileUrls && options.fileUrls.length > 0) payload.file_urls = options.fileUrls;
    if (options.model) payload.model = options.model;
    if (options.responseJsonSchema) payload.response_json_schema = options.responseJsonSchema;
    const res = await base44.integrations.Core.InvokeLLM(payload);
    if (typeof res === "string") return res;
    if (res && typeof res.content === "string") return res.content;
    if (res && typeof res === "object") {
      try { return JSON.stringify(res); } catch { return null; }
    }
    return null;
  } catch {
    return null;
  }
}
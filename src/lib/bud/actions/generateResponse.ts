import type { BudSparkPort } from "../adapters/sparkPort";
import type { BudPersonality } from "../personality";
import type { ReasoningResult } from "../../spark/core/reasoning/interface";
import type { MemoryRecord } from "../../spark/memory/interface";
import type { SearchResult } from "../../spark/intelligence/search/interface";
import type { WritingResult } from "../../spark/intelligence/writing/interface";
import { buildSystemPrompt } from "../prompts/systemPrompt";
import { buildUserPrompt } from "../prompts/userPrompt";

/**
 * Delegates text generation to Spark.writing (which in turn delegates
 * to whatever AIProvider is configured). Bud never calls a provider
 * directly — this is the only path to generated text.
 */
export async function generateResponse(
  spark: BudSparkPort,
  personality: BudPersonality,
  input: {
    message: string;
    memoryRecords: MemoryRecord[];
    knowledgeResults: SearchResult[];
    reasoning: ReasoningResult;
  }
): Promise<WritingResult> {
  const system = buildSystemPrompt(personality);
  const user = buildUserPrompt(input);
  return spark.writing.draft({
    prompt: `${system}\n\n${user}`,
    tone: personality.tone,
  });
}

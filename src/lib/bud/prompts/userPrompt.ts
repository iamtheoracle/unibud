import type { ReasoningResult } from "../../spark/core/reasoning/interface";
import type { MemoryRecord } from "../../spark/memory/interface";
import type { SearchResult } from "../../spark/intelligence/search/interface";

/**
 * Assembles the prompt handed to Spark.writing.draft(). All of the
 * "thinking" was already done by Spark (reasoning, search, memory) —
 * this just formats it into text for the writing step.
 */
export function buildUserPrompt(input: {
  message: string;
  memoryRecords: MemoryRecord[];
  knowledgeResults: SearchResult[];
  reasoning: ReasoningResult;
}): string {
  const { message, memoryRecords, knowledgeResults, reasoning } = input;
  const sections = [
    `User said: "${message}"`,
    `Spark's analysis: ${reasoning.answer}`,
  ];
  if (memoryRecords.length) {
    sections.push(
      `Relevant memory:\n${memoryRecords.map((m) => `- ${m.content}`).join("\n")}`
    );
  }
  if (knowledgeResults.length) {
    sections.push(
      `Relevant knowledge:\n${knowledgeResults
        .map((k) => `- ${k.title}: ${k.snippet}`)
        .join("\n")}`
    );
  }
  sections.push("Reply to the user directly, in one short response.");
  return sections.join("\n\n");
}

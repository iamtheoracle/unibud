import type {
  ReasoningInput,
  ReasoningResult,
  ReasoningService,
} from "./interface";
import type { ProviderRegistry } from "../../providers/registry";

/**
 * Deterministic local reasoning implementation. Produces a transparent,
 * step-by-step trace without requiring a hosted model. When a real
 * provider becomes available, this class can delegate to it through
 * ProviderRegistry without callers changing anything.
 */
export class LocalReasoningService implements ReasoningService {
  constructor(private readonly providers: ProviderRegistry) {}

  async analyze(input: ReasoningInput): Promise<ReasoningResult> {
    const provider = this.providers.resolve();
    const facts = input.facts ?? [];
    const steps = [
      { step: 1, description: `Parsed question: "${input.question}"` },
      {
        step: 2,
        description: facts.length
          ? `Considered ${facts.length} supplied fact(s).`
          : "No supporting facts were supplied.",
      },
      {
        step: 3,
        description: `Delegated synthesis to provider "${provider.name}".`,
      },
    ];
    const completion = await provider.complete({
      messages: [
        { role: "system", content: "You are Spark's reasoning module." },
        {
          role: "user",
          content: `Question: ${input.question}\nFacts: ${facts.join("; ")}`,
        },
      ],
    });
    return {
      answer: completion.text,
      confidence: facts.length > 0 ? 0.6 : 0.35,
      steps,
      usedProvider: provider.name,
    };
  }
}

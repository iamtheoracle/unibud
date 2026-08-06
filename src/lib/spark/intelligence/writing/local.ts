import type { WritingRequest, WritingResult, WritingService } from "./interface";
import type { ProviderRegistry } from "../../providers/registry";

/** Delegates drafting to the resolved AI provider (mock by default). */
export class LocalWritingService implements WritingService {
  constructor(private readonly providers: ProviderRegistry) {}

  async draft(request: WritingRequest): Promise<WritingResult> {
    const provider = this.providers.resolve();
    const tone = request.tone ?? "neutral";
    const completion = await provider.complete({
      messages: [
        {
          role: "system",
          content: `You are Spark's writing module. Tone: ${tone}.`,
        },
        { role: "user", content: request.prompt },
      ],
      maxTokens: request.maxLength,
    });
    return { text: completion.text, tone, provider: completion.provider };
  }
}

import type {
  AIProvider,
  AIProviderCompletionRequest,
  AIProviderCompletionResult,
  AIProviderEmbeddingResult,
} from "./types";

/**
 * Deterministic, offline provider. This is the default provider so that
 * Spark builds and runs with zero external dependencies and zero API keys.
 * It never makes a network call.
 */
export class MockProvider implements AIProvider {
  readonly name = "mock";

  isAvailable(): boolean {
    return true;
  }

  async complete(
    request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult> {
    const lastUser = [...request.messages]
      .reverse()
      .find((m) => m.role === "user");
    return {
      text: `[mock:${this.name}] acknowledged ${
        lastUser ? lastUser.content.length : 0
      } chars of input.`,
      provider: this.name,
      model: "mock-1",
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  async embed(text: string): Promise<AIProviderEmbeddingResult> {
    // Deterministic pseudo-embedding derived from character codes, so
    // the same input always yields the same vector without any model.
    const dims = 16;
    const vector = new Array(dims).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % dims] += text.charCodeAt(i);
    }
    const max = Math.max(1, ...vector.map(Math.abs));
    return {
      vector: vector.map((v) => v / max),
      provider: this.name,
      model: "mock-embed-1",
    };
  }
}

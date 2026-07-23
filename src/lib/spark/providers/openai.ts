import type {
  AIProvider,
  AIProviderCompletionRequest,
  AIProviderCompletionResult,
} from "./types";

/**
 * Placeholder adapter for OpenAI. Contains no SDK dependency and makes
 * no network calls. Swap in a real implementation later without
 * changing any Spark service code — they only depend on AIProvider.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  constructor(private readonly apiKey?: string) {}

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(
    _request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult> {
    if (!this.isAvailable()) {
      throw new Error(
        "OpenAIProvider is a placeholder and has no API key configured."
      );
    }
    throw new Error("OpenAIProvider.complete() is not yet implemented.");
  }
}

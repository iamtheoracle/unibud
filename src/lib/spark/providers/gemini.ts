import type {
  AIProvider,
  AIProviderCompletionRequest,
  AIProviderCompletionResult,
} from "./types";

/** Placeholder adapter for Google Gemini. No SDK dependency, no network calls. */
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  constructor(private readonly apiKey?: string) {}

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(
    _request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult> {
    if (!this.isAvailable()) {
      throw new Error(
        "GeminiProvider is a placeholder and has no API key configured."
      );
    }
    throw new Error("GeminiProvider.complete() is not yet implemented.");
  }
}

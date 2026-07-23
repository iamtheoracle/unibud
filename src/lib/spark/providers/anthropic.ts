import type {
  AIProvider,
  AIProviderCompletionRequest,
  AIProviderCompletionResult,
} from "./types";

/**
 * Placeholder adapter for Anthropic. Contains no SDK dependency and
 * makes no network calls.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  constructor(private readonly apiKey?: string) {}

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(
    _request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult> {
    if (!this.isAvailable()) {
      throw new Error(
        "AnthropicProvider is a placeholder and has no API key configured."
      );
    }
    throw new Error("AnthropicProvider.complete() is not yet implemented.");
  }
}

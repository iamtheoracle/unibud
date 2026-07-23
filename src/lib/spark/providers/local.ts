import type {
  AIProvider,
  AIProviderCompletionRequest,
  AIProviderCompletionResult,
} from "./types";

/**
 * Placeholder adapter for a local/self-hosted model (e.g. Ollama, a
 * local llama.cpp server). No network calls are made in this phase.
 */
export class LocalModelProvider implements AIProvider {
  readonly name = "local";
  constructor(private readonly endpoint?: string) {}

  isAvailable(): boolean {
    return Boolean(this.endpoint);
  }

  async complete(
    _request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult> {
    if (!this.isAvailable()) {
      throw new Error(
        "LocalModelProvider is a placeholder and has no endpoint configured."
      );
    }
    throw new Error("LocalModelProvider.complete() is not yet implemented.");
  }
}

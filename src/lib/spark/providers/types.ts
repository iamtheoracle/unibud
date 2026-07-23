/**
 * AI Provider abstraction.
 *
 * Spark services never call a provider SDK directly — they only ever
 * talk to this interface. Concrete providers (OpenAI, Anthropic, Gemini,
 * local models, etc.) are adapters that implement it and are registered
 * through the ProviderRegistry.
 */
export interface AIProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProviderCompletionRequest {
  messages: AIProviderMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface AIProviderCompletionResult {
  text: string;
  provider: string;
  model?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface AIProviderEmbeddingResult {
  vector: number[];
  provider: string;
  model?: string;
}

export interface AIProvider {
  /** Unique identifier, e.g. "mock", "openai", "anthropic" */
  readonly name: string;
  /** Whether this provider is currently usable (e.g. has credentials). */
  isAvailable(): boolean;
  complete(
    request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult>;
  embed?(text: string): Promise<AIProviderEmbeddingResult>;
}

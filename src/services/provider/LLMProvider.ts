/**
 * Backend-only LLM provider abstraction.
 * This module handles server-side communication with external LLM services.
 * Never expose provider API keys to the frontend.
 */

export type ProviderName = 'openai' | 'anthropic' | 'gemini';

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface LLMProvider {
  complete(prompt: string, config?: Partial<ProviderConfig>): Promise<LLMResponse>;
}

export { OpenAIProvider } from './OpenAIProvider';
export { AnthropicProvider } from './AnthropicProvider';
export { GeminiProvider } from './GeminiProvider';

export function createProvider(name: ProviderName, config: ProviderConfig): LLMProvider {
  switch (name) {
    case 'openai':
      return new (require('./OpenAIProvider').OpenAIProvider)(config);
    case 'anthropic':
      return new (require('./AnthropicProvider').AnthropicProvider)(config);
    case 'gemini':
      return new (require('./GeminiProvider').GeminiProvider)(config);
    default:
      throw new Error(`Provider "${name}" is not supported.`);
  }
}

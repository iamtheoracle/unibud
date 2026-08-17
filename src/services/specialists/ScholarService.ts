/**
 * Scholar Service: Academic specialist.
 * Provides academic reasoning, explanations, and analysis.
 * Provider-agnostic implementation.
 */

import { createProvider, LLMProvider, ProviderConfig } from '../provider/LLMProvider';

export class ScholarService {
  private provider: LLMProvider;
  private systemPrompt =
    'You are Scholar, an academic specialist for students. Provide clear, accurate, and helpful academic reasoning and explanations.';

  constructor(config?: ProviderConfig) {
    const providerName = process.env.DEFAULT_LLM_PROVIDER || 'openai';
    const apiKey = process.env[`${providerName.toUpperCase()}_API_KEY`];

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${providerName}`);
    }

    this.provider = createProvider(
      providerName as any,
      config || { apiKey }
    );
  }

  async answer(prompt: string, context: any): Promise<string> {
    const fullPrompt = `${this.systemPrompt}\n\nStudent context: ${JSON.stringify(context)}\n\nStudent question: ${prompt}`;
    const response = await this.provider.complete(fullPrompt);
    return response.content;
  }
}

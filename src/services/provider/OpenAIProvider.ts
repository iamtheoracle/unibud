import OpenAI from 'openai';
import { LLMProvider, LLMResponse, ProviderConfig } from './LLMProvider';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.defaultModel = config.model || 'gpt-4o-mini';
  }

  async complete(prompt: string, config?: Partial<ProviderConfig>): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: config?.model || this.defaultModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 1024,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      },
    };
  }
}

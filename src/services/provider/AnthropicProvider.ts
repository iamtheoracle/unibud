import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMResponse, ProviderConfig } from './LLMProvider';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private defaultModel: string;

  constructor(config: ProviderConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.defaultModel = config.model || 'claude-3-5-sonnet-20241022';
  }

  async complete(prompt: string, config?: Partial<ProviderConfig>): Promise<LLMResponse> {
    const response = await this.client.messages.create({
      model: config?.model || this.defaultModel,
      max_tokens: config?.maxTokens ?? 1024,
      temperature: config?.temperature ?? 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      content: response.content[0]?.type === 'text' ? response.content[0].text : '',
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
      },
    };
  }
}

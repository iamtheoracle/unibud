import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse, ProviderConfig } from './LLMProvider';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(config: ProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.defaultModel = config.model || 'gemini-1.5-flash';
  }

  async complete(prompt: string, config?: Partial<ProviderConfig>): Promise<LLMResponse> {
    const model = this.client.getGenerativeModel({
      model: config?.model || this.defaultModel,
    });
    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
      content: response.text(),
      usage: { promptTokens: 0, completionTokens: 0 },
    };
  }
}

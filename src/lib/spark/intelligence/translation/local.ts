import type {
  TranslationRequest,
  TranslationResult,
  TranslationService,
} from "./interface";
import type { ProviderRegistry } from "../../providers/registry";

/** Delegates translation to the resolved AI provider (mock by default). */
export class LocalTranslationService implements TranslationService {
  constructor(private readonly providers: ProviderRegistry) {}

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const provider = this.providers.resolve();
    const completion = await provider.complete({
      messages: [
        {
          role: "system",
          content: `You are Spark's translation module. Translate into ${request.targetLocale}.`,
        },
        { role: "user", content: request.text },
      ],
    });
    return {
      text: completion.text,
      targetLocale: request.targetLocale,
      sourceLocale: request.sourceLocale,
      provider: completion.provider,
    };
  }
}

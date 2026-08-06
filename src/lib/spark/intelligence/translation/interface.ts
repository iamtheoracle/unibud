export interface TranslationRequest {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
}

export interface TranslationResult {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
  provider: string;
}

export interface TranslationService {
  translate(request: TranslationRequest): Promise<TranslationResult>;
}

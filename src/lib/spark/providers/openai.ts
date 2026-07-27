import type {
  AIProvider,
  AIProviderCompletionRequest,
  AIProviderCompletionResult,
  AIProviderEmbeddingResult,
} from "./types";

/**
 * Real OpenAI Chat Completions adapter. Implements the AIProvider
 * interface with no SDK dependency — it uses the platform `fetch`.
 *
 * Credentials and endpoint are read ONLY from environment variables /
 * Vite env so nothing is ever hardcoded. In a browser build the key
 * must be exposed via `VITE_OPENAI_API_KEY`; in a Node runtime the
 * plain `OPENAI_API_KEY` is also honoured.
 *
 * If a call fails (network, auth, rate-limit, malformed response) it
 * throws — the ProviderRegistry wraps the resolved provider so the
 * MockProvider is used as the automatic runtime fallback.
 */
export interface OpenAIProviderOptions {
  apiKey: string;
  /** Defaults to gpt-4o-mini. */
  model?: string;
  /** Defaults to https://api.openai.com/v1. */
  baseUrl?: string;
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(opts: OpenAIProviderOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "gpt-4o-mini";
    this.baseUrl = (opts.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(
    request: AIProviderCompletionRequest
  ): Promise<AIProviderCompletionResult> {
    if (!this.isAvailable()) {
      throw new Error("OpenAIProvider has no API key configured.");
    }
    const res = await this.post("/chat/completions", {
      model: this.model,
      messages: request.messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
    });
    const choice = res?.choices?.[0]?.message?.content;
    if (typeof choice !== "string") {
      throw new Error("OpenAIProvider: malformed completion response.");
    }
    return {
      text: choice,
      provider: this.name,
      model: this.model,
      usage: {
        inputTokens: res?.usage?.prompt_tokens,
        outputTokens: res?.usage?.completion_tokens,
      },
    };
  }

  async embed(text: string): Promise<AIProviderEmbeddingResult> {
    if (!this.isAvailable()) {
      throw new Error("OpenAIProvider has no API key configured.");
    }
    const res = await this.post("/embeddings", {
      model: "text-embedding-3-small",
      input: text,
    });
    const vector = res?.data?.[0]?.embedding;
    if (!Array.isArray(vector)) {
      throw new Error("OpenAIProvider: malformed embedding response.");
    }
    return { vector, provider: this.name, model: "text-embedding-3-small" };
  }

  private async post(path: string, body: unknown): Promise<any> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(`OpenAIProvider: network error — ${(err as Error).message}`);
    }
    if (!res.ok) {
      let detail = "";
      try { detail = JSON.stringify(await res.json()); } catch { detail = res.statusText; }
      throw new Error(`OpenAIProvider: HTTP ${res.status} — ${detail}`);
    }
    return res.json();
  }
}
import { describe, it, expect, afterEach } from "vitest";
import { ProviderRegistry } from "@/lib/spark/providers/registry";
import { OpenAIProvider } from "@/lib/spark/providers/openai";
import { createSpark } from "@/lib/spark";

describe("OpenAIProvider — real adapter", () => {
  it("is unavailable without an API key and throws on complete()", async () => {
    const p = new OpenAIProvider({ apiKey: "" });
    expect(p.isAvailable()).toBe(false);
    await expect(p.complete({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow();
  });

  it("completes a chat request by calling the OpenAI endpoint", async () => {
    const original = globalThis.fetch;
    let capturedUrl = "";
    let capturedAuth = "";
    globalThis.fetch = async (url, init) => {
      capturedUrl = url;
      capturedAuth = init.headers.Authorization;
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "hi from openai" } }],
          usage: { prompt_tokens: 4, completion_tokens: 3 },
        }),
      };
    };

    try {
      const p = new OpenAIProvider({ apiKey: "sk-test", model: "gpt-4o-mini" });
      const res = await p.complete({ messages: [{ role: "user", content: "hi" }] });
      expect(res.text).toBe("hi from openai");
      expect(res.provider).toBe("openai");
      expect(res.model).toBe("gpt-4o-mini");
      expect(res.usage.inputTokens).toBe(4);
      expect(capturedUrl).toBe("https://api.openai.com/v1/chat/completions");
      expect(capturedAuth).toBe("Bearer sk-test");
    } finally {
      globalThis.fetch = original;
    }
  });

  it("falls back to mock when the OpenAI HTTP call fails (via registry)", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: "boom" }) });
    try {
      const p = new OpenAIProvider({ apiKey: "sk-test" });
      const reg = new ProviderRegistry();
      reg.register(p, true);
      const res = await reg.resolve().complete({ messages: [{ role: "user", content: "hi" }] });
      expect(res.provider).toBe("mock");
    } finally {
      globalThis.fetch = original;
    }
  });

  it("throws on a malformed completion response", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
    try {
      const p = new OpenAIProvider({ apiKey: "sk-test" });
      await expect(p.complete({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow("malformed");
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe("ProviderRegistry — runtime fallback to mock", () => {
  it("degrades to the MockProvider when the default provider throws at runtime", async () => {
    const reg = new ProviderRegistry();
    const throwing = {
      name: "boom",
      isAvailable: () => true,
      complete: async () => { throw new Error("provider down"); },
    };
    reg.register(throwing, true);
    const resolved = reg.resolve();
    expect(resolved.name).toBe("boom");
    const res = await resolved.complete({ messages: [{ role: "user", content: "hi" }] });
    expect(res.provider).toBe("mock");
  });

  it("still returns the raw mock when the default provider is unavailable", () => {
    const reg = new ProviderRegistry();
    reg.register({ name: "x", isAvailable: () => false, complete: async () => ({ text: "", provider: "x" }) }, true);
    expect(reg.resolve().name).toBe("mock");
  });

  it("uses the primary provider directly when it succeeds", async () => {
    const reg = new ProviderRegistry();
    const ok = { name: "ok", isAvailable: () => true, complete: async () => ({ text: "from ok", provider: "ok" }) };
    reg.register(ok, true);
    const res = await reg.resolve().complete({ messages: [] });
    expect(res.provider).toBe("ok");
  });
});

describe("Spark — env-driven OpenAI registration", () => {
  const ENV_KEY = "OPENAI_API_KEY";
  let originalKey;

  afterEach(() => {
    if (originalKey === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = originalKey;
  });

  it("keeps MockProvider as default when no OpenAI key is in the environment", () => {
    originalKey = process.env[ENV_KEY];
    delete process.env[ENV_KEY];
    const spark = createSpark();
    const providers = spark.manifest().providers;
    const def = providers.find((p) => p.isDefault);
    expect(def?.name).toBe("mock");
  });

  it("registers OpenAI as the default provider when OPENAI_API_KEY is present", () => {
    originalKey = process.env[ENV_KEY];
    process.env[ENV_KEY] = "sk-env-test";
    const spark = createSpark();
    const providers = spark.manifest().providers;
    const def = providers.find((p) => p.isDefault);
    expect(def?.name).toBe("openai");
    expect(providers.some((p) => p.name === "mock")).toBe(true);
  });
});
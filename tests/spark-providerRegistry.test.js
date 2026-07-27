import { describe, it, expect } from "vitest";
import { ProviderRegistry } from "@/lib/spark/providers/registry";
import { MockProvider } from "@/lib/spark/providers/mock";

describe("Spark — ProviderRegistry", () => {
  it("registers the mock provider as default on construction", () => {
    const reg = new ProviderRegistry();
    const list = reg.list();
    expect(list.some((p) => p.name === "mock")).toBe(true);
    const mock = list.find((p) => p.name === "mock");
    expect(mock.isDefault).toBe(true);
    expect(mock.available).toBe(true);
  });

  it("registers a custom provider and can make it default", () => {
    const reg = new ProviderRegistry();
    const fake = {
      name: "fake",
      isAvailable: () => true,
      complete: async () => ({ text: "ok", provider: "fake", model: "f", usage: { inputTokens: 0, outputTokens: 0 } }),
      embed: async () => ({ vector: [1], provider: "fake", model: "f" }),
    };
    reg.register(fake, true);
    expect(reg.get().name).toBe("fake");
    expect(reg.list().find((p) => p.name === "fake").isDefault).toBe(true);
  });

  it("resolve() falls back to mock when the default provider is unavailable", () => {
    const reg = new ProviderRegistry();
    const down = {
      name: "down",
      isAvailable: () => false,
      complete: async () => ({ text: "", provider: "down", model: "", usage: { inputTokens: 0, outputTokens: 0 } }),
      embed: async () => ({ vector: [], provider: "down", model: "" }),
    };
    reg.register(down, true);
    expect(reg.resolve().name).toBe("mock");
  });

  it("throws when requesting an unregistered provider name", () => {
    const reg = new ProviderRegistry();
    expect(() => reg.get("nope")).toThrow();
  });

  it("the MockProvider is deterministic and offline", async () => {
    const p = new MockProvider();
    expect(p.isAvailable()).toBe(true);
    const a = await p.complete({ messages: [{ role: "user", content: "hi" }] });
    const b = await p.complete({ messages: [{ role: "user", content: "hi" }] });
    expect(a.text).toBe(b.text);
    expect(a.provider).toBe("mock");
  });
});
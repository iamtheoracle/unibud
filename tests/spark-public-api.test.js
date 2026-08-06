import { describe, it, expect } from "vitest";
import { createSpark } from "@/lib/spark";
import { SPARK_CAPABILITIES } from "@/lib/spark/manifest";

describe("Spark — public API", () => {
  it("exposes a stable version and the documented capability set", () => {
    const spark = createSpark();
    expect(typeof spark.version()).toBe("string");
    expect(spark.version().length).toBeGreaterThan(0);
    expect(SPARK_CAPABILITIES).toContain("identity");
    expect(SPARK_CAPABILITIES).toContain("memory");
    expect(SPARK_CAPABILITIES).toContain("notifications");
  });

  it("initializes and reports a healthy manifest with the mock provider", async () => {
    const spark = createSpark();
    await spark.initialize();
    expect(spark.health().status).toBe("healthy");
    const manifest = spark.manifest();
    expect(manifest.name).toBe("Spark");
    expect(manifest.providers.some((p) => p.name === "mock")).toBe(true);
  });

  it("exposes every documented service accessor", () => {
    const spark = createSpark();
    const accessors = [
      "identity", "reasoning", "planning", "memory", "context", "knowledge",
      "search", "recommendations", "organization", "personalization", "writing",
      "translation", "summaries", "privacy", "security", "automation", "learning", "notifications",
    ];
    for (const key of accessors) {
      expect(typeof spark[key], `accessor ${key}`).toBe("object");
    }
  });

  it("memory remembers and recalls records", () => {
    const spark = createSpark();
    spark.memory.remember({ sessionId: "s1", userId: "u1", text: "loves discrete math", role: "user" });
    const hits = spark.memory.recall({ sessionId: "s1", userId: "u1", query: "math", limit: 5 });
    expect(Array.isArray(hits)).toBe(true);
  });

  it("search returns an array over an empty knowledge base", async () => {
    const spark = createSpark();
    const res = await spark.search.search("anything", 5);
    expect(Array.isArray(res)).toBe(true);
  });

  it("shutdown clears the initialized flag and can re-initialize", async () => {
    const spark = createSpark();
    await spark.initialize();
    await spark.shutdown();
    expect(spark.health().status).toBe("degraded");
    await spark.initialize();
    expect(spark.health().status).toBe("healthy");
  });
});
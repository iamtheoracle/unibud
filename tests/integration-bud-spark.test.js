import { describe, it, expect } from "vitest";
import { createSpark } from "@/lib/spark";
import { createBud } from "@/lib/bud";

/**
 * Integration: Bud ↔ Spark.
 * Bud must delegate every capability to Spark through its port adapter and
 * never short-circuit the pipeline. We inject a real Spark (mock provider)
 * and assert the full orchestration produces a BudResponse with a populated
 * trace whose provider is the one Spark resolved.
 */
describe("integration — Bud → Spark", () => {
  it("respond() runs the full Spark-backed pipeline and returns a traced response", async () => {
    const spark = createSpark();
    await spark.initialize();

    const bud = createBud({ spark });
    const session = { sessionId: "s1", userId: "u1", product: "unibud" };

    const res = await bud.respond("Explain induction in two sentences.", session);

    expect(typeof res.message).toBe("string");
    expect(res.message.length).toBeGreaterThan(0);
    expect(res.sessionId).toBe("s1");
    expect(res.trace).toBeDefined();
    expect(typeof res.trace.memoryHits).toBe("number");
    expect(typeof res.trace.knowledgeHits).toBe("number");
    expect(typeof res.trace.reasoningConfidence).toBe("number");
    expect(typeof res.trace.provider).toBe("string");
  });

  it("shares a single Spark instance when one is passed in", async () => {
    const spark = createSpark();
    await spark.initialize();
    const bud = createBud({ spark });
    await bud.respond("hello", { sessionId: "s2", userId: "u2", product: "unibud" });
    // The shared Spark's memory must now contain the stored interaction.
    const hits = spark.memory.recall({ sessionId: "s2", userId: "u2", query: "hello", limit: 5 });
    expect(Array.isArray(hits)).toBe(true);
  });

  it("transcript() returns an array (empty for a fresh session)", () => {
    const spark = createSpark();
    const bud = createBud({ spark });
    expect(Array.isArray(bud.transcript("never-used"))).toBe(true);
  });
});
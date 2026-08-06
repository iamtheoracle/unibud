import { beforeEach, describe, expect, it } from "vitest";
import { aiKernel } from "@/lib/ai/kernel";
import { createBud } from "@/lib/bud";
import { createSpark } from "@/lib/spark";

describe("AI Kernel — Cycle 1 Bud/Spark integration", () => {
  beforeEach(async () => {
    try {
      await aiKernel.stopComponent("bud");
    } catch {}
    try {
      await aiKernel.stopComponent("spark");
    } catch {}
  });

  it("registers Bud and Spark with kernel metadata after initialization", async () => {
    const spark = createSpark();
    await spark.initialize();

    const bud = createBud();
    await bud.initialize({
      sessionId: "kernel-s1",
      userId: "kernel-u1",
      product: "unibud",
    });

    const components = aiKernel.listComponents();
    expect(components.some((entry) => entry.id === "bud")).toBe(true);
    expect(components.some((entry) => entry.id === "spark")).toBe(true);

    const budMeta = bud.metadata();
    expect(budMeta.lifecycle).toBe("ready");
    expect(budMeta.capabilities).toContain("conversation");

    const sparkMeta = spark.kernelMetadata();
    expect(sparkMeta.lifecycle).toBe("ready");
    expect(sparkMeta.capabilities).toContain("reasoning");
  });

  it("preserves Bud lifecycle context and health through restart", async () => {
    const bud = createBud();
    const session = {
      sessionId: "kernel-s2",
      userId: "kernel-u2",
      product: "unibud",
      locale: "en-NG",
      timezone: "Africa/Lagos",
    };

    await bud.start(session);
    expect(bud.health().status).toBe("healthy");
    expect(bud.metadata().context.sessionId).toBe("kernel-s2");

    await bud.restart(session);
    expect(bud.health().status).toBe("healthy");
    expect(bud.metadata().restarts).toBeGreaterThan(0);
    expect(bud.metadata().context.timezone).toBe("Africa/Lagos");
  });
});

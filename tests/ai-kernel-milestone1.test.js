/**
 * AI Kernel — Milestone 1 Full Agent Foundation Tests
 *
 * Tests cover:
 *   1. All milestone agents are registered in the kernel
 *   2. AgentBus: send, subscribe, broadcast, request-reply, history
 *   3. EventRouter: routing table, fan-out delivery
 *   4. AIContextManager: set, update, addMemory, addKnowledge, toPromptString
 *   5. AIPermissions: check, assert, grant, revoke, session grants
 *   6. AIMonitor: recordSuccess, recordError, health, status thresholds
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { aiKernel } from "@/lib/ai/kernel";
import { agentBus } from "@/lib/ai/agentBus";
import { eventRouter } from "@/lib/ai/eventRouter";
import { aiContextManager } from "@/lib/ai/contextManager";
import { aiPermissions } from "@/lib/ai/permissions";
import { aiMonitor } from "@/lib/ai/monitor";
import { AI_AGENT_DEFINITIONS, AI_AGENTS_BY_ID } from "@/lib/ai/agentDefinitions";

// ── 1. Agent Definitions ──────────────────────────────────────────────────

describe("AI Agent Definitions", () => {
  const REQUIRED_AGENTS = [
    // Core Super Agents
    "bud", "spark", "oracle", "orbit", "lens", "the_artist", "architect",
    // Navigation
    "social_ai", "academics_ai",
    // Student Intelligence
    "campus_ai", "community_ai", "learning_ai", "assignment_ai", "quiz_ai",
    "library_ai", "research_ai", "project_ai", "study_planner_ai", "revision_ai", "flashcard_ai",
    // Discovery
    "news_ai", "podcast_ai", "movies_ai", "anime_ai", "sports_ai",
    // Creator
    "creator_ai", "camera_ai", "voice_ai", "language_ai", "media_ai",
    // Marketplace
    "marketplace_ai", "commerce_ai", "trust_safety_ai",
    // Student Success
    "career_ai", "scholarship_ai", "wellness_ai", "gamification_ai", "opportunity_ai",
    // Platform Intelligence
    "recommendation_ai", "moderation_ai", "security_ai", "privacy_ai", "analytics_ai",
    "automation_ai", "notification_ai", "integration_ai", "identity_ai", "memory_ai",
    "knowledge_ai", "context_ai", "workflow_ai", "event_ai",
  ];

  it("defines all required milestone agents", () => {
    for (const id of REQUIRED_AGENTS) {
      expect(AI_AGENTS_BY_ID[id], `Missing agent definition: ${id}`).toBeDefined();
    }
  });

  it("every agent has required fields", () => {
    for (const agent of AI_AGENT_DEFINITIONS) {
      expect(agent.id, `${agent.name} missing id`).toBeTruthy();
      expect(agent.name, `${agent.id} missing name`).toBeTruthy();
      expect(agent.category, `${agent.id} missing category`).toBeTruthy();
      expect(Array.isArray(agent.capabilities), `${agent.id} capabilities not array`).toBe(true);
      expect(Array.isArray(agent.permissions), `${agent.id} permissions not array`).toBe(true);
      expect(Array.isArray(agent.communicatesWith), `${agent.id} communicatesWith not array`).toBe(true);
    }
  });

  it("agent ids are unique", () => {
    const ids = AI_AGENT_DEFINITIONS.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ── 2. AI Kernel Registration ─────────────────────────────────────────────

describe("AI Kernel — full agent registration", () => {
  it("registers all milestone agents after boot", async () => {
    await aiKernel.boot();
    const components = aiKernel.listComponents();
    const ids = components.map((c) => c.id);

    const REQUIRED = ["bud", "spark", "oracle", "orbit", "lens", "the_artist", "architect",
      "learning_ai", "study_planner_ai", "career_ai", "wellness_ai",
      "recommendation_ai", "security_ai", "event_ai"];

    for (const id of REQUIRED) {
      expect(ids, `Kernel missing: ${id}`).toContain(id);
    }
  });

  it("exposes agentBus, contextManager, permissions, monitor via kernel", async () => {
    await aiKernel.boot();
    expect(aiKernel.agentBus).toBeDefined();
    expect(aiKernel.contextManager).toBeDefined();
    expect(aiKernel.permissions).toBeDefined();
    expect(aiKernel.monitor).toBeDefined();
  });
});

// ── 3. AgentBus ───────────────────────────────────────────────────────────

describe("AgentBus — AI-to-AI communication", () => {
  it("delivers a message to an exact-channel subscriber", () => {
    const received = [];
    const unsub = agentBus.subscribe("spark.bud", (msg) => received.push(msg));
    agentBus.send("spark", "bud", "result", { text: "hello" });
    unsub();
    expect(received).toHaveLength(1);
    expect(received[0].from).toBe("spark");
    expect(received[0].to).toBe("bud");
    expect(received[0].payload.text).toBe("hello");
  });

  it("delivers a message to a wildcard sender subscriber", () => {
    const received = [];
    const unsub = agentBus.subscribe("spark.*", (msg) => received.push(msg));
    agentBus.send("spark", "oracle", "event", { data: 1 });
    agentBus.send("spark", "bud", "event", { data: 2 });
    unsub();
    expect(received).toHaveLength(2);
  });

  it("delivers a message to the '#' catch-all subscriber", () => {
    const received = [];
    const unsub = agentBus.subscribe("#", (msg) => received.push(msg));
    agentBus.send("orbit", "spark", "request", { task: "schedule" });
    unsub();
    expect(received.some((m) => m.from === "orbit")).toBe(true);
  });

  it("broadcast() sends to '*' recipient", () => {
    const received = [];
    const unsub = agentBus.subscribe("#", (msg) => received.push(msg));
    agentBus.broadcast("oracle", "system.event", { note: "reboot" });
    unsub();
    const broadcast = received.find((m) => m.to === "*" && m.from === "oracle");
    expect(broadcast).toBeDefined();
  });

  it("history() returns recent messages filtered by from/to", () => {
    const msg1 = agentBus.send("memory_ai_test", "spark", "result", { data: "mem" });
    // Verify the message was created
    expect(msg1.from).toBe("memory_ai_test");
    expect(msg1.id).toBeTruthy();
    // Find in unfiltered history
    const all = agentBus.history({ limit: 100 });
    expect(all.some((m) => m.id === msg1.id)).toBe(true);
    // Filter by sender
    const filtered = agentBus.history({ from: "memory_ai_test", limit: 100 });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((m) => m.from === "memory_ai_test")).toBe(true);
  });

  it("request-reply resolves when reply arrives within timeout", async () => {
    // Subscribe to messages going from bud to spark (channel = "bud.spark")
    const unsub = agentBus.subscribe("bud.spark", (msg) => {
      if (msg.type === "request") {
        agentBus.reply(msg, { answer: "42" });
      }
    });
    const reply = await agentBus.request("bud", "spark", { question: "what?" }, 1000);
    unsub();
    expect(reply.payload.answer).toBe("42");
  });

  it("request-reply rejects after timeout", async () => {
    // No subscriber to reply — should timeout
    await expect(
      agentBus.request("bud", "never_replies", { q: "?" }, 50)
    ).rejects.toThrow(/timed out/);
  });
});

// ── 4. EventRouter ────────────────────────────────────────────────────────

describe("EventRouter — domain event routing", () => {
  it("is initialized with default routes", () => {
    expect(eventRouter.ready).toBe(true);
    const routes = eventRouter.listRoutes();
    expect(routes.length).toBeGreaterThan(0);
  });

  it("addRoute and removeRoute work correctly", () => {
    const before = eventRouter.listRoutes().length;
    eventRouter.addRoute({ pattern: "test.custom", agents: ["spark"], category: "test" });
    expect(eventRouter.listRoutes().length).toBe(before + 1);
    eventRouter.removeRoute("test.custom");
    expect(eventRouter.listRoutes().length).toBe(before);
  });

  it("routes events to registered agents via agentBus", () => {
    const received = [];
    const unsub = agentBus.subscribe("#", (msg) => {
      if (msg.payload?.event?.type === "workflow.started") received.push(msg);
    });

    // Publish via event bus — EventRouter should fan out to orbit and workflow_ai
    const { eventBus } = aiKernel;
    eventBus.publish({ type: "workflow.started", category: "workflow", payload: { jobId: "j1" } });

    unsub();
    // At least one routing delivery should have happened
    expect(received.length).toBeGreaterThan(0);
  });
});

// ── 5. AIContextManager ───────────────────────────────────────────────────

describe("AIContextManager — per-agent context", () => {
  beforeEach(() => {
    aiContextManager.clear("test_agent");
  });

  it("set() creates a context record", () => {
    const ctx = aiContextManager.set("test_agent", {
      userId: "u1",
      sessionId: "s1",
      locale: "en-NG",
    });
    expect(ctx.agentId).toBe("test_agent");
    expect(ctx.session.userId).toBe("u1");
    expect(ctx.session.locale).toBe("en-NG");
    expect(ctx.version).toBe(1);
  });

  it("update() merges fields and increments version", () => {
    aiContextManager.set("test_agent", { userId: "u1" });
    const updated = aiContextManager.update("test_agent", { locale: "fr-FR", userId: "u2" });
    expect(updated.session.locale).toBe("fr-FR");
    expect(updated.session.userId).toBe("u2");
    expect(updated.version).toBe(2);
  });

  it("addMemory() appends memory entries", () => {
    aiContextManager.set("test_agent", {});
    aiContextManager.addMemory("test_agent", [{ content: "mem1" }, { content: "mem2" }]);
    const ctx = aiContextManager.get("test_agent");
    expect(ctx.memory).toHaveLength(2);
  });

  it("addKnowledge() appends knowledge entries", () => {
    aiContextManager.set("test_agent", {});
    aiContextManager.addKnowledge("test_agent", [{ title: "k1", description: "desc1" }]);
    const ctx = aiContextManager.get("test_agent");
    expect(ctx.knowledge).toHaveLength(1);
  });

  it("toPromptString() produces a non-empty string", () => {
    aiContextManager.set("test_agent", { userId: "u1", locale: "en-NG", academic: "CS101" });
    aiContextManager.addMemory("test_agent", [{ content: "Studying algorithms" }]);
    aiContextManager.addKnowledge("test_agent", [{ title: "Algorithms", description: "Sorting" }]);
    const prompt = aiContextManager.toPromptString("test_agent");
    expect(typeof prompt).toBe("string");
    expect(prompt).toContain("en-NG");
    expect(prompt).toContain("CS101");
    expect(prompt).toContain("Studying algorithms");
    expect(prompt).toContain("Algorithms");
  });

  it("get() returns null for unknown agent", () => {
    expect(aiContextManager.get("nonexistent_agent")).toBeNull();
  });
});

// ── 6. AIPermissions ─────────────────────────────────────────────────────

describe("AIPermissions — per-agent permissions", () => {
  it("seeded agents have their declared permissions", () => {
    // bud has model:invoke
    const result = aiPermissions.check("bud", "model:invoke");
    expect(result.allowed).toBe(true);
  });

  it("denies undeclared permissions", () => {
    const result = aiPermissions.check("bud", "audit:delete");
    expect(result.allowed).toBe(false);
  });

  it("grant() adds runtime permission", () => {
    aiPermissions.grant("quiz_ai", "storage:write");
    expect(aiPermissions.check("quiz_ai", "storage:write").allowed).toBe(true);
    aiPermissions.revoke("quiz_ai", "storage:write");
  });

  it("revoke() removes runtime permission", () => {
    aiPermissions.grant("quiz_ai", "storage:write");
    aiPermissions.revoke("quiz_ai", "storage:write");
    expect(aiPermissions.check("quiz_ai", "storage:write").allowed).toBe(false);
  });

  it("grantSession() adds session-scoped permission", () => {
    // Use a permission NOT in flashcard_ai's definition (so global grant won't fire)
    aiPermissions.grantSession("flashcard_ai", "sess_1", "storage:write");
    expect(
      aiPermissions.check("flashcard_ai", "storage:write", { sessionId: "sess_1" }).allowed
    ).toBe(true);
    // Different session should not have it
    expect(
      aiPermissions.check("flashcard_ai", "storage:write", { sessionId: "sess_other" }).allowed
    ).toBe(false);
  });

  it("clearSession() removes all session grants", () => {
    aiPermissions.grantSession("flashcard_ai", "sess_2", "storage:write");
    aiPermissions.clearSession("sess_2");
    expect(
      aiPermissions.check("flashcard_ai", "storage:write", { sessionId: "sess_2" }).allowed
    ).toBe(false);
  });

  it("assert() throws on denied permission", () => {
    expect(() => aiPermissions.assert("bud", "audit:delete")).toThrow(/Permission denied/);
  });

  it("list() returns all granted permissions for an agent", () => {
    const perms = aiPermissions.list("spark");
    expect(Array.isArray(perms)).toBe(true);
    expect(perms.length).toBeGreaterThan(0);
  });
});

// ── 7. AIMonitor ─────────────────────────────────────────────────────────

describe("AIMonitor — agent health monitoring", () => {
  beforeEach(() => {
    aiMonitor.reset("test_monitor_agent");
  });

  it("returns unknown health for a new agent", () => {
    const h = aiMonitor.health("test_monitor_agent");
    expect(h.status).toBe("unknown");
    expect(h.invocations).toBe(0);
  });

  it("recordSuccess() transitions to healthy", () => {
    for (let i = 0; i < 5; i++) aiMonitor.recordSuccess("test_monitor_agent", 10);
    const h = aiMonitor.health("test_monitor_agent");
    expect(h.status).toBe("healthy");
    expect(h.invocations).toBe(5);
    expect(h.errorRate).toBe(0);
  });

  it("recordError() increments error count and tracks last error", () => {
    aiMonitor.recordError("test_monitor_agent", "connection failed", 50);
    const h = aiMonitor.health("test_monitor_agent");
    expect(h.errors).toBe(1);
    expect(h.lastError).toBe("connection failed");
  });

  it("high error rate transitions to unhealthy", () => {
    for (let i = 0; i < 100; i++) aiMonitor.recordError("test_monitor_agent", "err", 5);
    const h = aiMonitor.health("test_monitor_agent");
    expect(h.status).toBe("unhealthy");
    expect(h.errorRate).toBeGreaterThanOrEqual(0.9);
  });

  it("mixed results produce degraded status around 50% error rate", () => {
    aiMonitor.reset("test_monitor_agent");
    for (let i = 0; i < 60; i++) aiMonitor.recordError("test_monitor_agent", "e", 0);
    for (let i = 0; i < 40; i++) aiMonitor.recordSuccess("test_monitor_agent", 0);
    const h = aiMonitor.health("test_monitor_agent");
    expect(["degraded", "unhealthy"]).toContain(h.status);
  });

  it("listHealth() returns entries for all monitored agents", () => {
    aiMonitor.recordSuccess("spark", 10);
    const list = aiMonitor.listHealth();
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((e) => e.agentId === "spark")).toBe(true);
  });

  it("latency metrics are tracked correctly", () => {
    aiMonitor.recordSuccess("test_monitor_agent", 100);
    aiMonitor.recordSuccess("test_monitor_agent", 200);
    const h = aiMonitor.health("test_monitor_agent");
    expect(h.latency.min).toBe(100);
    expect(h.latency.max).toBe(200);
    expect(h.latency.avg).toBe(150);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { getQuickActions, getGlobalActions, getDestinationActions } from "@/lib/navigation/quickActions";
import { clearAnalyticsData } from "@/lib/navigation/navigationAnalyticsStore";

class LocalStorageShim {
  constructor() { this._store = {}; }
  getItem(k) { return this._store[k] ?? null; }
  setItem(k, v) { this._store[k] = v; }
  removeItem(k) { delete this._store[k]; }
}

beforeEach(() => {
  global.localStorage = new LocalStorageShim();
  clearAnalyticsData();
});

describe("Quick Actions", () => {
  describe("getGlobalActions", () => {
    it("returns global actions including Ask Bud", () => {
      const actions = getGlobalActions();
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.find((a) => a.id === "ask-bud")).toBeDefined();
    });
  });

  describe("getDestinationActions", () => {
    it("returns actions for quad", () => {
      const actions = getDestinationActions("quad");
      expect(actions.length).toBeGreaterThan(0);
    });

    it("returns empty array for unknown destination", () => {
      expect(getDestinationActions("unknown")).toHaveLength(0);
    });
  });

  describe("getQuickActions", () => {
    it("includes global actions (Ask Bud, Voice)", () => {
      const actions = getQuickActions({ destinationId: "square", pathname: "/square" });
      const ids = actions.map((a) => a.id);
      expect(ids).toContain("ask-bud");
      expect(ids).toContain("voice");
    });

    it("respects maxActions limit", () => {
      const actions = getQuickActions({ destinationId: "quad", pathname: "/courses", maxActions: 3 });
      expect(actions.length).toBeLessThanOrEqual(3);
    });

    it("Bud actions are boosted above regular destination actions when provided", () => {
      const budAction = { id: "bud-custom", label: "Study Now", icon: "Sparkles", path: "/study", category: "ai", priority: 60 };
      const actions = getQuickActions({
        destinationId: "quad",
        pathname: "/quad",
        budActions: [budAction],
        maxActions: 10,
      });
      const budIdx = actions.findIndex((a) => a.id === "bud-custom");
      // Bud custom action (60+20=80) should appear before low-priority destination actions (priority<70)
      const lowPriorityIdx = actions.findIndex((a) => (a.priority || 0) < 70 && a.id !== "bud-custom");
      if (lowPriorityIdx >= 0) {
        expect(budIdx).toBeLessThan(lowPriorityIdx);
      } else {
        expect(budIdx).toBeGreaterThanOrEqual(0);
      }
    });

    it("de-duplicates actions with the same id", () => {
      const actions = getQuickActions({ destinationId: "me", pathname: "/me" });
      const ids = actions.map((a) => a.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it("every action has required fields", () => {
      const actions = getQuickActions({ destinationId: "connect", pathname: "/connect" });
      for (const a of actions) {
        expect(a.id).toBeTruthy();
        expect(a.label).toBeTruthy();
        expect(a.icon).toBeTruthy();
        expect(a.category).toBeTruthy();
      }
    });
  });
});

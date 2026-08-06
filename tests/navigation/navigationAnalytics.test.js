import { describe, it, expect, beforeEach } from "vitest";
import {
  recordTabVisit,
  recordRouteVisit,
  getAnalyticsData,
  clearAnalyticsData,
  getNavEvents,
} from "@/lib/navigation/navigationAnalyticsStore";

class LocalStorageShim {
  constructor() { this._store = {}; }
  getItem(k) { return this._store[k] ?? null; }
  setItem(k, v) { this._store[k] = v; }
  removeItem(k) { delete this._store[k]; }
  clear() { this._store = {}; }
}

beforeEach(() => {
  global.localStorage = new LocalStorageShim();
  clearAnalyticsData();
});

describe("Navigation Analytics", () => {
  describe("recordTabVisit", () => {
    it("increments visitCount for a tab", () => {
      recordTabVisit("square");
      recordTabVisit("square");
      const data = getAnalyticsData();
      expect(data.square.visitCount).toBe(2);
    });

    it("records lastVisit timestamp", () => {
      const before = Date.now();
      recordTabVisit("quad");
      const after = Date.now();
      const data = getAnalyticsData();
      expect(data.quad.lastVisit).toBeGreaterThanOrEqual(before);
      expect(data.quad.lastVisit).toBeLessThanOrEqual(after);
    });

    it("is a no-op for empty tabId", () => {
      recordTabVisit("");
      expect(getAnalyticsData()).toEqual({});
    });

    it("emits a nav.tab_switch event", () => {
      recordTabVisit("connect");
      const events = getNavEvents();
      expect(events.some((e) => e.type === "nav.tab_switch" && e.tabId === "connect")).toBe(true);
    });
  });

  describe("recordRouteVisit", () => {
    it("increments count for a sub-route", () => {
      recordRouteVisit("quad", "/courses");
      recordRouteVisit("quad", "/courses");
      const data = getAnalyticsData();
      expect(data.quad.subRoutes["/courses"].count).toBe(2);
    });

    it("tracks multiple sub-routes independently", () => {
      recordRouteVisit("square", "/communities");
      recordRouteVisit("square", "/marketplace");
      const data = getAnalyticsData();
      expect(data.square.subRoutes["/communities"].count).toBe(1);
      expect(data.square.subRoutes["/marketplace"].count).toBe(1);
    });

    it("emits a nav.route_visit event", () => {
      recordRouteVisit("me", "/settings");
      const events = getNavEvents();
      expect(events.some((e) => e.type === "nav.route_visit" && e.pathname === "/settings")).toBe(true);
    });
  });

  describe("clearAnalyticsData", () => {
    it("removes all data", () => {
      recordTabVisit("square");
      clearAnalyticsData();
      expect(getAnalyticsData()).toEqual({});
      expect(getNavEvents()).toEqual([]);
    });
  });
});

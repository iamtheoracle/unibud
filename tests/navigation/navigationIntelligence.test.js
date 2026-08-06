import { describe, it, expect, beforeEach } from "vitest";
import {
  getPersonalizedOrder,
  getRankedDestinations,
  getTopRoutes,
  hasVisited,
} from "@/lib/navigation/navigationIntelligence";
import { recordTabVisit, recordRouteVisit, clearAnalyticsData } from "@/lib/navigation/navigationAnalyticsStore";

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

describe("Navigation Intelligence", () => {
  describe("getPersonalizedOrder", () => {
    it("returns empty array when no data for destination", () => {
      expect(getPersonalizedOrder("square")).toEqual([]);
    });

    it("ranks more-visited routes higher", () => {
      recordRouteVisit("quad", "/courses");
      recordRouteVisit("quad", "/courses");
      recordRouteVisit("quad", "/courses");
      recordRouteVisit("quad", "/assignments");

      const order = getPersonalizedOrder("quad");
      expect(order[0]).toBe("/courses");
      expect(order[1]).toBe("/assignments");
    });
  });

  describe("getRankedDestinations", () => {
    it("returns all four destinations", () => {
      const ranked = getRankedDestinations();
      expect(ranked).toHaveLength(4);
    });

    it("puts more-visited destination first", () => {
      recordTabVisit("connect");
      recordTabVisit("connect");
      recordTabVisit("connect");
      recordTabVisit("square");

      const ranked = getRankedDestinations();
      expect(ranked[0].id).toBe("connect");
    });

    it("includes a score property", () => {
      const ranked = getRankedDestinations();
      for (const d of ranked) {
        expect(typeof d.score).toBe("number");
      }
    });
  });

  describe("getTopRoutes", () => {
    it("returns at most n routes", () => {
      recordRouteVisit("square", "/communities");
      recordRouteVisit("quad", "/courses");
      const top = getTopRoutes(1);
      expect(top.length).toBeLessThanOrEqual(1);
    });

    it("returns routes with path and score", () => {
      recordRouteVisit("me", "/settings");
      const top = getTopRoutes(10);
      for (const item of top) {
        expect(item.path).toBeTruthy();
        expect(typeof item.score).toBe("number");
      }
    });
  });

  describe("hasVisited", () => {
    it("returns false for unvisited destination", () => {
      expect(hasVisited("connect")).toBe(false);
    });

    it("returns true after visiting", () => {
      recordTabVisit("connect");
      expect(hasVisited("connect")).toBe(true);
    });
  });
});

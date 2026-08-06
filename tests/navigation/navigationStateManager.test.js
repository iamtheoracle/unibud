import { describe, it, expect, beforeEach } from "vitest";
import {
  recordNavigation,
  recordScrollPosition,
  getLastPath,
  getSavedScrollY,
  getBackStack,
  popBackStack,
  clearNavState,
  getNavStateSnapshot,
} from "@/lib/navigation/navigationStateManager";

// Vitest runs in Node — localStorage is not available by default.
// We shim it before each test so the module can read/write state.
class LocalStorageShim {
  constructor() { this._store = {}; }
  getItem(k) { return this._store[k] ?? null; }
  setItem(k, v) { this._store[k] = v; }
  removeItem(k) { delete this._store[k]; }
  clear() { this._store = {}; }
}

beforeEach(() => {
  const shim = new LocalStorageShim();
  global.localStorage = shim;
  clearNavState(); // start each test clean
});

describe("Navigation State Manager", () => {
  describe("recordNavigation", () => {
    it("records the last path for a destination", () => {
      recordNavigation("square", "/communities");
      expect(getLastPath("square", "/square")).toBe("/communities");
    });

    it("ignores empty destination or path", () => {
      recordNavigation("", "/foo");
      recordNavigation("square", "");
      expect(getLastPath("square", "/square")).toBe("/square");
    });

    it("builds a back stack as user navigates deeper", () => {
      recordNavigation("square", "/communities");
      recordNavigation("square", "/community/abc");
      recordNavigation("square", "/community/abc/events");

      const stack = getBackStack("square");
      expect(stack).toContain("/communities");
      expect(stack).toContain("/community/abc");
    });

    it("does not add duplicate to back stack when path unchanged", () => {
      recordNavigation("quad", "/courses");
      recordNavigation("quad", "/courses");
      const stack = getBackStack("quad");
      // Stack should not have /courses pushed twice
      expect(stack.filter((p) => p === "/courses")).toHaveLength(0);
    });
  });

  describe("recordScrollPosition", () => {
    it("updates scroll position for existing tab state", () => {
      recordNavigation("me", "/settings");
      recordScrollPosition("me", 320);
      expect(getSavedScrollY("me")).toBe(320);
    });

    it("is a no-op when tab has no state yet", () => {
      recordScrollPosition("connect", 100); // no prior navigation
      expect(getSavedScrollY("connect")).toBe(0);
    });
  });

  describe("getLastPath", () => {
    it("returns fallback when no state exists", () => {
      expect(getLastPath("unknown", "/fallback")).toBe("/fallback");
    });

    it("returns the recorded path", () => {
      recordNavigation("connect", "/messages");
      expect(getLastPath("connect", "/connect")).toBe("/messages");
    });
  });

  describe("popBackStack", () => {
    it("pops and returns the most recent previous path", () => {
      recordNavigation("quad", "/courses");
      recordNavigation("quad", "/course/abc");
      const back = popBackStack("quad");
      expect(back).toBe("/courses");
    });

    it("returns null when back stack is empty", () => {
      expect(popBackStack("square")).toBeNull();
    });

    it("removes the popped entry from the stack", () => {
      recordNavigation("quad", "/courses");
      recordNavigation("quad", "/course/abc");
      popBackStack("quad");
      const remaining = getBackStack("quad");
      expect(remaining).toHaveLength(0);
    });
  });

  describe("clearNavState", () => {
    it("clears state for a specific destination", () => {
      recordNavigation("me", "/settings");
      clearNavState("me");
      expect(getLastPath("me", "/me")).toBe("/me");
    });

    it("clears all state when no destination provided", () => {
      recordNavigation("square", "/communities");
      recordNavigation("quad", "/courses");
      clearNavState();
      const snap = getNavStateSnapshot();
      expect(Object.keys(snap)).toHaveLength(0);
    });
  });

  describe("getNavStateSnapshot", () => {
    it("returns a snapshot of all recorded state", () => {
      recordNavigation("connect", "/messages");
      const snap = getNavStateSnapshot();
      expect(snap.connect).toBeDefined();
      expect(snap.connect.lastPath).toBe("/messages");
    });
  });
});

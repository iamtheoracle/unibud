import { describe, it, expect } from "vitest";
import {
  PRIMARY_DESTINATIONS,
  getDestination,
  getDestinationByRoute,
  getPrimaryTabs,
  BUD_ACCESS_POINTS,
} from "@/lib/navigation/registry";

describe("Navigation Registry", () => {
  it("exports exactly four primary destinations", () => {
    expect(PRIMARY_DESTINATIONS).toHaveLength(4);
  });

  it("destinations are: square, quad, connect, me", () => {
    const ids = PRIMARY_DESTINATIONS.map((d) => d.id);
    expect(ids).toEqual(["square", "quad", "connect", "me"]);
  });

  it("every destination has required fields", () => {
    for (const dest of PRIMARY_DESTINATIONS) {
      expect(dest.id, `${dest.id} missing id`).toBeTruthy();
      expect(dest.label, `${dest.id} missing label`).toBeTruthy();
      expect(dest.to, `${dest.id} missing to`).toBeTruthy();
      expect(dest.icon, `${dest.id} missing icon`).toBeTruthy();
      expect(Array.isArray(dest.subRoutes), `${dest.id} subRoutes must be array`).toBe(true);
    }
  });

  it("Bud is NOT a destination", () => {
    const ids = PRIMARY_DESTINATIONS.map((d) => d.id);
    expect(ids).not.toContain("bud");
  });

  it("getDestination('square') returns the square destination", () => {
    const dest = getDestination("square");
    expect(dest).toBeDefined();
    expect(dest.to).toBe("/square");
  });

  it("getDestination with unknown id returns undefined", () => {
    expect(getDestination("nonexistent")).toBeUndefined();
  });

  it("getPrimaryTabs returns 4 tabs with correct shape", () => {
    const tabs = getPrimaryTabs();
    expect(tabs).toHaveLength(4);
    for (const tab of tabs) {
      expect(tab.id).toBeTruthy();
      expect(tab.label).toBeTruthy();
      expect(tab.to).toBeTruthy();
      expect(tab.icon).toBeTruthy();
    }
  });

  describe("getDestinationByRoute", () => {
    it("resolves /square to square", () => {
      expect(getDestinationByRoute("/square")?.id).toBe("square");
    });

    it("resolves /quad to quad", () => {
      expect(getDestinationByRoute("/quad")?.id).toBe("quad");
    });

    it("resolves /connect to connect", () => {
      expect(getDestinationByRoute("/connect")?.id).toBe("connect");
    });

    it("resolves /me to me", () => {
      expect(getDestinationByRoute("/me")?.id).toBe("me");
    });

    it("resolves /campus (sub-route) to quad", () => {
      expect(getDestinationByRoute("/campus")?.id).toBe("quad");
    });

    it("resolves /academics/results to quad", () => {
      expect(getDestinationByRoute("/academics/results")?.id).toBe("quad");
    });

    it("resolves /messages to connect", () => {
      expect(getDestinationByRoute("/messages")?.id).toBe("connect");
    });

    it("resolves /settings to me", () => {
      expect(getDestinationByRoute("/settings")?.id).toBe("me");
    });

    it("resolves /home (Bud Home) to me", () => {
      expect(getDestinationByRoute("/home")?.id).toBe("me");
    });

    it("returns null for auth routes", () => {
      expect(getDestinationByRoute("/login")).toBeNull();
      expect(getDestinationByRoute("/register")).toBeNull();
    });

    it("returns null for unknown routes", () => {
      expect(getDestinationByRoute("/totally-unknown-page-xyz")).toBeNull();
    });
  });

  it("BUD_ACCESS_POINTS includes me and command-bar", () => {
    expect(BUD_ACCESS_POINTS).toContain("me");
    expect(BUD_ACCESS_POINTS).toContain("command-bar");
  });
});

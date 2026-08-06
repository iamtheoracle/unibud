import { describe, it, expect } from "vitest";
import {
  ROUTE_REGISTRY,
  getRouteByPath,
  resolveRoute,
  getDeepLinkableRoutes,
  getRoutesByDestination,
} from "@/lib/navigation/routeRegistry";

describe("Route Registry", () => {
  it("has entries for all four primary destinations", () => {
    const destinations = new Set(ROUTE_REGISTRY.filter((r) => r.destination).map((r) => r.destination));
    expect(destinations.has("square")).toBe(true);
    expect(destinations.has("quad")).toBe(true);
    expect(destinations.has("connect")).toBe(true);
    expect(destinations.has("me")).toBe(true);
  });

  it("every route has required fields", () => {
    for (const route of ROUTE_REGISTRY) {
      expect(typeof route.path).toBe("string");
      expect(typeof route.title).toBe("string");
      expect(Array.isArray(route.breadcrumb)).toBe(true);
      expect(typeof route.deepLinkable).toBe("boolean");
      expect(typeof route.authRequired).toBe("boolean");
    }
  });

  it("deep-linkable routes all have a deepLink pattern", () => {
    const linkable = ROUTE_REGISTRY.filter((r) => r.deepLinkable);
    for (const route of linkable) {
      expect(route.deepLink, `${route.path} is deepLinkable but has no deepLink`).toBeTruthy();
    }
  });

  describe("getRouteByPath", () => {
    it("finds /square", () => {
      const r = getRouteByPath("/square");
      expect(r).toBeDefined();
      expect(r.title).toBe("Square");
    });

    it("finds parameterized pattern /course/:courseId", () => {
      const r = getRouteByPath("/course/:courseId");
      expect(r).toBeDefined();
      expect(r.destination).toBe("quad");
    });

    it("returns null for unknown path", () => {
      expect(getRouteByPath("/totally-unknown")).toBeNull();
    });
  });

  describe("resolveRoute", () => {
    it("resolves exact path /me", () => {
      const r = resolveRoute("/me");
      expect(r?.title).toBe("Me");
    });

    it("resolves parameterized path /course/abc-123", () => {
      const r = resolveRoute("/course/abc-123");
      expect(r).toBeDefined();
      expect(r.destination).toBe("quad");
    });

    it("resolves /messages/conv-456", () => {
      const r = resolveRoute("/messages/conv-456");
      expect(r).toBeDefined();
      expect(r.destination).toBe("connect");
    });

    it("resolves /community/my-community", () => {
      const r = resolveRoute("/community/my-community");
      expect(r).toBeDefined();
      expect(r.destination).toBe("square");
    });

    it("resolves /exam/start/paper-1", () => {
      const r = resolveRoute("/exam/start/paper-1");
      expect(r).toBeDefined();
      expect(r.destination).toBe("quad");
    });
  });

  describe("getDeepLinkableRoutes", () => {
    it("returns only routes with deepLinkable=true", () => {
      const linkable = getDeepLinkableRoutes();
      expect(linkable.length).toBeGreaterThan(0);
      for (const r of linkable) {
        expect(r.deepLinkable).toBe(true);
        expect(r.deepLink).toBeTruthy();
      }
    });

    it("includes all four destination roots", () => {
      const linkable = getDeepLinkableRoutes().map((r) => r.path);
      expect(linkable).toContain("/square");
      expect(linkable).toContain("/quad");
      expect(linkable).toContain("/connect");
      expect(linkable).toContain("/me");
    });
  });

  describe("getRoutesByDestination", () => {
    it("returns routes for quad", () => {
      const routes = getRoutesByDestination("quad");
      expect(routes.length).toBeGreaterThan(0);
      for (const r of routes) {
        expect(r.destination).toBe("quad");
      }
    });

    it("returns empty array for unknown destination", () => {
      expect(getRoutesByDestination("unknown")).toHaveLength(0);
    });
  });

  it("no two routes share the same path pattern", () => {
    const paths = ROUTE_REGISTRY.map((r) => r.path);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });
});

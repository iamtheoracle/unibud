import { describe, it, expect } from "vitest";
import {
  DEEP_LINK_ENTITIES,
  getDeepLinkEntity,
  buildDeepLink,
  buildSchemeDeepLink,
  parseSchemeDeepLink,
  generateOGMeta,
} from "@/lib/navigation/deepLinkRegistry";

describe("Deep Link Registry", () => {
  it("exports a non-empty list of entities", () => {
    expect(DEEP_LINK_ENTITIES.length).toBeGreaterThan(0);
  });

  it("every entity has required fields", () => {
    for (const entity of DEEP_LINK_ENTITIES) {
      expect(entity.type, "missing type").toBeTruthy();
      expect(entity.pattern, "missing pattern").toBeTruthy();
      expect(entity.scheme, "missing scheme").toBeTruthy();
      expect(entity.title, "missing title").toBeTruthy();
      expect(typeof entity.ogTitle, "ogTitle must be function").toBe("function");
      expect(typeof entity.ogDescription, "ogDescription must be function").toBe("function");
    }
  });

  it("no duplicate entity types", () => {
    const types = DEEP_LINK_ENTITIES.map((e) => e.type);
    const unique = new Set(types);
    expect(unique.size).toBe(types.length);
  });

  describe("getDeepLinkEntity", () => {
    it("finds course entity", () => {
      const e = getDeepLinkEntity("course");
      expect(e).toBeDefined();
      expect(e.pattern).toBe("/course/:courseId");
    });

    it("returns undefined for unknown type", () => {
      expect(getDeepLinkEntity("totally-unknown")).toBeUndefined();
    });
  });

  describe("buildDeepLink", () => {
    it("builds /course/abc-123", () => {
      expect(buildDeepLink("course", { courseId: "abc-123" })).toBe("/course/abc-123");
    });

    it("builds /community/my-comm", () => {
      expect(buildDeepLink("community", { communityId: "my-comm" })).toBe("/community/my-comm");
    });

    it("returns null for unknown type", () => {
      expect(buildDeepLink("unknown", {})).toBeNull();
    });

    it("URL-encodes special characters in params", () => {
      const link = buildDeepLink("community", { communityId: "hello world" });
      expect(link).toBe("/community/hello%20world");
    });
  });

  describe("buildSchemeDeepLink", () => {
    it("builds unibud://course/abc", () => {
      expect(buildSchemeDeepLink("course", { courseId: "abc" })).toBe("unibud://course/abc");
    });

    it("returns null for unknown type", () => {
      expect(buildSchemeDeepLink("unknown", {})).toBeNull();
    });
  });

  describe("parseSchemeDeepLink", () => {
    it("parses unibud://course/abc to /course/abc", () => {
      expect(parseSchemeDeepLink("unibud://course/abc")).toBe("/course/abc");
    });

    it("parses unibud://me to /me", () => {
      expect(parseSchemeDeepLink("unibud://me")).toBe("/me");
    });

    it("returns null for non-unibud scheme", () => {
      expect(parseSchemeDeepLink("https://example.com/course/abc")).toBeNull();
    });

    it("returns null for empty input", () => {
      expect(parseSchemeDeepLink("")).toBeNull();
      expect(parseSchemeDeepLink(null)).toBeNull();
    });
  });

  describe("generateOGMeta", () => {
    it("generates metadata for a course", () => {
      const og = generateOGMeta("course", { courseId: "cs101" }, { title: "CS 101", description: "Intro to CS" });
      expect(og.title).toContain("CS 101");
      expect(og.description).toContain("Intro to CS");
      expect(og.url).toContain("/course/cs101");
      expect(og.siteName).toBe("UNIBUD");
    });

    it("returns null for unknown type", () => {
      expect(generateOGMeta("unknown", {}, {})).toBeNull();
    });
  });

  it("covers all major entity types", () => {
    const types = DEEP_LINK_ENTITIES.map((e) => e.type);
    const required = ["profile", "community", "course", "study-group", "exam", "conversation", "podcast", "mentor", "event", "marketplace-item"];
    for (const t of required) {
      expect(types, `Missing entity type: ${t}`).toContain(t);
    }
  });
});

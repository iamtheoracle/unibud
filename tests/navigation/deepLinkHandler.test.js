import { describe, it, expect } from "vitest";
import { resolveDeepLink, isDeepLink } from "@/lib/navigation/deepLinkHandler";

describe("Deep Link Handler", () => {
  describe("resolveDeepLink", () => {
    it("returns web path unchanged", () => {
      expect(resolveDeepLink("/course/abc")).toBe("/course/abc");
    });

    it("converts unibud:// scheme to web path", () => {
      expect(resolveDeepLink("unibud://course/abc")).toBe("/course/abc");
    });

    it("extracts path from full web URL", () => {
      expect(resolveDeepLink("https://app.unibud.com/course/abc")).toBe("/course/abc");
    });

    it("extracts path from unibud.com URL", () => {
      expect(resolveDeepLink("https://unibud.com/me")).toBe("/me");
    });

    it("returns null for null input", () => {
      expect(resolveDeepLink(null)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(resolveDeepLink("")).toBeNull();
    });

    it("returns null for external URL", () => {
      expect(resolveDeepLink("https://google.com/course/abc")).toBeNull();
    });
  });

  describe("isDeepLink", () => {
    it("returns true for a known route", () => {
      expect(isDeepLink("/square")).toBe(true);
    });

    it("returns true for a unibud:// scheme URL", () => {
      expect(isDeepLink("unibud://me")).toBe(true);
    });

    it("returns false for an unknown route", () => {
      expect(isDeepLink("/totally-unknown-xyz")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isDeepLink(null)).toBe(false);
    });
  });
});

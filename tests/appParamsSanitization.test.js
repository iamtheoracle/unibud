import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isSafeInternalPath, sanitizeParam } from "@/lib/app-params";

describe("app parameter sanitization", () => {
  const previousWindow = global.window;

  beforeEach(() => {
    global.window = { location: { origin: "https://unibud.test" } };
  });

  afterEach(() => {
    global.window = previousWindow;
  });

  it("accepts only safe internal paths", () => {
    expect(isSafeInternalPath("/home")).toBe(true);
    expect(isSafeInternalPath("//evil.com")).toBe(false);
    expect(isSafeInternalPath("/\\evil")).toBe(false);
  });

  it("rejects unsafe token and redirect parameter values", () => {
    expect(sanitizeParam("access_token", "javascript:alert(1)")).toBeNull();
    expect(sanitizeParam("from_url", "https://evil.example/phish")).toBeNull();
    expect(sanitizeParam("from_url", "/home?tab=1")).toBe("/home?tab=1");
  });

  it("allows only http/https app base URLs", () => {
    expect(sanitizeParam("app_base_url", "javascript:alert(1)")).toBeNull();
    expect(sanitizeParam("app_base_url", "https://app.base44.app/demo/")).toBe("https://app.base44.app/demo");
  });
});

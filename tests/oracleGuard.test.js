import { describe, expect, it } from "vitest";
import { isAuthorizedFor } from "@/lib/auth/oracleGuard";

describe("oracle route authorization guard", () => {
  it("authorizes exact and nested protected workspace routes only", () => {
    expect(isAuthorizedFor("/oracle", "student")).toBe(false);
    expect(isAuthorizedFor("/oracle/tools", "student")).toBe(false);
    expect(isAuthorizedFor("/oracle", "platform_admin")).toBe(true);
  });

  it("does not over-match similar route prefixes", () => {
    expect(isAuthorizedFor("/oracle-landing", "student")).toBe(true);
    expect(isAuthorizedFor("/operator-console", "student")).toBe(true);
  });
});

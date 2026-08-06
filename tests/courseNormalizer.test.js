import { describe, it, expect } from "vitest";
import { normalizeCourse } from "@/lib/academics/courseNormalizer";

describe("courseNormalizer — normalizeCourse", () => {
  it("returns a null result for empty input", () => {
    const r = normalizeCourse("");
    expect(r.matched).toBe(false);
    expect(r.normalized).toBeNull();
    expect(r.confidence).toBe(0);
  });

  it("resolves exact aliases with full confidence and preserves original", () => {
    const cases = [
      ["Computer sci", "Computer Science"],
      ["Comp Sci", "Computer Science"],
      ["CS", "Computer Science"],
      ["Civil Eng", "Civil Engineering"],
      ["Mass Comm", "Mass Communication"],
      ["Econs", "Economics"],
      ["Info Tech", "Information Technology"],
      ["MBBS", "Medicine & Surgery"],
    ];
    for (const [input, canonical] of cases) {
      const r = normalizeCourse(input);
      expect(r.original, `original for "${input}"`).toBe(input);
      expect(r.matched, `matched for "${input}"`).toBe(true);
      expect(r.normalized, `normalized for "${input}"`).toBe(canonical);
      expect(r.confidence).toBe(1);
    }
  });

  it("is case- and punctuation-insensitive", () => {
    expect(normalizeCourse("comp-sci!").normalized).toBe("Computer Science");
    expect(normalizeCourse("  MaSs   CoMm ").normalized).toBe("Mass Communication");
  });

  it("matches an exact canonical name even without an alias", () => {
    const r = normalizeCourse("Computer Science");
    expect(r.matched).toBe(true);
    expect(r.normalized).toBe("Computer Science");
    expect(r.confidence).toBe(1);
  });

  it("returns suggestions for moderate-confidence input without forcing a match", () => {
    const r = normalizeCourse("eng");
    expect(r.matched).toBe(false);
    expect(r.normalized).toBeNull();
    expect(Array.isArray(r.suggestions)).toBe(true);
  });

  it("falls back to no-match for gibberish", () => {
    const r = normalizeCourse("zzzzqqqqx");
    expect(r.matched).toBe(false);
    expect(r.normalized).toBeNull();
    expect(r.suggestions).toEqual([]);
    expect(r.confidence).toBe(0);
  });
});
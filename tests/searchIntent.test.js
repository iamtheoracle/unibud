import { describe, it, expect } from "vitest";
import { resolveSearchIntent } from "@/lib/intelligence/searchIntent";

describe("searchIntent — resolveSearchIntent", () => {
  it("returns an empty interpretation list for blank queries", () => {
    const r = resolveSearchIntent("");
    expect(r.interpretations).toEqual([]);
  });

  it("resolves a university abbreviation", () => {
    const r = resolveSearchIntent("UNIBEN");
    const uni = r.interpretations.find((i) => i.domain === "university");
    expect(uni).toBeDefined();
    expect(uni.canonical.toLowerCase()).toContain("benin");
    expect(uni.route).toBe("/onboarding/university");
    expect(uni.confidence).toBeGreaterThan(0.8);
  });

  it("resolves a course alias to the course domain", () => {
    const r = resolveSearchIntent("Comp Sci");
    const course = r.interpretations.find((i) => i.domain === "course");
    expect(course).toBeDefined();
    expect(course.canonical).toBe("Computer Science");
    expect(course.route).toBe("/courses");
  });

  it("resolves a content category synonym", () => {
    const r = resolveSearchIntent("scholarships");
    const cat = r.interpretations.find((i) => i.domain === "category");
    expect(cat).toBeDefined();
    expect(cat.canonical).toBe("Scholarships");
    expect(cat.route).toBe("/scholarships");
  });

  it("resolves 'jobs' to Career Opportunities", () => {
    const r = resolveSearchIntent("jobs");
    const cat = r.interpretations.find((i) => i.domain === "category");
    expect(cat.canonical).toBe("Career Opportunities");
    expect(cat.route).toBe("/career");
  });

  it("falls back to a neutral 'Search UNIBUD' interpretation for unknown queries", () => {
    const r = resolveSearchIntent("xyzqwr totally unknown");
    expect(r.interpretations.length).toBe(1);
    expect(r.interpretations[0].domain).toBe("all");
    expect(r.interpretations[0].route).toBe("/discover");
  });

  it("sorts interpretations by descending confidence", () => {
    const r = resolveSearchIntent("UNIBEN");
    const confs = r.interpretations.map((i) => i.confidence);
    const sorted = [...confs].sort((a, b) => b - a);
    expect(confs).toEqual(sorted);
  });
});
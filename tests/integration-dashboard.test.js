import { describe, it, expect } from "vitest";
import { orchestrateHome, buildAdaptiveGreeting } from "@/lib/aee/aeeEngine";

/**
 * Integration: Home dashboard assembly.
 * The orchestrator must produce a deterministic, prioritised widget order and
 * a context-appropriate Bud message for every context we feed it.
 */
describe("integration — Home dashboard assembly", () => {
  it("returns a prioritised order containing all nine widgets for a baseline morning", () => {
    const out = orchestrateHome({ timeOfDay: "morning" });
    expect(out.order.length).toBe(9);
    expect(out.order).toContain("today");
    expect(out.mode).toBe("Morning Start");
    expect(out.message).toBeTruthy();
    expect(out.greeting).toBeTruthy();
  });

  it("promotes deadlines above today during a due-today context", () => {
    const out = orchestrateHome({ timeOfDay: "afternoon", dueToday: 2 });
    expect(out.mode).toBe("Deadline Focus");
    expect(out.order.indexOf("deadlines")).toBeLessThanOrEqual(2);
  });

  it("switches to Exam Week mode and elevates deadlines + bud", () => {
    const out = orchestrateHome({ timeOfDay: "morning", examWeek: true, nextExamDays: 3 });
    expect(out.mode).toBe("Exam Week");
    expect(out.message).toContain("3 days");
    expect(out.scores.deadlines).toBeGreaterThan(out.scores.community);
    expect(out.scores.bud).toBeGreaterThan(out.scores.community);
  });

  it("raises payments when fees are overdue", () => {
    const out = orchestrateHome({ timeOfDay: "morning", overdueFees: 1 });
    expect(out.mode).toBe("Fees Due");
    expect(out.scores.payments).toBeGreaterThan(40);
  });

  it("uses a weekend mode when isWeekend and not exam week", () => {
    const out = orchestrateHome({ timeOfDay: "afternoon", isWeekend: true });
    expect(out.mode).toBe("Weekend");
  });

  it("surfaces a lecture-soon message when nextLectureIn <= 30 minutes", () => {
    const out = orchestrateHome({ timeOfDay: "morning", nextLectureIn: 15 });
    expect(out.message).toContain("15 minutes");
  });

  it("buildAdaptiveGreeting never falls back to an email username", () => {
    const g = buildAdaptiveGreeting({ user: { email: "jdoe@gmail.com", full_name: "Jane Doe" } });
    expect(g.text).toContain("Jane");
    expect(g.text).not.toContain("jdoe");
  });

  it("buildAdaptiveGreeting falls back to 'there' for an anonymous user", () => {
    const g = buildAdaptiveGreeting({ user: null });
    expect(g.text.endsWith(", there")).toBe(true);
  });
});
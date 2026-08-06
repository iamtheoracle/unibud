import { describe, it, expect } from "vitest";
import { gpaOf, pctToPoints, avgPct } from "@/lib/academics/gpaScale";
import { buildReport, buildBudReportContext } from "@/lib/academics/reportEngine";

describe("gpaScale", () => {
  it("maps percentages to the 5.0 scale", () => {
    expect(pctToPoints(95)).toBe(5);
    expect(pctToPoints(65)).toBe(4);
    expect(pctToPoints(55)).toBe(3);
    expect(pctToPoints(30)).toBe(0);
  });

  it("gpaOf weights grades by credit unit", () => {
    const g = [
      { score: 90, max_score: 100, weight: 10 },
      { score: 50, max_score: 100, weight: 10 },
    ];
    expect(gpaOf(g)).toBe(4.0);
  });

  it("avgPct averages grade percentages", () => {
    expect(avgPct([{ score: 80, max_score: 100 }, { score: 60, max_score: 100 }])).toBe(70);
  });
});

describe("buildReport", () => {
  const grades = [
    { id: "1", course_code: "MTH101", course_title: "Maths", score: 80, max_score: 100, weight: 10, semester: "2024/2025 First", assessment_type: "exam" },
    { id: "2", course_code: "MTH101", course_title: "Maths", score: 60, max_score: 100, weight: 10, semester: "2024/2025 First", assessment_type: "test" },
    { id: "3", course_code: "CSC201", course_title: "CS", score: 45, max_score: 100, weight: 10, semester: "2024/2025 First", assessment_type: "exam" },
    { id: "4", course_code: "MTH101", course_title: "Maths", score: 72, max_score: 100, weight: 10, semester: "2023/2024 Second", assessment_type: "exam" },
  ];
  const assignments = [
    { id: "a1", title: "Essay", course_code: "MTH101", status: "submitted", due_date: new Date(Date.now() + 86400000).toISOString() },
    { id: "a2", title: "Lab", course_code: "CSC201", status: "pending", due_date: new Date(Date.now() + 172800000).toISOString() },
    { id: "a3", title: "Old", course_code: "CSC201", status: "pending", due_date: new Date(Date.now() - 100000).toISOString() },
  ];
  const sessions = [
    { id: "s1", session_date: "2026-07-20", duration_minutes: 30, study_streak: 1 },
    { id: "s2", session_date: "2026-07-21", duration_minutes: 40, study_streak: 2 },
    { id: "s3", session_date: "2026-07-22", duration_minutes: 25, study_streak: 3 },
    { id: "s4", session_date: "2026-07-25", duration_minutes: 60, study_streak: 1 },
  ];
  const courses = [
    { id: "c1", code: "MTH101", title: "Maths", credits: 3, status: "completed" },
    { id: "c2", code: "CSC201", title: "CS", credits: 4, status: "active" },
  ];
  const goals = [{ id: "g1", category: "cgpa", is_completed: true }, { id: "g2", category: "study_hours", is_completed: false }];
  const timeline = [
    { id: "t1", entry_type: "admission", title: "Admitted", date: "2023-09-01", is_verified: true },
    { id: "t2", entry_type: "course_completed", title: "Finished Maths", date: "2024-06-01", is_verified: false },
  ];

  it("computes current, previous and trend GPA from semester grouping", () => {
    const r = buildReport({ grades });
    // 2024/2025 First: Maths (80→5, 60→4) avg pts weighted = 4.5 ; CS 45→2
    // weights equal: (5*10 + 4*10 + 2*10)/30 = 11/30*... = 3.667
    expect(r.currentGpa).toBeCloseTo(3.667, 2);
    // previous: Maths 72→5 (>=70) → 5.0
    expect(r.previousGpa).toBeCloseTo(5.0, 2);
    expect(r.gpaTrend).toBeLessThan(0);
  });

  it("computes course averages sorted descending", () => {
    const r = buildReport({ grades });
    expect(r.courseAverages[0].course_code).toBe("MTH101");
    expect(r.courseAverages[0].average).toBeCloseTo(70.67, 1);
    expect(r.courseAverages[1].course_code).toBe("CSC201");
  });

  it("computes credits completed and remaining", () => {
    const r = buildReport({ courses });
    expect(r.creditsCompleted).toBe(3);
    expect(r.creditsRemaining).toBe(4);
  });

  it("computes assignment completion rate", () => {
    const r = buildReport({ assignments });
    expect(r.completedAssignments).toBe(1);
    expect(r.totalAssignments).toBe(3);
    expect(r.assignmentCompletionRate).toBeCloseTo(1 / 3, 3);
  });

  it("excludes past and completed deadlines from upcoming", () => {
  const r = buildReport({ assignments });
  // only a2 is pending AND in the future (a1 is submitted, a3 is in the past)
  expect(r.upcomingDeadlines).toHaveLength(1);
  expect(r.upcomingDeadlines.find((d) => d.id === "a3")).toBeUndefined();
  expect(r.upcomingDeadlines.find((d) => d.id === "a1")).toBeUndefined();
  });

  it("computes the longest study streak deterministically", () => {
    const r = buildReport({ studySessions: sessions });
    expect(r.longestStreak).toBe(3);
  });

  it("flags strengths and areas needing improvement", () => {
    const r = buildReport({ grades });
    expect(r.strengths.map((s) => s.course_code)).toContain("MTH101");
    expect(r.needsImprovement.map((s) => s.course_code)).toContain("CSC201");
  });

  it("sorts milestones chronologically", () => {
    const r = buildReport({ timeline });
    expect(r.milestones[0].title).toBe("Admitted");
    expect(r.milestones[1].title).toBe("Finished Maths");
  });

  it("computes goal completion across both goal entities", () => {
    const r = buildReport({ studentGoals: goals, studyGoals: [] });
    expect(r.completedGoals).toBe(1);
    expect(r.totalGoals).toBe(2);
    expect(r.goalCompletionPct).toBe(0.5);
  });

  it("reports hasData false only when nothing is recorded", () => {
    expect(buildReport({}).hasData).toBe(false);
    expect(buildReport({ grades }).hasData).toBe(true);
  });
});

describe("buildBudReportContext", () => {
  it("embeds real computed values and forbids invention", () => {
    const r = buildReport({
      grades: [{ course_code: "MTH101", score: 80, max_score: 100, weight: 10, semester: "S1" }],
      assignments: [{ title: "A", course_code: "MTH101", status: "submitted", due_date: new Date(Date.now() + 1000).toISOString() }],
    });
    const ctx = buildBudReportContext("What improved my GPA?", r);
    expect(ctx).toContain("What improved my GPA?");
    expect(ctx).toContain("Do not invent");
    expect(ctx).toContain(`Current GPA: ${r.currentGpa.toFixed(2)}`);
    expect(ctx).toContain(`Assignment completion: ${Math.round(r.assignmentCompletionRate * 100)}%`);
  });
});
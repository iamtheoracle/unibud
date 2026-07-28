/**
 * UNIBUD Academic — entity-shaped mock entries for screen fallbacks.
 *
 * Mirrors the real TimetableEntry / Assignment schemas so screens can use the
 * auto-replace fallback pattern with zero rendering changes. Tagged with
 * `__mock: true` so read-only display avoids mutating the real database.
 */
import { ACADEMIC_COURSES_MOCK, ACADEMIC_TIMETABLE_MOCK, ACADEMIC_ASSIGNMENTS_MOCK } from "./mockData";

const DAY_NAMES = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };

const courseById = (id) => ACADEMIC_COURSES_MOCK.find((c) => c.id === id);

// ─── TimetableEntry-shaped mock ──────────────────────────────────────────────
export const TIMETABLE_MOCK_ENTRIES = Object.entries(ACADEMIC_TIMETABLE_MOCK).flatMap(([dayIdx, slots]) =>
  slots.map((s, i) => {
    const c = courseById(s.courseId);
    return {
      id: `mock-tt-${dayIdx}-${i}`,
      __mock: true,
      day: DAY_NAMES[dayIdx] || "Monday",
      course_code: c?.code || s.courseId,
      course_title: c?.title || "",
      start_time: s.start,
      end_time: s.end,
      location: s.room,
      lecturer: c?.lecturer || "",
      type: s.room?.startsWith("Lab") ? "lab" : "lecture",
      color: c?.color ? `hsl(${c.color})` : "#7FD8FF",
    };
  })
);

// ─── Assignment-shaped mock ───────────────────────────────────────────────────
function daysFromNowISO(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

const SUBMISSION_TYPE = { a1: "file", a2: "file", a3: "online", a4: "online", a5: "file", a6: "online" };
const INSTRUCTIONS = {
  a1: "Implement insert/delete with rebalancing. Submit source + test cases on the LMS.",
  a2: "Simulate Round-Robin & FCFS. Include a short report comparing average wait times.",
  a3: "Design a normalized schema (3NF) for a student records system. Submit ER diagram + SQL DDL.",
  a4: "Solve problems 1–6 from the course handout. Show all working.",
  a5: "Write a MIPS program that sorts an array. Submit the .asm file.",
  a6: "800–1000 words on a topical issue. MLA referencing, double-spaced.",
};

export const ASSIGNMENT_MOCK_ENTRIES = ACADEMIC_ASSIGNMENTS_MOCK.map((a) => {
  const c = courseById(a.courseId);
  const days = a.dueInDays;
  const priority = days < 0 ? "high" : days <= 1 ? "high" : days <= 3 ? "medium" : "low";
  const status = a.status === "overdue" ? "late" : a.status;
  return {
    id: `mock-as-${a.id}`,
    __mock: true,
    title: a.title,
    course_code: c?.code || a.courseId,
    course_title: c?.title || "",
    due_date: daysFromNowISO(days),
    status,
    priority,
    submission_type: SUBMISSION_TYPE[a.id] || "file",
    description: INSTRUCTIONS[a.id] || "",
    attachments: [],
    weight: a.weight,
  };
}).sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
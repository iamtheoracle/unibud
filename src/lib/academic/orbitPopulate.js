/**
 * Orbit Auto-Populate — UNIBUD's intelligence engine.
 *
 * When a student's academic dashboard is empty, Orbit browses the web to
 * find their university's course catalog, timetable patterns, and academic
 * calendar, then builds a complete, realistic academic profile.
 *
 * A single LLM call generates everything (courses, schedule, assignments,
 * exams, GPA, attendance, stats, calendar). The result is cached at module
 * level so multiple API consumers share one generation pass.
 */
import { base44 } from "@/api/base44Client";

let cachedData = null;
let populatePromise = null;
const POPULATE_STALE = 30 * 60 * 1000; // 30 min

async function getUserContext() {
  try {
    const user = await base44.auth.me();
    const data = user?.data || {};
    return {
      university: data.university || user?.university || "University of Lagos",
      department: data.department || user?.department || "Computer Science",
      level: data.level || user?.level || 300,
      full_name: user?.full_name || data?.full_name || "Student",
    };
  } catch {
    return {
      university: "University of Lagos",
      department: "Computer Science",
      level: 300,
      full_name: "Student",
    };
  }
}

async function populateAcademics() {
  const ctx = await getUserContext();

  const prompt = `You are Orbit, UNIBUD's intelligence engine. Build a complete, realistic academic dashboard for a ${ctx.level}-level ${ctx.department} student at ${ctx.university}.

Search the web for ${ctx.university}'s ${ctx.department} department — find real course codes, typical weekly class schedules, academic calendar dates, and faculty names for the current academic session.

Generate a full academic profile:
- 5-6 real courses with actual course codes used at ${ctx.university} for ${ctx.department} at ${ctx.level} level
- Weekly timetable: 2-3 classes per weekday (Mon=1 through Fri=5) with realistic times and venues
- 4-6 assignments with due dates relative to today (some overdue with negative dueInDays, some upcoming)
- 2-4 upcoming exams with venues and study topics
- Realistic GPA on the Nigerian 5.0 scale with last semester's course grades
- Attendance percentages per course (70-95% range)
- Study stats: current streak days, weekly study hours, focus sessions, avg session minutes
- Academic calendar: 5-6 milestones/deadlines for the current semester (use 2026 dates)

Make everything specific and realistic to ${ctx.university}. Use HSL color strings (e.g. "221 83% 50%") for course colors — vary them per course.`;

  const schema = {
    type: "object",
    properties: {
      student: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          matriculation_number: { type: "string" },
          university: { type: "string" },
          faculty: { type: "string" },
          department: { type: "string" },
          level: { type: "number" },
          semester: { type: "string" },
          session: { type: "string" },
          preferred_study_time: { type: "string" },
        },
      },
      courses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            code: { type: "string" },
            title: { type: "string" },
            credits: { type: "number" },
            lecturer: { type: "string" },
            color: { type: "string" },
          },
        },
      },
      timetableSlots: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "number" },
            courseId: { type: "string" },
            start: { type: "string" },
            end: { type: "string" },
            room: { type: "string" },
          },
        },
      },
      assignments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            courseId: { type: "string" },
            title: { type: "string" },
            dueInDays: { type: "number" },
            status: { type: "string" },
            weight: { type: "number" },
          },
        },
      },
      exams: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            courseId: { type: "string" },
            title: { type: "string" },
            inDays: { type: "number" },
            time: { type: "string" },
            venue: { type: "string" },
            topics: { type: "array", items: { type: "string" } },
          },
        },
      },
      gpa: {
        type: "object",
        properties: {
          scale: { type: "number" },
          current: { type: "number" },
          projected: { type: "number" },
          previous: { type: "number" },
          lastSemesterGrades: {
            type: "array",
            items: {
              type: "object",
              properties: {
                courseId: { type: "string" },
                code: { type: "string" },
                title: { type: "string" },
                grade: { type: "string" },
                point: { type: "number" },
              },
            },
          },
        },
      },
      attendance: {
        type: "object",
        properties: {
          overall: { type: "number" },
          perCourse: {
            type: "array",
            items: {
              type: "object",
              properties: {
                courseId: { type: "string" },
                pct: { type: "number" },
              },
            },
          },
        },
      },
      stats: {
        type: "object",
        properties: {
          streakDays: { type: "number" },
          weekStudyHours: { type: "number" },
          focusSessions: { type: "number" },
          avgSessionMin: { type: "number" },
        },
      },
      calendar: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            date: { type: "string" },
            type: { type: "string" },
          },
        },
      },
    },
  };

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: "gemini_3_flash",
    response_json_schema: schema,
  });

  return result;
}

/**
 * Returns cached Orbit data, or triggers a single generation pass.
 * Concurrent callers share the same promise (deduplication).
 */
export async function getOrbitData() {
  if (cachedData && Date.now() - cachedData._generatedAt < POPULATE_STALE) {
    return cachedData;
  }
  if (populatePromise) return populatePromise;

  populatePromise = populateAcademics();
  try {
    cachedData = await populatePromise;
    cachedData._generatedAt = Date.now();
  } catch (e) {
    cachedData = null;
    throw e;
  } finally {
    populatePromise = null;
  }
  return cachedData;
}

export function clearOrbitCache() {
  cachedData = null;
}
/**
 * Orbit Study Planner — uses the student's synced timetable and assignment
 * deadlines to generate a personalized 7-day study plan.
 *
 * - Reads courses, upcoming deadlines, and existing calendar events
 * - Calls InvokeLLM to generate study sessions that avoid class times
 * - Detects schedule conflicts
 * - Saves sessions as CalendarEvent records (type: study_session)
 * - Designed to be re-run when deadlines change — overwrites prior Orbit sessions
 */
import { base44 } from "@/api/base44Client";
import { academicApi } from "./academicApi";

export async function generateStudyPlan() {
  // Gather academic context
  const [courses, deadlines] = await Promise.all([
    academicApi.getCourses(),
    academicApi.getUpcomingDeadlines(),
  ]);

  // Get existing calendar events to detect conflicts
  const existingEvents = await base44.entities.CalendarEvent.list("-date", 50);

  // Build the next 7 days
  const today = new Date();
  const upcomingDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    upcomingDates.push(`${dateStr} (${dayName})`);
  }

  // Get today's classes for the prompt
  const todaySchedule = await academicApi.getTodaySchedule();
  const classTimes = todaySchedule.map((s) => `${s.code} ${s.start}-${s.end}`).join(", ");

  const courseList = (courses || []).map((c) => `${c.code}: ${c.title}`).join(", ");
  const deadlineList = (deadlines || [])
    .map((d) => `${d.title} (${d.code}) — due in ${d.dueInDays} day(s)`)
    .join(", ");

  const prompt = `You are Orbit, UNIBUD's study intelligence. Generate a personalized 7-day study plan.

Student's courses: ${courseList || "Not available"}

Today's classes: ${classTimes || "No classes today"}

Upcoming deadlines: ${deadlineList || "None"}

Next 7 days: ${upcomingDates.join(", ")}

Existing calendar events to avoid: ${(existingEvents || []).slice(0, 20).map((e) => `${e.date} ${e.start_time} ${e.title}`).join(", ") || "None"}

Generate 1-3 study sessions per day. For each session:
- Pick a specific course to focus on
- Set a realistic start_time and end_time (HH:MM format, avoid class times)
- Include a concrete study goal
- Set priority: "high" for imminent deadlines (≤3 days), "medium" for regular study, "low" for review
- Assign a color (HSL string like "221 83% 50%")

Rules:
- Prioritize courses with the nearest deadlines
- Spread sessions across different courses
- Prefer evening study times if no preference is known
- Include at least one review session per week
- Do not schedule sessions during class times`;

  const schema = {
    type: "object",
    properties: {
      sessions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string", description: "YYYY-MM-DD" },
            start_time: { type: "string", description: "HH:MM" },
            end_time: { type: "string", description: "HH:MM" },
            course_code: { type: "string" },
            goal: { type: "string" },
            priority: { type: "string", enum: ["high", "medium", "low"] },
            color: { type: "string" },
          },
        },
      },
      summary: { type: "string", description: "Brief overview of the plan" },
      conflicts: {
        type: "array",
        items: { type: "string" },
        description: "Schedule conflicts detected",
      },
    },
  };

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema,
  });

  // Delete previous Orbit-generated study sessions to avoid duplicates
  const oldSessions = await base44.entities.CalendarEvent.filter({
    source_entity: "orbit_planner",
  });
  for (const old of oldSessions || []) {
    await base44.entities.CalendarEvent.delete(old.id);
  }

  // Save new sessions as calendar events
  const saved = [];
  for (const session of result.sessions || []) {
    const event = await base44.entities.CalendarEvent.create({
      title: `Study: ${session.course_code || "Review"}`,
      description: session.goal || "",
      type: "study_session",
      source_entity: "orbit_planner",
      date: session.date,
      start_time: session.start_time || "",
      end_time: session.end_time || "",
      color: session.color || "",
    });
    saved.push(event);
  }

  return {
    sessions: result.sessions || [],
    summary: result.summary || "",
    conflicts: result.conflicts || [],
    savedCount: saved.length,
  };
}
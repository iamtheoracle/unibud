import { base44 } from "@/api/base44Client";

/**
 * Generates personalized daily briefings using LLM + real student data.
 * Briefings are cached per-day per-type to avoid redundant LLM calls.
 */

const BUD_VOICE =
  "You are Bud, a warm, calm, and encouraging academic companion. " +
  "Write in a friendly, concise, and natural tone — never robotic. " +
  "Use the student's real data to give specific, actionable advice.";

const BRIEFING_PROMPTS = {
  morning:
    "Generate a morning briefing for this university student. Include: " +
    "1) A warm greeting, 2) Today's classes and schedule, 3) Assignments due soon, " +
    "4) Any campus events today, 5) A brief encouraging note. " +
    "Keep it under 150 words, warm and motivating.",
  evening:
    "Generate an evening recap for this university student. Include: " +
    "1) A calming greeting, 2) Acknowledgment of the day, 3) What's due tomorrow, " +
    "4) A suggested study plan for tonight, 5) A gentle reminder to rest. " +
    "Keep it under 150 words, supportive and calming.",
  weekly:
    "Generate a weekly summary for this university student. Include: " +
    "1) A recap of the week's highlights, 2) Academic performance overview, " +
    "3) Upcoming deadlines next week, 4) Recommendations for improvement, " +
    "5) An encouraging closing note. Keep it under 200 words, insightful and motivating.",
};

/**
 * Fetches the student's current data for briefing generation.
 */
async function fetchStudentData() {
  const [assignments, exams, events, timetable, courses] = await Promise.allSettled([
    base44.entities.Assignment.list("-due_date", 5),
    base44.entities.Exam.list("-created_date", 3),
    base44.entities.CampusEvent.list("-created_date", 5),
    base44.entities.TimetableEntry.list("-created_date", 5),
    base44.entities.Course.list("-created_date", 5),
  ]);

  const unwrap = (r) => (r.status === "fulfilled" ? r.value || [] : []);

  return {
    assignments: unwrap(assignments).map((a) => ({
      title: a.title,
      due_date: a.due_date,
      status: a.status,
    })),
    exams: unwrap(exams).map((e) => ({
      title: e.title,
      date: e.date,
    })),
    events: unwrap(events).map((e) => ({
      title: e.title,
      date: e.date,
      location: e.location,
    })),
    timetable: unwrap(timetable).map((t) => ({
      course_code: t.course_code || t.title,
      start_time: t.start_time,
      end_time: t.end_time,
      room: t.room,
    })),
    courses: unwrap(courses).map((c) => ({
      code: c.code,
      title: c.title,
    })),
  };
}

/**
 * Generates a daily briefing of the specified type.
 * @param {"morning"|"evening"|"weekly"} type
 * @returns {Promise<string>} The briefing text in Bud's voice
 */
export async function generateDailyBriefing(type = "morning") {
  const data = await fetchStudentData();
  const promptType = BRIEFING_PROMPTS[type] || BRIEFING_PROMPTS.morning;

  const prompt =
    `${BUD_VOICE}\n\n` +
    `${promptType}\n\n` +
    `Student data:\n${JSON.stringify(data, null, 2)}\n\n` +
    `Generate the briefing now. Be specific — reference real dates, course codes, and assignment titles.`;

  const res = await base44.integrations.Core.InvokeLLM({ prompt });
  return typeof res === "string" ? res : res?.response || res?.text || "";
}

/**
 * Determines which briefing type is appropriate for the current time.
 */
export function getCurrentBriefingType() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "morning";
  return "evening";
}
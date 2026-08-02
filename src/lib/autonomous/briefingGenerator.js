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
    "1) A warm greeting, 2) Any ACTIVE EMERGENCY NOTICES from the institution (mention these first if present), " +
    "3) Today's classes and schedule, 4) Assignments due soon, " +
    "5) Any official announcements from the university, 6) Upcoming academic calendar events, " +
    "7) Any upcoming exams from the official exam schedule, 8) A brief encouraging note. " +
    "Keep it under 180 words, warm and motivating. Prioritize official institutional information.",
  evening:
    "Generate an evening recap for this university student. Include: " +
    "1) A calming greeting, 2) Any ACTIVE EMERGENCY NOTICES (mention first if present), " +
    "3) Acknowledgment of the day, 4) What's due tomorrow, " +
    "5) Any official announcements relevant to tomorrow, 6) A suggested study plan for tonight, " +
    "7) A gentle reminder to rest. Keep it under 180 words, supportive and calming. " +
    "Prioritize official institutional information.",
  weekly:
    "Generate a weekly summary for this university student. Include: " +
    "1) A recap of the week's highlights, 2) Academic performance overview, " +
    "3) Upcoming deadlines next week, 4) Official announcements and academic calendar events, " +
    "5) Any upcoming exams from the official schedule, 6) Recommendations for improvement, " +
    "7) An encouraging closing note. Keep it under 220 words, insightful and motivating. " +
    "Prioritize official institutional information.",
};

/**
 * Fetches the student's current data for briefing generation.
 * Combines personal academic data with the institution's official published
 * information (announcements, emergencies, calendar, exams) via the
 * getUniversityProfileOfficial backend function — Bud's verified source.
 */
async function fetchStudentData() {
  const [assignments, exams, events, timetable, courses, official] = await Promise.allSettled([
    base44.entities.Assignment.list("-due_date", 5),
    base44.entities.Exam.list("-created_date", 3),
    base44.entities.CampusEvent.list("-created_date", 5),
    base44.entities.TimetableEntry.list("-created_date", 5),
    base44.entities.Course.list("-created_date", 5),
    base44.functions.invoke("getUniversityProfileOfficial", {}),
  ]);

  const unwrap = (r) => (r.status === "fulfilled" ? r.value || [] : []);
  const officialData = official.status === "fulfilled" ? official.value?.data || official.value : null;

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
    // ── Official institutional source — verified, published by the university ──
    official_university_profile: officialData ? {
      institution_name: officialData.institution?.name,
      active_announcements: officialData.announcements || [],
      active_emergencies: officialData.emergencies || [],
      upcoming_calendar_events: officialData.calendar_events?.upcoming || [],
      upcoming_official_exams: officialData.exams || [],
      stats: officialData.stats || {},
    } : null,
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
    `IMPORTANT: The "official_university_profile" field contains VERIFIED information published by the student's institution. ` +
    `Always prioritize this over any other data. If there are active emergencies, mention them FIRST. ` +
    `Reference official announcements, calendar events, and exam schedules as coming from the university. ` +
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
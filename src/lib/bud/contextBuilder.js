/**
 * Bud Context Builder
 *
 * Gathers real academic data to enrich Bud's context so responses are
 * personalized and actionable. This is the bridge between the student's
 * real data and Bud's intelligence — without it, Bud can't reference
 * specific assignments, exams, or courses.
 *
 * Architecture note: This runs in the BudPanelContext (frontend) and
 * passes data as context to the runtime pipeline. It does NOT bypass
 * the architecture — it enriches the context that Nexus passes to Spark.
 */

import { base44 } from "@/api/base44Client";

/**
 * Fetch a summary of the student's academic life for Bud's context.
 * Only fetches lightweight summaries — not full records.
 *
 * @param {string} userId - Current user ID
 * @param {string} institutionId - User's institution ID for scoping
 * @returns {object} Academic context summary
 */
export async function buildAcademicContext(userId, institutionId) {
  if (!userId) return null;

  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    const [assignments, timetable, exams, courses, opportunities, studyGroups, events] = await Promise.all([
      fetchAssignments(userId, institutionId),
      fetchTimetable(userId, institutionId),
      fetchExams(userId, institutionId),
      fetchCourses(userId, institutionId),
      fetchOpportunities(institutionId),
      fetchStudyGroups(userId, institutionId),
      fetchEvents(institutionId),
    ]);

    return {
      academic: {
        assignments: assignments,
        timetable: timetable,
        exams: exams,
        courses: courses,
      },
      opportunities: opportunities,
      studyGroups: studyGroups,
      events: events,
      fetchedAt: now.toISOString(),
    };
  } catch (e) {
    console.error("budContextBuilder: failed to build academic context", e);
    return null;
  }
}

async function fetchAssignments(userId, institutionId) {
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  try {
    const all = await base44.entities.Assignment.filter(
      { created_by_id: userId },
      "-due_date",
      10
    );
    const upcoming = all.filter((a) => {
      if (!a.due_date) return false;
      const due = new Date(a.due_date);
      return due >= now && due <= oneWeekLater;
    });
    const overdue = all.filter((a) => {
      if (!a.due_date) return false;
      const due = new Date(a.due_date);
      return due < now && a.status !== "completed" && a.status !== "submitted";
    });
    return {
      upcoming: upcoming.map((a) => ({
        title: a.title,
        course: a.course_code || a.course_name || "",
        due: a.due_date,
        status: a.status,
      })),
      overdue: overdue.map((a) => ({
        title: a.title,
        course: a.course_code || a.course_name || "",
        due: a.due_date,
        status: a.status,
      })),
      total: all.length,
    };
  } catch {
    return { upcoming: [], overdue: [], total: 0 };
  }
}

async function fetchTimetable(userId, institutionId) {
  try {
    const entries = await base44.entities.TimetableEntry.filter(
      institutionId ? { institution_id: institutionId } : {},
      "day,start_time",
      20
    );
    return entries.map((t) => ({
      course: t.course_code || t.course_name || "",
      day: t.day,
      start: t.start_time,
      end: t.end_time,
      venue: t.venue || "",
    }));
  } catch {
    return [];
  }
}

async function fetchExams(userId, institutionId) {
  const now = new Date();
  try {
    const exams = await base44.entities.ExamSchedule.filter(
      institutionId ? { institution_id: institutionId, status: "scheduled" } : { status: "scheduled" },
      "date",
      10
    );
    const upcoming = exams.filter((e) => e.date && new Date(e.date) >= now);
    return upcoming.map((e) => ({
      title: e.title,
      course: e.course_code || "",
      date: e.date,
      start: e.start_time,
      venue: e.venue || "",
    }));
  } catch {
    return [];
  }
}

async function fetchCourses(userId, institutionId) {
  try {
    const courses = await base44.entities.Course.filter(
      institutionId ? { institution_id: institutionId } : {},
      "-created_date",
      10
    );
    return courses.map((c) => ({
      code: c.code || c.course_code || "",
      title: c.title || c.name || "",
      credits: c.credits,
    }));
  } catch {
    return [];
  }
}

async function fetchOpportunities(institutionId) {
  try {
    const opps = await base44.entities.Opportunity.filter(
      institutionId ? { institution_id: institutionId } : {},
      "-created_date",
      5
    );
    return opps.map((o) => ({
      title: o.title,
      type: o.type,
      deadline: o.deadline,
      organization: o.organization || "",
    }));
  } catch {
    return [];
  }
}

async function fetchStudyGroups(userId, institutionId) {
  try {
    const groups = await base44.entities.StudyGroup.filter(
      institutionId ? { institution_id: institutionId } : {},
      "-created_date",
      5
    );
    return groups.map((g) => ({
      name: g.name || g.title || "",
      subject: g.subject || g.course_code || "",
      members: g.members_count || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchEvents(institutionId) {
  try {
    const events = await base44.entities.CampusEvent.filter(
      institutionId ? { institution_id: institutionId } : {},
      "-created_date",
      5
    );
    return events.map((e) => ({
      title: e.title || e.name || "",
      date: e.start_date || e.date,
      location: e.location || "",
    }));
  } catch {
    return [];
  }
}

/**
 * Format academic context into a natural language summary for Spark.
 * This is what Spark reads to compose personalized responses.
 */
export function formatAcademicContext(ctx) {
  if (!ctx) return "No academic data available.";

  const lines = [];

  // Assignments
  if (ctx.academic?.assignments) {
    const a = ctx.academic.assignments;
    if (a.overdue?.length > 0) {
      lines.push(`OVERDUE ASSIGNMENTS (${a.overdue.length}):`);
      a.overdue.forEach((x) => lines.push(`  - ${x.title} (${x.course}), was due ${x.due}`));
    }
    if (a.upcoming?.length > 0) {
      lines.push(`UPCOMING ASSIGNMENTS (${a.upcoming.length}):`);
      a.upcoming.forEach((x) => lines.push(`  - ${x.title} (${x.course}), due ${x.due}`));
    }
    if (a.total > 0 && a.overdue?.length === 0 && a.upcoming?.length === 0) {
      lines.push(`Assignments: ${a.total} total, none overdue or due this week.`);
    }
  }

  // Timetable
  if (ctx.academic?.timetable?.length > 0) {
    lines.push(`TIMETABLE (${ctx.academic.timetable.length} entries):`);
    ctx.academic.timetable.forEach((t) =>
      lines.push(`  - ${t.day} ${t.start}-${t.end}: ${t.course} at ${t.venue}`)
    );
  }

  // Exams
  if (ctx.academic?.exams?.length > 0) {
    lines.push(`UPCOMING EXAMS (${ctx.academic.exams.length}):`);
    ctx.academic.exams.forEach((e) =>
      lines.push(`  - ${e.title} (${e.course}) on ${e.date} at ${e.start} in ${e.venue}`)
    );
  }

  // Courses
  if (ctx.academic?.courses?.length > 0) {
    lines.push(`COURSES (${ctx.academic.courses.length}):`);
    ctx.academic.courses.forEach((c) =>
      lines.push(`  - ${c.code}: ${c.title}${c.credits ? ` (${c.credits} credits)` : ""}`)
    );
  }

  // Opportunities
  if (ctx.opportunities?.length > 0) {
    lines.push(`OPPORTUNITIES (${ctx.opportunities.length}):`);
    ctx.opportunities.forEach((o) =>
      lines.push(`  - ${o.title} (${o.type}) at ${o.organization}, deadline: ${o.deadline || "N/A"}`)
    );
  }

  // Study Groups
  if (ctx.studyGroups?.length > 0) {
    lines.push(`STUDY GROUPS (${ctx.studyGroups.length}):`);
    ctx.studyGroups.forEach((g) =>
      lines.push(`  - ${g.name} (${g.subject}), ${g.members} members`)
    );
  }

  // Events
  if (ctx.events?.length > 0) {
    lines.push(`CAMPUS EVENTS (${ctx.events.length}):`);
    ctx.events.forEach((e) =>
      lines.push(`  - ${e.title} on ${e.date} at ${e.location}`)
    );
  }

  return lines.length > 0 ? lines.join("\n") : "No academic data available.";
}
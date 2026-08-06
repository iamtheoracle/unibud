import { gpaOf, avgPct, gradePct } from "./gpaScale";

/** Pulls a YYYY-MM-DD date from a study session record. */
function sessionDay(s) {
  return (s.session_date || s.started_at || s.created_date || "").slice(0, 10);
}

function groupSemesters(grades) {
  const map = {};
  grades.forEach((g) => {
    const s = g.semester || "Unassigned";
    (map[s] ||= []).push(g);
  });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

/** Longest run of consecutive calendar days with a session (deterministic). */
function computeStreaks(sessions) {
  const days = [...new Set(sessions.map(sessionDay).filter(Boolean))].sort();
  if (!days.length) return { current: 0, longest: 0 };
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000);
    if (diff === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  // Current streak: consecutive days ending today OR yesterday.
  const set = new Set(days);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const key = (d) => d.toISOString().slice(0, 10);
  let current = 0;
  let d = new Date(today);
  if (set.has(key(d))) {
    while (set.has(key(d))) { current += 1; d.setDate(d.getDate() - 1); }
  } else {
    d = new Date(today);
    d.setDate(d.getDate() - 1);
    while (set.has(key(d))) { current += 1; d.setDate(d.getDate() - 1); }
  }
  return { current, longest: Math.max(longest, current) };
}

function distinctDaysInWindow(sessions, days) {
  const set = new Set(sessions.map(sessionDay).filter(Boolean));
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  let n = 0;
  const d = new Date(start);
  while (d <= end) {
    if (set.has(d.toISOString().slice(0, 10))) n += 1;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

/**
 * Pure report builder. Accepts raw entity arrays and returns every metric
 * the Summary Report visualises. No network, no React — fully testable.
 */
export function buildReport({
  grades = [],
  assignments = [],
  attendance = [],
  studySessions = [],
  studentGoals = [],
  studyGoals = [],
  courses = [],
  timeline = [],
} = {}) {
  const semesters = groupSemesters(grades);
  const semesterGpas = semesters.map(([name, items]) => ({
    semester: name,
    gpa: gpaOf(items),
    avg: avgPct(items),
    count: items.length,
  }));
  const current = semesterGpas[semesterGpas.length - 1] || null;
  const previous = semesterGpas.length > 1 ? semesterGpas[semesterGpas.length - 2] : null;
  const currentGpa = current ? current.gpa : 0;
  const previousGpa = previous ? previous.gpa : null;
  const gpaTrend = previousGpa != null ? currentGpa - previousGpa : 0;
  const semesterAvg = current ? current.avg : 0;

  // Per-course averages across all recorded grades.
  const courseMap = {};
  grades.forEach((g) => {
    const k = g.course_code || "—";
    (courseMap[k] ||= { course_code: k, course_title: g.course_title || k, pcts: [] }).pcts.push(gradePct(g));
  });
  const courseAverages = Object.values(courseMap)
    .map((c) => ({
      course_code: c.course_code,
      course_title: c.course_title,
      average: c.pcts.length ? c.pcts.reduce((a, b) => a + b, 0) / c.pcts.length : 0,
      count: c.pcts.length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.average - a.average);

  const creditsCompleted = courses
    .filter((c) => c.status === "completed")
    .reduce((s, c) => s + (c.credits || 0), 0);
  const creditsRemaining = courses
    .filter((c) => c.status === "active")
    .reduce((s, c) => s + (c.credits || 0), 0);

  const completedAssignments = assignments.filter((a) =>
    ["submitted", "graded", "late"].includes(a.status)
  ).length;
  const totalAssignments = assignments.length;
  const assignmentCompletionRate = totalAssignments ? completedAssignments / totalAssignments : 0;

  const present = attendance.filter((a) => a.status === "present").length;
  const absent = attendance.filter((a) => a.status === "absent").length;
  const attendancePct = present + absent > 0 ? present / (present + absent) : null;

  const { current: studyStreak, longest: longestStreak } = computeStreaks(studySessions);
  const weeklyConsistency = distinctDaysInWindow(studySessions, 7) / 7;
  const monthlyConsistency = distinctDaysInWindow(studySessions, 30) / 30;

  const totalGoals = studentGoals.length + studyGoals.length;
  const completedGoals =
    studentGoals.filter((g) => g.is_completed).length +
    studyGoals.filter((g) => g.is_completed).length;
  const goalCompletionPct = totalGoals ? completedGoals / totalGoals : 0;

  const now = Date.now();
  const upcomingDeadlines = assignments
    .filter((a) => a.due_date && new Date(a.due_date).getTime() >= now && ["pending", "in_progress"].includes(a.status))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      title: a.title,
      course_code: a.course_code,
      due_date: a.due_date,
      priority: a.priority,
      status: a.status,
    }));

  const strengths = courseAverages.filter((c) => c.average >= 70).slice(0, 5);
  const needsImprovement = courseAverages.filter((c) => c.average > 0 && c.average < 50).slice(0, 5);

  const milestones = timeline
    .filter((m) => m.date)
    .map((m) => ({
      id: m.id,
      entry_type: m.entry_type,
      title: m.title,
      subtitle: m.subtitle,
      date: m.date,
      is_verified: m.is_verified,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const hasData =
    grades.length > 0 ||
    assignments.length > 0 ||
    studySessions.length > 0 ||
    attendance.length > 0;

  return {
    currentGpa,
    previousGpa,
    gpaTrend,
    semesterAvg,
    semesterGpas,
    courseAverages,
    creditsCompleted,
    creditsRemaining,
    assignmentCompletionRate,
    completedAssignments,
    totalAssignments,
    attendancePct,
    present,
    absent,
    studyStreak,
    longestStreak,
    weeklyConsistency,
    monthlyConsistency,
    goalCompletionPct,
    completedGoals,
    totalGoals,
    upcomingDeadlines,
    strengths,
    needsImprovement,
    milestones,
    hasData,
  };
}

/**
 * Builds the real-data context string Bud receives so it answers from
 * the student's actual records and never invents statistics.
 */
export function buildBudReportContext(question, report) {
  return [
    `Student question: "${question}"`,
    "Answer using ONLY the Academics Summary Report below. Do not invent any numbers.",
    "Academics Summary Report (real data):",
    `Current GPA: ${report.currentGpa.toFixed(2)}${report.previousGpa != null ? ` | Previous GPA: ${report.previousGpa.toFixed(2)}` : ""} | GPA trend: ${report.gpaTrend >= 0 ? "+" : ""}${report.gpaTrend.toFixed(2)}`,
    `Semester average: ${report.semesterAvg.toFixed(1)}%`,
    `Assignment completion: ${Math.round(report.assignmentCompletionRate * 100)}% (${report.completedAssignments}/${report.totalAssignments})`,
    report.attendancePct != null
      ? `Attendance: ${Math.round(report.attendancePct * 100)}% (${report.present} present, ${report.absent} absent)`
      : "Attendance: not available",
    `Study streak: ${report.studyStreak} days (longest ${report.longestStreak}) | weekly consistency ${Math.round(report.weeklyConsistency * 100)}% | monthly ${Math.round(report.monthlyConsistency * 100)}%`,
    `Goal completion: ${Math.round(report.goalCompletionPct * 100)}% (${report.completedGoals}/${report.totalGoals})`,
    `Credits: ${report.creditsCompleted} completed, ${report.creditsRemaining} remaining`,
    report.strengths.length
      ? `Strengths: ${report.strengths.map((s) => `${s.course_code} (${Math.round(s.average)}%)`).join(", ")}`
      : "Strengths: none above 70%",
    report.needsImprovement.length
      ? `Needs improvement: ${report.needsImprovement.map((s) => `${s.course_code} (${Math.round(s.average)}%)`).join(", ")}`
      : "Needs improvement: none below 50%",
    report.upcomingDeadlines.length
      ? `Upcoming deadlines: ${report.upcomingDeadlines.map((d) => `${d.title} (${d.course_code}, ${new Date(d.due_date).toLocaleDateString()})`).join("; ")}`
      : "Upcoming deadlines: none",
  ].join("\n");
}
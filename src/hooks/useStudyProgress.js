/**
 * useStudyProgress — computes weekly academic progress from real data.
 *
 * Aggregates StudySession, StudyGoal, Assignment, Exam, and TimetableEntry
 * entities to produce a complete progress snapshot for the Study Progress
 * Tracker widget. Returns loading, empty, error, and offline states.
 */
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const STALE = 60 * 1000;

function getWeekRange() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekLabel() {
  const { start } = getWeekRange();
  return `${start.getFullYear()}-W${String(getISOWeek(start)).padStart(2, "0")}`;
}

export function useStudyProgress() {
  const { start, end } = getWeekRange();
  const weekLabel = getWeekLabel();
  const weekStartStr = start.toISOString().split("T")[0];
  const weekEndStr = end.toISOString().split("T")[0];
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayStr = new Date().toISOString().split("T")[0];

  const sessions = useQuery({
    queryKey: ["study-progress", "sessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 200),
    staleTime: STALE,
  });

  const goal = useQuery({
    queryKey: ["study-progress", "goal", weekLabel],
    queryFn: async () => {
      const goals = await base44.entities.StudyGoal.filter({ week_label: weekLabel }, "-created_date", 1);
      return goals?.[0] || null;
    },
    staleTime: STALE,
  });

  const assignments = useQuery({
    queryKey: ["study-progress", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 50),
    staleTime: STALE,
  });

  const exams = useQuery({
    queryKey: ["study-progress", "exams"],
    queryFn: () => base44.entities.Exam.list("date", 20),
    staleTime: STALE,
  });

  const timetable = useQuery({
    queryKey: ["study-progress", "timetable", todayName],
    queryFn: async () => {
      const all = await base44.entities.TimetableEntry.list();
      return (all || []).filter((t) => t.day === todayName);
    },
    staleTime: STALE,
  });

  const loading = sessions.isLoading || goal.isLoading || assignments.isLoading;
  const error = sessions.isError || assignments.isError;

  const allSessions = sessions.data || [];
  const weekSessions = allSessions.filter((s) => {
    const d = s.session_date || (s.started_at || "").split("T")[0];
    return d >= weekStartStr && d <= weekEndStr && s.status === "completed";
  });
  const weekHours = weekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const targetHours = goal.data?.target_hours || 20;
  const hoursPct = targetHours > 0 ? Math.min(100, (weekHours / targetHours) * 100) : 0;

  const weekAssignments = (assignments.data || []).filter((a) => {
    const due = (a.due_date || "").split("T")[0];
    return due >= weekStartStr && due <= weekEndStr;
  });
  const completedAssignments = weekAssignments.filter(
    (a) => a.status === "submitted" || a.status === "graded" || a.status === "completed"
  );
  const assignmentsPct = weekAssignments.length > 0
    ? (completedAssignments.length / weekAssignments.length) * 100
    : 0;

  const studyDates = new Set(
    allSessions.filter((s) => s.status === "completed" && s.session_date).map((s) => s.session_date)
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (studyDates.has(ds)) streak++;
    else if (i > 0) break;
  }

  const goalPct = Math.round((hoursPct + assignmentsPct) / 2);

  const upcomingDeadlines = [
    ...(assignments.data || [])
      .filter((a) => (a.due_date || "").split("T")[0] >= todayStr)
      .slice(0, 5)
      .map((a) => ({
        title: a.title,
        date: (a.due_date || "").split("T")[0],
        type: "Assignment",
        code: a.course_code || "",
      })),
    ...(exams.data || [])
      .filter((e) => (e.date || "").split("T")[0] >= todayStr)
      .slice(0, 5)
      .map((e) => ({
        title: e.title,
        date: (e.date || "").split("T")[0],
        type: "Exam",
        code: e.course_code || "",
      })),
  ]
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(0, 3);

  const todaySessions = (timetable.data || []).map((t) => ({
    title: `${t.course_code || ""} ${t.type || ""}`.trim(),
    time: t.start_time || "",
    location: t.location || "",
  }));

  const isEmpty = !loading && !error && weekSessions.length === 0 &&
    weekAssignments.length === 0 && !goal.data && todaySessions.length === 0;

  return {
    loading,
    error,
    isEmpty,
    metrics: {
      weekHours: Math.round(weekHours * 10) / 10,
      targetHours,
      hoursPct: Math.round(hoursPct),
      completedAssignments: completedAssignments.length,
      totalAssignments: weekAssignments.length,
      assignmentsPct: Math.round(assignmentsPct),
      streak,
      goalPct,
    },
    upcomingDeadlines,
    todaySessions,
    weekLabel,
  };
}
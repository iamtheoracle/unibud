import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useWeather } from "@/hooks/useWeather";

/**
 * useHomeContext — Bud's observation layer.
 * Aggregates every signal that should influence the dashboard:
 * time of day, weekend, exam week, weather, semester, attendance,
 * assignments, finances, messages, community, deadlines, payments.
 */
export function useHomeContext() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const courses = useQuery({ queryKey: ["homeCourses"], queryFn: () => base44.entities.Course.list() });
  const assignments = useQuery({ queryKey: ["homeAssignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 30) });
  const exams = useQuery({ queryKey: ["homeExams"], queryFn: () => base44.entities.Exam.list("date", 20) });
  const sessions = useQuery({ queryKey: ["homeSessions"], queryFn: () => base44.entities.StudySession.list("-session_date", 60) });
  const attendance = useQuery({ queryKey: ["homeAttendance"], queryFn: () => base44.entities.AttendanceRecord.list("-created_date", 60) });
  const fees = useQuery({ queryKey: ["homeFees"], queryFn: () => base44.entities.Fee.list("-created_date", 30) });
  const conversations = useQuery({ queryKey: ["homeConversations"], queryFn: () => base44.entities.Conversation.list("-updated_date", 20) });
  const quad = useQuery({ queryKey: ["homeQuad"], queryFn: () => base44.entities.QuadPost.list("-created_date", 8) });
  const notifications = useQuery({ queryKey: ["homeNotifs"], queryFn: () => base44.entities.Notification.list("-created_date", 20) });
  const timetable = useQuery({ queryKey: ["homeTimetable"], queryFn: () => base44.entities.TimetableEntry.list() });
  const weather = useWeather();

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const todayStr = now.toISOString().split("T")[0];

  const a = assignments.data || [];
  const e = exams.data || [];
  const dueToday = a.filter((x) => x.due_date && x.due_date.split("T")[0] === todayStr && x.status === "pending");
  const dueSoon = a
    .filter((x) => x.due_date && x.due_date.split("T")[0] >= todayStr && x.status === "pending")
    .sort((x, y) => (x.due_date || "").localeCompare(y.due_date || ""));
  const examSoon = e.filter((x) => x.date && x.date >= todayStr && x.status === "upcoming");
  const examWeek = examSoon.some((x) => {
    const d = (new Date(x.date) - now) / 86400000;
    return d >= 0 && d <= 7;
  });
  const nextExamDays = examSoon.length ? Math.ceil((new Date(examSoon[0].date) - now) / 86400000) : null;

  // ── Next lecture today (for contextual "lecture in N min" pulse) ──
  const tt = timetable.data || [];
  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
  const parseHM = (s) => {
    if (!s) return null;
    const part = s.includes("T") ? s.split("T")[1] : s;
    const [h, m] = part.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? null : { h, m };
  };
  let nextLecture = null;
  let nextLectureIn = null;
  tt.forEach((x) => {
    if (!x || x.day !== todayName) return;
    const hm = parseHM(x.start_time);
    if (!hm) return;
    const start = new Date(now); start.setHours(hm.h, hm.m, 0, 0);
    const diff = (start - now) / 60000;
    if (diff > 0 && (nextLectureIn === null || diff < nextLectureIn)) {
      nextLectureIn = Math.round(diff);
      nextLecture = x;
    }
  });

  const att = attendance.data || [];
  const present = att.filter((x) => (x.status || "").toLowerCase() === "present").length;
  const attendanceRate = att.length ? present / att.length : null;

  const f = fees.data || [];
  const pendingFees = f.filter((x) => x.status === "pending" || x.status === "overdue");
  const overdueFees = f.filter((x) => x.status === "overdue");

  const conv = conversations.data || [];
  const unread = conv.filter((x) => x.unread || x.is_unread).length;

  const posts = quad.data || [];
  const notifs = notifications.data || [];
  const unreadNotifs = notifs.filter((x) => !x.read && !x.is_read).length;

  const w = weather.data;
  const weatherScene = w?.scene || "clear";
  const weatherAlerts = w?.alerts || [];
  const severeWeather = weatherAlerts.some((x) => x.severity === "severe");

  return {
    user: me.data,
    courses: courses.data,
    assignments: a,
    exams: e,
    sessions: sessions.data,
    timeOfDay,
    isWeekend,
    todayStr,
    dueToday: dueToday.length,
    dueSoon: dueSoon.length,
    nextDeadlineDays: dueSoon.length ? Math.ceil((new Date(dueSoon[0].due_date) - now) / 86400000) : null,
    examWeek,
    nextExamDays,
    examSoonCount: examSoon.length,
    attendanceRate,
    upcomingPayments: pendingFees.length,
    overdueFees: overdueFees.length,
    pendingFees,
    unreadMessages: unread,
    conversations: conv,
    communityActivity: posts.length,
    quadPosts: posts,
    unreadNotifs,
    notifications: notifs,
    weather: w,
    weatherScene,
    weatherAlerts,
    severeWeather,
    nextLecture,
    nextLectureIn,
    mood: "focused",
  };
}
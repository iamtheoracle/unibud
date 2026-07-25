import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useWeather } from "@/hooks/useWeather";

const todayStr = () => new Date().toISOString().split("T")[0];

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

const MOODS = ["great", "good", "ok", "stressed", "tired", "anxious"];
const LOW_MOODS = ["stressed", "tired", "anxious", "sad"];

/**
 * useHomeContext — Bud's ambient awareness engine.
 * Gathers time, weekend, exam week, weather, semester, attendance, assignments,
 * financial status, unread messages, community activity, recent activity, mood,
 * and upcoming deadlines/payments — then computes a priority-ordered dashboard.
 */
export function useHomeContext() {
  const [clock, setClock] = useState(timeOfDay());
  useEffect(() => {
    const t = setInterval(() => setClock(timeOfDay()), 60000);
    return () => clearInterval(t);
  }, []);

  const [mood, setMoodState] = useState(() => {
    try { return localStorage.getItem("unibud_mood") || ""; } catch { return ""; }
  });
  const setMood = (m) => {
    try { localStorage.setItem("unibud_mood", m); } catch {}
    setMoodState(m);
  };

  const weather = useWeather();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: courses } = useQuery({ queryKey: ["homeCourses"], queryFn: () => base44.entities.Course.list() });
  const { data: assignments } = useQuery({ queryKey: ["homeAssignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 30) });
  const { data: exams } = useQuery({ queryKey: ["homeExams"], queryFn: () => base44.entities.Exam.list("date", 20) });
  const { data: sessions } = useQuery({ queryKey: ["homeSessions"], queryFn: () => base44.entities.StudySession.list("-session_date", 60) });
  const { data: attendance } = useQuery({ queryKey: ["homeAttendance"], queryFn: () => base44.entities.AttendanceRecord.list("-created_date", 40) });
  const { data: fees } = useQuery({ queryKey: ["homeFees"], queryFn: () => base44.entities.Fee.list("-created_date", 30) });
  const { data: conversations } = useQuery({ queryKey: ["homeConvos"], queryFn: () => base44.entities.Conversation.list("-updated_date", 30) });
  const { data: posts } = useQuery({ queryKey: ["homePosts"], queryFn: () => base44.entities.QuadPost.list("-created_date", 20) });

  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const tod = clock;
  const ts = todayStr();

  // Exams
  const examSoon = (exams || []).filter((e) => e.date && e.date >= ts && e.status === "upcoming");
  const nextExam = examSoon[0];
  const daysToExam = nextExam ? Math.ceil((new Date(nextExam.date) - new Date(ts)) / 86400000) : null;
  const inExamWeek = examSoon.some((e) => {
    const d = Math.ceil((new Date(e.date) - new Date(ts)) / 86400000);
    return d >= 0 && d <= 7;
  });

  // Assignments / deadlines
  const pendingAssignments = (assignments || []).filter(
    (a) => a.status === "pending" && a.due_date && a.due_date.split("T")[0] >= ts
  );
  const dueToday = pendingAssignments.filter((a) => a.due_date.split("T")[0] === ts);
  const deadlinesCount = pendingAssignments.length + examSoon.length;

  // Attendance
  const attRecs = (attendance || []).slice(0, 20);
  const present = attRecs.filter((a) => a.status === "present").length;
  const attRate = attRecs.length ? present / attRecs.length : 1;
  const lowAttendance = attRecs.length >= 3 && attRate < 0.75;

  // Finances
  const feeList = fees || [];
  const overdueFees = feeList.filter((f) => f.status === "overdue");
  const pendingFees = feeList.filter((f) => f.status === "pending");
  const hasPayments = overdueFees.length > 0 || pendingFees.length > 0;

  // Messages
  const unreadCount = (conversations || []).reduce((s, c) => s + (c.unread_count || 0), 0);
  const hasUnread = unreadCount > 0;

  // Community
  const recentPosts = (posts || []).filter((p) => {
    const age = (Date.now() - new Date(p.created_date || Date.now())) / 3600000;
    return age < 24;
  }).length;

  // Weather
  const wx = weather.data;
  const wxScene = wx?.current?.scene;
  const hasWeatherAlert = (wx?.alerts || []).length > 0;
  const rainyWeather = ["rain", "heavy_rain", "drizzle", "thunderstorm"].includes(wxScene);

  const semester = user?.semester || null;
  const moodLow = LOW_MOODS.includes(mood);

  const signals = {
    tod, isWeekend, inExamWeek, nextExam, daysToExam,
    dueTodayCount: dueToday.length, deadlinesCount,
    lowAttendance, attRate,
    overdueFeesCount: overdueFees.length, pendingFeesCount: pendingFees.length, hasPayments,
    unreadCount, hasUnread,
    communityActivity: (posts || []).length, recentPosts,
    wxScene, hasWeatherAlert, rainyWeather,
    semester, mood, moodLow,
  };

  // Priority-ordered slots. Bud rearranges by context.
  const slots = [
    { key: "header", priority: 1000 },
    { key: "search", priority: 999 },
    { key: "briefing", priority: 980 },
  ];

  if (moodLow) slots.push({ key: "budWellness", priority: 95 });
  if (inExamWeek) slots.push({ key: "examCountdown", priority: 94 });
  if (rainyWeather || hasWeatherAlert) slots.push({ key: "weather", priority: 93 });
  if (lowAttendance) slots.push({ key: "attendance", priority: 91 });
  if (overdueFees.length) slots.push({ key: "fees", priority: 90 });
  if (dueToday.length) slots.push({ key: "today", priority: 88 });

  if (!slots.some((s) => s.key === "today"))
    slots.push({ key: "today", priority: { morning: 80, afternoon: 72, evening: 64, night: 58 }[tod] || 60 });

  slots.push({ key: "deadlines", priority: deadlinesCount >= 3 ? 86 : tod === "night" ? 66 : 54 });

  if (hasUnread) slots.push({ key: "messages", priority: isWeekend ? 78 : 62 });
  if (isWeekend || recentPosts >= 3) slots.push({ key: "community", priority: isWeekend ? 76 : 50 });
  if (!slots.some((s) => s.key === "weather"))
    slots.push({ key: "weather", priority: tod === "morning" ? 74 : 44 });
  if (hasPayments && !overdueFees.length) slots.push({ key: "fees", priority: 56 });

  slots.push({ key: "quickActions", priority: 40 });
  slots.push({ key: "academicSnapshot", priority: 35 });
  slots.push({ key: "bud", priority: 8 });

  slots.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  // Bud's proactive narration
  const reasons = [];
  if (inExamWeek && nextExam) reasons.push(`${nextExam.title} is in ${daysToExam}d`);
  if (dueToday.length) reasons.push(`${dueToday.length} due today`);
  if (deadlinesCount >= 3 && !dueToday.length) reasons.push(`${deadlinesCount} deadlines ahead`);
  if (rainyWeather) reasons.push("rain in your area");
  if (lowAttendance) reasons.push(`attendance at ${Math.round(attRate * 100)}%`);
  if (overdueFees.length) reasons.push(`${overdueFees.length} overdue fee${overdueFees.length > 1 ? "s" : ""}`);
  if (hasUnread) reasons.push(`${unreadCount} unread`);
  if (isWeekend) reasons.push("weekend mode");
  if (tod === "night") reasons.push("winding down");
  if (moodLow) reasons.push(`you seem ${mood}`);

  const budMessage = reasons.length
    ? `I've reshaped your dashboard — ${reasons.join(", ")}.`
    : "Your dashboard is tuned for the day. Tap to tell me how it's going.";

  return {
    signals,
    slots: slots.map((s) => s.key),
    budMessage,
    mood,
    setMood,
    MOODS,
    weather: wx,
    user, courses, assignments, exams, sessions, attendance, conversations, posts,
    pendingAssignments, dueToday, examSoon, nextExam, daysToExam,
  };
}
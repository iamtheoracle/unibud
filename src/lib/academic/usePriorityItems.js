import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * usePriorityItems — Bud's intelligent priority engine.
 *
 * Fetches real student data (assignments, exams, timetable, tasks, scholarships,
 * study sessions) and classifies each into Critical / High / Medium / Low
 * based on deadline proximity — never fabricates items.
 *
 * Returns { items, overdue, summary } where each item has:
 *  { id, source, source_type, title, subtitle, due_date, priority, reason }
 */
export function usePriorityItems() {
  const isOnline = useOnlineStatus();

  const { data: assignments } = useQuery({
    queryKey: ["priority", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 20),
    enabled: isOnline,
    staleTime: 60_000,
  });

  const { data: exams } = useQuery({
    queryKey: ["priority", "exams"],
    queryFn: () => base44.entities.Exam.list("-date", 10),
    enabled: isOnline,
    staleTime: 60_000,
  });

  const { data: timetable } = useQuery({
    queryKey: ["priority", "timetable"],
    queryFn: () => base44.entities.TimetableEntry.list("-created_date", 20),
    enabled: isOnline,
    staleTime: 60_000,
  });

  const { data: tasks } = useQuery({
    queryKey: ["priority", "tasks"],
    queryFn: () => base44.entities.TaskManagement.filter({ status: { $ne: "completed" } }, "-due_date", 20),
    enabled: isOnline,
    staleTime: 60_000,
  });

  const { data: scholarships } = useQuery({
    queryKey: ["priority", "scholarships"],
    queryFn: () => base44.entities.Scholarship.list("-created_date", 10),
    enabled: isOnline,
    staleTime: 60_000,
  });

  const { data: studySessions } = useQuery({
    queryKey: ["priority", "study_sessions"],
    queryFn: () => base44.entities.StudySession.list("-created_date", 10),
    enabled: isOnline,
    staleTime: 60_000,
  });

  const now = new Date();
  const todayStr = now.toDateString();
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

  const items = [];
  const overdue = [];

  // ── Assignments ──
  (assignments || []).forEach((a) => {
    if (!a.due_date) return;
    const due = new Date(a.due_date);
    const diff = due - now;
    const isOverdue = diff < 0 && !a.is_completed;
    const isToday = due.toDateString() === todayStr;
    let priority = "low";
    let reason = "";
    if (isToday) {
      priority = "critical";
      reason = "Due today";
    } else if (diff < THREE_DAYS && diff >= 0) {
      priority = "high";
      reason = `Due in ${Math.ceil(diff / (24 * 60 * 60 * 1000))} day(s)`;
    } else if (diff >= THREE_DAYS) {
      priority = "medium";
      reason = `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    if (isOverdue) {
      reason = `Overdue by ${Math.abs(Math.ceil(diff / (24 * 60 * 60 * 1000)))} day(s)`;
      overdue.push(buildItem(a, "assignment", priority, reason, due));
    } else {
      items.push(buildItem(a, "assignment", priority, reason, due));
    }
  });

  // ── Exams ──
  (exams || []).forEach((e) => {
    if (!e.date) return;
    const due = new Date(e.date);
    const diff = due - now;
    const isToday = due.toDateString() === todayStr;
    let priority = "low";
    let reason = "";
    if (isToday) {
      priority = "critical";
      reason = "Exam today";
    } else if (diff < THREE_DAYS && diff >= 0) {
      priority = "high";
      reason = `Exam in ${Math.ceil(diff / (24 * 60 * 60 * 1000))} day(s)`;
    } else if (diff >= THREE_DAYS) {
      priority = "medium";
      reason = `Exam on ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    if (diff >= 0 || isToday) {
      items.push(buildItem(e, "exam", priority, reason, due));
    }
  });

  // ── Timetable (classes starting soon) ──
  (timetable || []).forEach((t) => {
    if (!t.start_time || !t.day) return;
    const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const targetDay = typeof t.day === "string" ? dayMap[t.day.toLowerCase()] : null;
    if (targetDay === null) return;
    const classDate = new Date(now);
    const dayDiff = (targetDay - now.getDay() + 7) % 7;
    classDate.setDate(now.getDate() + dayDiff);
    const [h, m] = (t.start_time || "00:00").split(":").map(Number);
    classDate.setHours(h || 0, m || 0, 0, 0);
    const diff = classDate - now;
    if (diff < 0 || diff > THREE_DAYS) return;
    const isToday = dayDiff === 0;
    let priority = "medium";
    let reason = "";
    if (isToday && diff < 60 * 60 * 1000) {
      priority = "critical";
      reason = "Class starting soon";
    } else if (isToday) {
      priority = "high";
      reason = `Class today at ${t.start_time}`;
    } else {
      priority = "medium";
      reason = `Next class ${classDate.toLocaleDateString("en-US", { weekday: "short" })} ${t.start_time}`;
    }
    items.push({
      id: `tt_${t.id}`,
      source_id: t.id,
      source: "timetable",
      source_type: t.course_code || t.subject || "Class",
      title: t.course_code || t.subject || "Class",
      subtitle: `${t.lecturer || ""} ${t.location || ""}`.trim() || "Class session",
      due_date: classDate.toISOString(),
      priority,
      reason,
    });
  });

  // ── Tasks ──
  (tasks || []).forEach((t) => {
    const due = t.due_date ? new Date(t.due_date) : null;
    if (!due) {
      items.push(buildItem(t, "task", "low", "Personal task", null));
      return;
    }
    const diff = due - now;
    const isOverdue = diff < 0 && t.status !== "completed";
    const isToday = due.toDateString() === todayStr;
    let priority = "low";
    let reason = "";
    if (isToday) {
      priority = "critical";
      reason = "Due today";
    } else if (diff < THREE_DAYS && diff >= 0) {
      priority = "high";
      reason = `Due in ${Math.ceil(diff / (24 * 60 * 60 * 1000))} day(s)`;
    } else if (diff >= THREE_DAYS) {
      priority = "medium";
      reason = `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    if (isOverdue) {
      reason = `Overdue by ${Math.abs(Math.ceil(diff / (24 * 60 * 60 * 1000)))} day(s)`;
      overdue.push(buildItem(t, "task", priority, reason, due));
    } else {
      items.push(buildItem(t, "task", priority, reason, due));
    }
  });

  // ── Scholarships ──
  (scholarships || []).forEach((s) => {
    const deadline = s.deadline || s.application_deadline || s.closing_date;
    if (!deadline) return;
    const due = new Date(deadline);
    const diff = due - now;
    if (diff < 0) return;
    const isToday = due.toDateString() === todayStr;
    let priority = "low";
    let reason = "";
    if (isToday) {
      priority = "critical";
      reason = "Scholarship deadline today";
    } else if (diff < THREE_DAYS) {
      priority = "high";
      reason = `Scholarship deadline in ${Math.ceil(diff / (24 * 60 * 60 * 1000))} day(s)`;
    } else {
      priority = "medium";
      reason = `Deadline ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    items.push(buildItem(s, "scholarship", priority, reason, due));
  });

  // ── Study sessions (medium) ──
  (studySessions || []).forEach((s) => {
    const sessionDate = s.session_date || s.started_at || s.scheduled_at;
    if (!sessionDate) return;
    const due = new Date(sessionDate);
    const diff = due - now;
    if (diff < 0 || diff > 7 * 24 * 60 * 60 * 1000) return;
    items.push(buildItem(s, "study_session", "medium", "Upcoming study session", due));
  });

  // Sort: critical first, then high, medium, low — within each by due_date
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  items.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.due_date || Date.now()) - new Date(b.due_date || Date.now());
  });

  const summary = {
    critical: items.filter((i) => i.priority === "critical").length,
    high: items.filter((i) => i.priority === "high").length,
    medium: items.filter((i) => i.priority === "medium").length,
    low: items.filter((i) => i.priority === "low").length,
    overdue: overdue.length,
    total: items.length + overdue.length,
  };

  return { items, overdue, summary, isOnline };
}

function buildItem(entity, source, priority, reason, dueDate) {
  return {
    id: `${source}_${entity.id}`,
    source_id: entity.id,
    source,
    source_type: entity.course_code || entity.subject || entity.title || source,
    title: entity.title || entity.name || entity.course_code || "Untitled",
    subtitle: entity.description || entity.subject || entity.course_code || "",
    due_date: dueDate ? dueDate.toISOString() : null,
    priority,
    reason,
  };
}
import { base44 } from "@/api/base44Client";

/** unifiedTimeline — aggregates academic + collaboration events into one
 *  timeline, detects scheduling conflicts, and suggests available
 *  collaboration slots based on member availability. */

export async function fetchUnifiedTimeline(user) {
  if (!user) return { events: [], conflicts: [], slots: [] };
  try {
    const [assignments, exams, events, campus, timetable, courses] = await Promise.all([
      base44.entities.Assignment.list(100).catch(() => []),
      base44.entities.Exam.list(50).catch(() => []),
      base44.entities.CalendarEvent.list(100).catch(() => []),
      base44.entities.CampusEvent.list(50).catch(() => []),
      base44.entities.TimetableEntry.list(100).catch(() => []),
      base44.entities.Course.list(50).catch(() => []),
    ]);

    const ev = [];
    const today = new Date().toISOString().slice(0, 10);

    assignments.forEach((a) => { const d = a.due_date || a.deadline; if (d) ev.push({ id: a.id, date: d, time: a.due_time || "23:59", title: a.title, type: "assignment", source: "Academics", color: "0 78% 52%" }); });
    exams.forEach((e) => { const d = e.date || e.start_time?.slice(0, 10); if (d) ev.push({ id: e.id, date: d, time: e.start_time || "09:00", title: e.title || e.course_title, type: "exam", source: "Academics", color: "46 70% 50%" }); });
    events.forEach((e) => { const d = (e.start_date || e.date || "").slice(0, 10); if (d >= today) ev.push({ id: e.id, date: d, time: e.start_time || "00:00", title: e.title, type: "personal", source: "Calendar", color: "221 83% 50%" }); });
    campus.forEach((e) => { const d = (e.start_date || e.date || "").slice(0, 10); if (d >= today) ev.push({ id: e.id, date: d, time: e.start_time || "00:00", title: e.title, type: "campus", source: "Campus", color: "198 88% 42%" }); });
    timetable.forEach((t) => { if (t.day || t.date) ev.push({ id: t.id, date: t.date || nextWeekday(t.day), time: t.start_time || "08:00", title: `${t.course_code || t.title} — ${t.type || "Lecture"}`, type: t.type?.toLowerCase() || "lecture", source: "Timetable", color: "173 75% 38%" }); });
    courses.forEach((c) => { if (c.exam_date) ev.push({ id: c.id, date: c.exam_date, time: c.exam_time || "09:00", title: `${c.code || c.title} Exam`, type: "exam", source: "Course", color: "46 70% 50%" }); });

    ev.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const upcoming = ev.filter((e) => e.date >= today).slice(0, 40);
    return { events: upcoming, conflicts: detectConflicts(upcoming), slots: suggestSlots(upcoming) };
  } catch { return { events: [], conflicts: [], slots: [] }; }
}

export function detectConflicts(events) {
  const byDay = {};
  events.forEach((e) => { (byDay[e.date] = byDay[e.date] || []).push(e); });
  const conflicts = [];
  Object.entries(byDay).forEach(([date, list]) => {
    if (list.length > 1) {
      // simple time overlap: same time slot
      const byTime = {};
      list.forEach((e) => { (byTime[e.time] = byTime[e.time] || []).push(e); });
      Object.entries(byTime).forEach(([time, group]) => { if (group.length > 1) conflicts.push({ date, time, items: group }); });
    }
  });
  return conflicts;
}

export function suggestSlots(events) {
  // Suggest 3 upcoming weekday mornings/evenings that are free.
  const busy = new Set(events.map((e) => e.date));
  const slots = [];
  const d = new Date(); d.setHours(0,0,0,0);
  for (let i = 1; i <= 14 && slots.length < 3; i++) {
    const day = new Date(d.getTime() + i * 86400000);
    const ds = day.toISOString().slice(0, 10);
    if (busy.has(ds)) continue;
    slots.push({ date: ds, label: day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }), time: "10:00" });
  }
  return slots;
}

function nextWeekday(dayName) {
  const map = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const target = map[dayName];
  if (target == null) return new Date().toISOString().slice(0, 10);
  const d = new Date(); d.setHours(0,0,0,0);
  let diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Combine collaboration item due dates + milestones into timeline events. */
export function collabTimelineEvents(items = [], milestones = []) {
  const ev = [];
  items.forEach((i) => { if (i.due_date) ev.push({ id: i.id, date: i.due_date, time: "23:59", title: i.title, type: "team_task", source: "Workspace", color: "221 83% 50%" }); });
  milestones.forEach((m) => { if (m.date) ev.push({ id: m.id, date: m.date, time: "12:00", title: m.title, type: "milestone", source: "Workspace", color: "46 70% 50%" }); });
  return ev;
}
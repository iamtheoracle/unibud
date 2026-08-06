import { base44 } from "@/api/base44Client";

/** progress — pure analytics over collaboration items + academic data. */

export function computeProgress(items = []) {
  if (!items.length) return 0;
  const done = items.filter((i) => i.status === "done" || i.status === "approved").length;
  return Math.round((done / items.length) * 100);
}

export function completionByType(items = []) {
  const map = {};
  items.forEach((i) => {
    if (!map[i.type]) map[i.type] = { total: 0, done: 0 };
    map[i.type].total++;
    if (i.status === "done" || i.status === "approved") map[i.type].done++;
  });
  return Object.entries(map).map(([type, v]) => ({ type, ...v, pct: v.total ? Math.round((v.done / v.total) * 100) : 0 }));
}

export function completionByMember(items = [], members = []) {
  const map = {};
  members.forEach((m) => { map[m.user_id] = { name: m.name, total: 0, done: 0 }; });
  items.forEach((i) => {
    if (!i.assignee_id || !map[i.assignee_id]) return;
    map[i.assignee_id].total++;
    if (i.status === "done" || i.status === "approved") map[i.assignee_id].done++;
  });
  return Object.entries(map).map(([id, v]) => ({ id, ...v, pct: v.total ? Math.round((v.done / v.total) * 100) : 0 }));
}

export function weeklyProductivity(activity = []) {
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0); return d; });
  const buckets = days.map((d) => ({ date: d, label: ["S","M","T","W","T","F","S"][d.getDay()], count: 0 }));
  activity.forEach((a) => {
    const d = new Date(a.created_date); d.setHours(0,0,0,0);
    const idx = days.findIndex((x) => x.getTime() === d.getTime());
    if (idx >= 0) buckets[idx].count++;
  });
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return { buckets, max };
}

export function monthlyProductivity(activity = []) {
  const weeks = [...Array(4)].map((_, i) => ({ label: `W${i+1}`, count: 0 }));
  const now = new Date();
  activity.forEach((a) => {
    const d = new Date(a.created_date);
    const weeksAgo = Math.floor((now - d) / (7 * 24 * 3600 * 1000));
    if (weeksAgo >= 0 && weeksAgo < 4) weeks[3 - weeksAgo].count++;
  });
  const max = Math.max(1, ...weeks.map((w) => w.count));
  return { weeks, max };
}

/** Semester progress: fraction of the academic term elapsed, plus
 *  assignment + project completion drawn from academic entities. */
export function semesterProgress(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function overdueCount(items = []) {
  const today = new Date().toISOString().slice(0, 10);
  return items.filter((i) => i.due_date && i.due_date < today && i.status !== "done" && i.status !== "approved").length;
}

export function countdown(targetDate) {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, overdue: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins, overdue: false };
}

/** Fetch academic deadline counts for progress dashboard. */
export async function fetchAcademicProgress(user) {
  if (!user) return null;
  try {
    const [assignments, projects, exams] = await Promise.all([
      base44.entities.Assignment.list(200),
      base44.entities.Project.list(200),
      base44.entities.Exam.list(100),
    ]);
    const done = (arr) => arr.filter((x) => x.status === "done" || x.status === "submitted" || x.status === "completed").length;
    return {
      assignments: { total: assignments.length, done: done(assignments), pct: assignments.length ? Math.round((done(assignments) / assignments.length) * 100) : 0 },
      projects: { total: projects.length, done: done(projects), pct: projects.length ? Math.round((done(projects) / projects.length) * 100) : 0 },
      exams: { total: exams.length, done: done(exams), upcoming: exams.filter((e) => new Date(e.date || e.start_time || e.created_date) > new Date()).length },
    };
  } catch { return null; }
}
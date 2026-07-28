import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import {
  buildNotification, hoursUntil, shortWhen, dedupKey, inQuietHours,
  isCategoryMuted, applyBudTone, leadsFor,
} from "../../shared/notifications.ts";

const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100];

/** Consecutive-day streak ending today or yesterday (active streak). */
function computeStreak(dates) {
  const set = new Set((dates || []).filter(Boolean));
  if (set.size === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let anchor = set.has(today) ? today : set.has(yesterday) ? yesterday : null;
  if (!anchor) return 0;
  let streak = 0;
  let cur = anchor;
  while (set.has(cur)) {
    streak++;
    const d = new Date(cur);
    d.setDate(d.getDate() - 1);
    cur = d.toISOString().split("T")[0];
  }
  return streak;
}

/** Consecutive-day streak ending exactly at `anchor` (must be present). */
function streakEndingAt(dates, anchor) {
  const set = new Set((dates || []).filter(Boolean));
  if (!anchor || !set.has(anchor)) return 0;
  let streak = 0;
  let cur = anchor;
  while (set.has(cur)) {
    streak++;
    const d = new Date(cur);
    d.setDate(d.getDate() - 1);
    cur = d.toISOString().split("T")[0];
  }
  return streak;
}

function modeHour(isoList) {
  const counts = {};
  for (const iso of isoList || []) {
    if (!iso) continue;
    const h = new Date(iso).getHours();
    if (Number.isNaN(h)) continue;
    counts[h] = (counts[h] || 0) + 1;
  }
  let best = null, max = 0;
  for (const k in counts) { if (counts[k] > max) { max = counts[k]; best = Number(k); } }
  return best;
}

function formatHour(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}

function leadLabel(lead) {
  if (lead >= 168) return "Due in 7 days";
  if (lead >= 72) return "Due in 3 days";
  if (lead >= 24) return "Due tomorrow";
  if (lead >= 6) return "Due in 6 hours";
  return "Due in 1 hour";
}

/**
 * Bud Notification Engine — the single scheduled orchestrator that powers all
 * proactive, personalised student reminders. Runs hourly via the
 * "Bud Notification Engine" workflow. Each scanner is isolated so one failure
 * never aborts the run; all output is deduped, preference-aware and quiet-hours
 * aware. Preserves and extends the original per-category reminder logic.
 */
export default async function(req) {
  const startedAt = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const mode = body.mode || "hourly";

    // ----- preferences + recent notifications (for dedup) -----
    const [notifPrefs, reminderPrefs, recent] = await Promise.all([
      base44.asServiceRole.entities.NotificationPreference.list("-created_date", 500).catch(() => []),
      base44.asServiceRole.entities.ReminderPreference.list("-created_date", 500).catch(() => []),
      base44.asServiceRole.entities.Notification.list("-created_date", 1000).catch(() => []),
    ]);
    const prefByUser = new Map();
    for (const p of notifPrefs || []) if (p.created_by_id) prefByUser.set(p.created_by_id, p);
    const dedupSet = new Set();
    for (const n of recent || []) {
      if (n.batch_key) dedupSet.add(n.batch_key + "::" + (n.user_id || "broadcast"));
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const weekday = WEEKDAY[now.getDay()];
    const stats = { mode, created: 0, skipped: 0, errors: [] };

    /** Emit a candidate notification through preference + dedup gates. */
    async function emit(c) {
      try {
        const uid = c.user_id;
        const prefs = uid ? (prefByUser.get(uid) || {}) : {};
        if (isCategoryMuted(prefs, c.category)) { stats.skipped++; return; }
        if (c.priority !== "critical" && inQuietHours(prefs, now)) { stats.skipped++; return; }
        const dkey = c.batch_key + "::" + (uid || "broadcast");
        if (dedupSet.has(dkey)) { stats.skipped++; return; }
        dedupSet.add(dkey);
        const message = applyBudTone(c.message, prefs.bud_tone);
        const notif = buildNotification({
          title: c.title, message, type: c.type || c.category, icon: c.icon || "Bell", link: c.link || "/",
        });
        await base44.asServiceRole.entities.Notification.create({
          ...notif, user_id: uid || null, category: c.category, priority: c.priority || "normal",
          batch_key: c.batch_key, source: "bud-engine",
        }).catch((e) => stats.errors.push("emit:" + (e?.message || e)));
        stats.created++;
      } catch (e) { stats.errors.push("emit:" + (e?.message || e)); }
    }

    // ===== 1. ASSIGNMENT DEADLINES (multi-lead + overdue) =====
    try {
      const assignments = await base44.asServiceRole.entities.Assignment.filter({ status: "pending" }, "-due_date", 400);
      for (const a of assignments || []) {
        if (!a.due_date || !a.created_by_id) continue;
        const h = hoursUntil(a.due_date);
        if (h === null) continue;
        const uid = a.created_by_id;
        const prefs = prefByUser.get(uid) || {};
        const leads = leadsFor(prefs).slice().sort((x, y) => y - x);
        if (h > 0) {
          for (let i = 0; i < leads.length; i++) {
            const lead = leads[i];
            const lower = i + 1 < leads.length ? leads[i + 1] : 0;
            if (h <= lead && h > lower) {
              await emit({
                user_id: uid, category: "assignment",
                priority: lead <= 6 ? "high" : "normal",
                batch_key: dedupKey("assignment", a.id, lead),
                title: `${leadLabel(lead)}: ${a.title}`,
                message: `${a.course_code || "Course"} — due ${shortWhen(a.due_date, true)}${a.priority === "high" ? " · High priority" : ""}.`,
                type: "academic", icon: "ClipboardList", link: "/assignments",
              });
              break;
            }
          }
        }
        if (h < 0 && h > -48) {
          await emit({
            user_id: uid, category: "assignment", priority: "high",
            batch_key: dedupKey("assignment", a.id, "overdue"),
            title: `Overdue: ${a.title}`,
            message: `${a.course_code || "Course"} was due ${shortWhen(a.due_date, true)}. Bud can help you finish it — want a quick plan?`,
            type: "academic", icon: "ClipboardList", link: "/assignments",
          });
        }
      }
    } catch (e) { stats.errors.push("assignments:" + (e?.message || e)); }

    // ===== 4. EXAMINATION NOTIFICATIONS (countdown + revision) =====
    try {
      const exams = await base44.asServiceRole.entities.Exam.filter({ status: "upcoming" }, "date", 400);
      for (const e of exams || []) {
        if (!e.date || !e.created_by_id) continue;
        const days = Math.ceil((new Date(e.date).getTime() - now.getTime()) / 86400000);
        if (days < 0 || days > 7) continue;
        const uid = e.created_by_id;
        const band = days <= 1 ? 1 : days <= 3 ? 3 : 7;
        await emit({
          user_id: uid, category: "exam",
          priority: days <= 1 ? "high" : "normal",
          batch_key: dedupKey("exam", e.id, band),
          title: days <= 1 ? `Exam tomorrow: ${e.course_code}` : `Exam in ${days} days: ${e.course_code}`,
          message: `${e.title} (${e.type || "exam"}) — ${shortWhen(e.date)}${e.location ? ` · ${e.location}` : ""}${e.start_time ? ` · ${e.start_time}` : ""}.${days <= 3 ? " Time to revise." : ""}`,
          type: "academic", icon: "GraduationCap", link: "/exams",
        });
        if (typeof e.revision_progress === "number" && e.revision_progress < 50) {
          await emit({
            user_id: uid, category: "exam", priority: "normal",
            batch_key: dedupKey("exam-revision", e.id, today),
            title: `Revision check: ${e.course_code}`,
            message: `Your ${e.course_code} exam is in ${days} day${days === 1 ? "" : "s"} and revision is at ${Math.round(e.revision_progress)}%. A focused session today would lift your readiness.`,
            type: "academic", icon: "BookOpen", link: "/exams",
          });
        }
      }
    } catch (e) { stats.errors.push("exams:" + (e?.message || e)); }

    // ===== 3. TIMETABLE — upcoming class today =====
    try {
      const entries = await base44.asServiceRole.entities.TimetableEntry.list("-created_date", 800);
      const curMin = now.getHours() * 60 + now.getMinutes();
      for (const t of entries || []) {
        if (!t.created_by_id || !t.start_time || t.day !== weekday) continue;
        const [sh, sm] = String(t.start_time).split(":").map(Number);
        const diff = sh * 60 + sm - curMin;
        if (diff < 0 || diff > 45) continue;
        await emit({
          user_id: t.created_by_id, category: "timetable", priority: "normal",
          batch_key: dedupKey("timetable", t.id, today + "-" + t.start_time),
          title: `Up next: ${t.course_code}`,
          message: `${t.course_title || t.course_code}${t.location ? ` · ${t.location}` : ""}${t.lecturer ? ` · ${t.lecturer}` : ""} — starts ${t.start_time}.`,
          type: "timetable", icon: "Clock", link: "/timetable",
        });
      }
    } catch (e) { stats.errors.push("timetable:" + (e?.message || e)); }

    // ===== 6. CAMPUS EVENTS — today / tomorrow =====
    try {
      const events = await base44.asServiceRole.entities.CampusEvent.filter({ status: "upcoming" }, "date", 200);
      const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
      for (const ev of events || []) {
        if (!ev.date) continue;
        const isToday = ev.date === today;
        if (!isToday && ev.date !== tomorrow) continue;
        await emit({
          category: "campus", priority: isToday ? "high" : "normal",
          batch_key: dedupKey("event", ev.id, ev.date),
          title: `${isToday ? "Today" : "Tomorrow"}: ${ev.title}`,
          message: `${ev.type ? ev.type.replace(/_/g, " ") : "Event"}${ev.location ? ` · ${ev.location}` : ""}${ev.organizer_name ? ` · ${ev.organizer_name}` : ""} — ${shortWhen(ev.date, true)}.`,
          type: "campus", icon: "CalendarDays", link: "/events",
        });
      }
    } catch (e) { stats.errors.push("events:" + (e?.message || e)); }

    // ===== 2 + 9. STUDY STREAKS + BUD SMART NUDGES =====
    try {
      const sessions = await base44.asServiceRole.entities.StudySession.list("-session_date", 1000);
      const byUser = new Map();
      for (const s of sessions || []) {
        const uid = s.created_by_id;
        if (!uid) continue;
        if (!byUser.has(uid)) byUser.set(uid, []);
        byUser.get(uid).push(s);
      }
      const assignmentsAll = await base44.asServiceRole.entities.Assignment.filter({ status: "pending" }, "-due_date", 400).catch(() => []);
      const dueByUser = new Map();
      for (const a of assignmentsAll || []) {
        if (!a.created_by_id || !a.due_date) continue;
        const h = hoursUntil(a.due_date);
        if (h === null || h < 0 || h > 168) continue;
        if (!dueByUser.has(a.created_by_id)) dueByUser.set(a.created_by_id, []);
        dueByUser.get(a.created_by_id).push(a);
      }

      for (const [uid, userSessions] of byUser) {
        const prefs = prefByUser.get(uid) || {};
        const freq = prefs.reminder_frequency || "balanced";
        const dates = userSessions.map((s) => s.session_date).filter(Boolean);
        const loggedToday = dates.includes(today);
        const streak = computeStreak(dates);

        // Daily streak reminder — gentle, only balanced/frequent, not if already studied today
        if (!loggedToday && freq !== "minimal") {
          await emit({
            user_id: uid, category: "streak", priority: "low",
            batch_key: dedupKey("streak-daily", uid, today),
            title: streak > 0 ? `Keep your ${streak}-day streak going` : `Time for a study session?`,
            message: streak > 0
              ? `You've studied ${streak} day${streak === 1 ? "" : "s"} in a row. A short session today keeps it alive.`
              : `You haven't logged a study session today. Even 25 focused minutes counts.`,
            type: "achievement", icon: "Flame", link: "/study",
          });
        }

        // Milestone celebration
        if (loggedToday && STREAK_MILESTONES.includes(streak)) {
          await emit({
            user_id: uid, category: "streak", priority: "normal",
            batch_key: dedupKey("streak-milestone", uid, streak),
            title: `${streak}-day streak!`,
            message: streak >= 30 ? `Incredible — ${streak} days of consistent studying. That's a habit worth celebrating.`
              : streak >= 7 ? `A full week of showing up. That consistency is something.`
              : `Three days in a row — the streak is real now.`,
            type: "achievement", icon: "Trophy", link: "/me",
          });
        }

        // Streak recovery — broke yesterday but had a >=3 run ending two days ago
        if (!loggedToday && !dates.includes(yesterday)) {
          const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];
          const priorStreak = streakEndingAt(dates, twoDaysAgo);
          if (priorStreak >= 3 && freq !== "minimal") {
            await emit({
              user_id: uid, category: "streak", priority: "low",
              batch_key: dedupKey("streak-recovery", uid, today),
              title: `Pick the streak back up`,
              message: `You had a ${priorStreak}-day streak going. A session today starts a fresh one — no pressure, just momentum.`,
              type: "achievement", icon: "Flame", link: "/study",
            });
          }
        }

        // Weekly study summary (Sundays only)
        if (now.getDay() === 0) {
          const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
          const weekSessions = userSessions.filter((s) => s.session_date && s.session_date >= weekAgo);
          const totalMin = weekSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
          if (weekSessions.length > 0) {
            await emit({
              user_id: uid, category: "streak", priority: "low",
              batch_key: dedupKey("streak-weekly", uid, weekAgo),
              title: `Your study week`,
              message: `${weekSessions.length} session${weekSessions.length === 1 ? "" : "s"}, ${Math.round((totalMin / 60) * 10) / 10} hours this week. Streak: ${streak} days. ${streak > 0 ? "Nice rhythm." : "Fresh start next week."}`,
              type: "achievement", icon: "BarChart3", link: "/study",
            });
          }
        }

        // Bud smart: usual study time
        const startTimes = userSessions.map((s) => s.started_at).filter(Boolean);
        const mh = modeHour(startTimes);
        if (mh !== null && !loggedToday && freq !== "minimal" && Math.abs(mh - now.getHours()) <= 1) {
          await emit({
            user_id: uid, category: "bud", priority: "low",
            batch_key: dedupKey("bud-usual-time", uid, today),
            title: `You usually study around ${formatHour(mh)}`,
            message: `Bud noticed you tend to focus best around ${formatHour(mh)}. Ready to continue the habit?`,
            type: "bud", icon: "Sparkles", link: "/study",
          });
        }

        // Bud smart: weekly deadlines load
        const myDue = dueByUser.get(uid) || [];
        if (myDue.length >= 3) {
          await emit({
            user_id: uid, category: "bud", priority: "normal",
            batch_key: dedupKey("bud-deadlines-week", uid, today),
            title: `${myDue.length} deadlines this week`,
            message: `You have ${myDue.length} assignments due in the next 7 days. Pacing them across the week beats an all-nighter. Want a plan?`,
            type: "bud", icon: "Sparkles", link: "/assignments",
          });
        }
      }
    } catch (e) { stats.errors.push("streaks:" + (e?.message || e)); }

    return Response.json({ status: "success", ...stats, durationMs: Date.now() - startedAt });
  } catch (error) {
    return Response.json({ status: "error", error: error.message }, { status: 500 });
  }
}
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import {
  buildNotification, dedupKey, alreadyNotified, mergePrefs, categoryEnabled,
  shouldDeliverNow, stageAllowed, currentStage, stageLabel, budPhrase,
  hoursUntil, shortWhen,
  ASSIGNMENT_STAGES, EXAM_STAGES, TASK_STAGES, EVENT_STAGES, CAREER_STAGES,
} from "../../shared/notifications.ts";

const TZ = "Africa/Lagos";
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100];

/** Local YYYY-MM-DD for the given timezone. */
function localDateStr(timezone = TZ) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** ISO-ish week key (Monday date) for weekly dedup. */
function weekKey(timezone = TZ) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

/** Consecutive-day streak ending today or yesterday from a list of ISO dates. */
function computeStreak(dates) {
  const unique = [...new Set((dates || []).filter(Boolean))].sort().reverse();
  if (unique.length === 0) return 0;
  const today = localDateStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 0;
  let check = unique[0];
  for (const d of unique) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().slice(0, 10);
    } else if (d < check) {
      break;
    }
  }
  return streak;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const [
      prefsList, recentNotifs, assignments, tasks, exams, events,
      trackers, sessions, timetable,
    ] = await Promise.all([
      base44.asServiceRole.entities.NotificationPreference.list("-created_date", 500).catch(() => []),
      base44.asServiceRole.entities.Notification.list("-created_date", 400).catch(() => []),
      base44.asServiceRole.entities.Assignment.filter({ status: "pending" }, "-due_date", 200).catch(() => []),
      base44.asServiceRole.entities.TaskManagement.list("-due_date", 500).catch(() => []),
      base44.asServiceRole.entities.Exam.filter({ status: "upcoming" }, "date", 200).catch(() => []),
      base44.asServiceRole.entities.CampusEvent.filter({ status: "upcoming" }, "date", 200).catch(() => []),
      base44.asServiceRole.entities.ApplicationTracker.list("-created_date", 300).catch(() => []),
      base44.asServiceRole.entities.StudySession.list("-session_date", 600).catch(() => []),
      base44.asServiceRole.entities.TimetableEntry.list("day", 300).catch(() => []),
    ]);

    const prefsByUser = new Map();
    for (const p of prefsList || []) prefsByUser.set(p.created_by_id, mergePrefs(p));
    const prefOf = (uid) => prefsByUser.get(uid) || mergePrefs(null);

    const createdKeys = new Set();
    const stats = { assignments: 0, tasks: 0, exams: 0, events: 0, career: 0, streaks: 0, classes: 0, smart: 0, skipped: 0 };

    /** Deliver a pref-aware, dedup-safe notification to a user. */
    const deliver = (uid, notif, category, priority = "normal") => {
      const prefs = prefOf(uid);
      if (!categoryEnabled(prefs, category)) { stats.skipped++; return false; }
      if (!shouldDeliverNow(prefs, TZ, priority)) { stats.skipped++; return false; }
      const key = notif.dedup_key;
      const uk = `${uid}|${key}`;
      if (key && (createdKeys.has(uk) || alreadyNotified(recentNotifs, uid, key))) {
        stats.skipped++;
        return false;
      }
      if (key) createdKeys.add(uk);
      base44.asServiceRole.entities.Notification.create({ ...notif, user_id: uid }).catch(() => {});
      return true;
    };

    // ── Assignment deadlines (7d / 3d / 24h / 6h / 1h / overdue) ──
    for (const a of assignments || []) {
      const uid = a.created_by_id;
      if (!uid) continue;
      const h = hoursUntil(a.due_date);
      if (h === null) continue;
      const overdue = h < 0;
      const stage = currentStage(h, ASSIGNMENT_STAGES, 0.5);
      if (!overdue && (stage === null || !stageAllowed(prefOf(uid), stage))) continue;

      let title, message, priority, action, stageKey;
      if (overdue) {
        stageKey = "overdue"; action = "overdue"; priority = "high";
        title = `Overdue: ${a.title}`;
        message = budPhrase(prefOf(uid),
          `${a.course_code || "Course"} — was due ${shortWhen(a.due_date, true)}. Whenever you're ready, let's get this in.`,
          `${a.course_code || "Course"} — overdue since ${shortWhen(a.due_date, true)}. You've got this — let's finish it.`,
          `Overdue: ${a.course_code || "Course"}, due ${shortWhen(a.due_date, true)}. Submit now.`);
      } else {
        stageKey = String(stage); action = stageKey;
        priority = stage <= 6 ? "high" : "normal";
        const label = stageLabel(stage);
        title = stage <= 1 ? `Due in 1 hour: ${a.title}` : stage === 24 ? `Due tomorrow: ${a.title}` : `Due in ${label}: ${a.title}`;
        message = `${a.course_code || "Course"}${a.priority === "high" ? " · High priority" : ""}`;
      }
      const key = dedupKey("assignment", a.id, stageKey);
      if (deliver(uid, buildNotification({ title, message, type: "academic", category: "assignment", icon: "ClipboardList", link: "/assignments", source: "bud-reminders", action, dedup_key: key, priority }), "assignment", priority)) stats.assignments++;
    }

    // ── Task deadlines (24h / 6h / 1h / overdue) ──
    for (const t of tasks || []) {
      if (!t.due_date || ["completed", "approved", "archived", "rejected"].includes(t.status)) continue;
      const assignees = t.assignee_ids || [];
      if (assignees.length === 0) continue;
      const h = hoursUntil(t.due_date + "T23:59:59");
      if (h === null) continue;
      const overdue = h < 0;
      const stage = currentStage(h, TASK_STAGES, 0.5);
      for (const uid of assignees) {
        if (!overdue && (stage === null || !stageAllowed(prefOf(uid), stage))) continue;
        let title, message, priority, action, stageKey;
        if (overdue) {
          stageKey = "overdue"; action = "overdue"; priority = "high";
          title = `Task overdue: ${t.title}`;
          message = `Was due ${shortWhen(t.due_date)}${t.priority === "urgent" ? " · Urgent" : ""}`;
        } else {
          stageKey = String(stage); action = stageKey;
          priority = stage <= 6 ? "high" : "normal";
          const label = stageLabel(stage);
          title = stage <= 1 ? `Task due in 1 hour: ${t.title}` : stage === 24 ? `Task due tomorrow: ${t.title}` : `Task due in ${label}: ${t.title}`;
          message = t.priority === "urgent" ? "Urgent" : t.priority === "high" ? "High priority" : "Tap to open";
        }
        const key = dedupKey("task", t.id, stageKey);
        if (deliver(uid, buildNotification({ title, message, type: "task", category: "assignment", icon: "CheckSquare", link: `/tasks/${t.id}`, source: "bud-reminders", action, dedup_key: key, priority }), "assignment", priority)) stats.tasks++;
      }
    }

    // ── Exam countdown (7d / 3d revision / 24h materials / 2h) ──
    for (const e of exams || []) {
      const h = hoursUntil(e.date);
      if (h === null || h < 0) continue;
      const stage = currentStage(h, EXAM_STAGES, 0.5);
      if (stage === null || !stageAllowed(prefOf(e.created_by_id), stage)) continue;
      const uid = e.created_by_id;
      let title, message, priority = "high", action;
      const label = stage >= 24 ? stageLabel(stage) : stage === 2 ? "2 hours" : stageLabel(stage);
      if (stage === 72) {
        title = `Exam in 3 days: ${e.course_code}`;
        message = `${e.title} — a good time to start revision.`;
        action = "revision";
      } else if (stage === 24) {
        title = `Exam tomorrow: ${e.course_code}`;
        message = `${e.title}${e.location ? ` · ${e.location}` : ""}${e.start_time ? ` · ${e.start_time}` : ""}. Gather your materials tonight.`;
        action = "materials";
      } else if (stage === 2) {
        title = `Exam in 2 hours: ${e.course_code}`;
        message = `${e.title}${e.location ? ` · ${e.location}` : ""}. You're ready.`;
        action = "countdown";
      } else {
        title = `Exam in ${label}: ${e.course_code}`;
        message = `${e.title} (${e.type || "exam"}) — ${shortWhen(e.date)}`;
        action = "countdown";
      }
      const key = dedupKey("exam", e.id, String(stage));
      if (deliver(uid, buildNotification({ title, message, type: "academic", category: "exam", icon: "GraduationCap", link: "/exams", source: "bud-reminders", action, dedup_key: key, priority }), "exam", priority)) stats.exams++;
    }

    // ── Timetable / class reminders (next class within the hour) ──
    const loc = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour12: false, weekday: "long", hour: "2-digit", minute: "2-digit" });
  const lp = {};
  for (const p of loc.formatToParts(new Date())) lp[p.type] = p.value;
  const locMinutes = (parseInt(lp.hour, 10) % 24) * 60 + parseInt(lp.minute, 10);
  const todayDate = localDateStr();
    for (const entry of timetable || []) {
      const uid = entry.created_by_id;
      if (!uid || !entry.start_time) continue;
      if (entry.day !== lp.weekday) continue;
      const [sh, sm] = entry.start_time.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const mts = startMin - locMinutes;
      if (mts < 0 || mts > 60) continue;
      const key = dedupKey("class", entry.id, todayDate);
      const when = mts <= 5 ? "now" : `in ${mts} min`;
      const title = `${when === "now" ? "Starting now" : `Class in ${mts} min`}: ${entry.course_code || entry.course_title}`;
      const message = `${entry.course_title || ""}${entry.location ? ` · ${entry.location}` : ""}${entry.lecturer ? ` · ${entry.lecturer}` : ""}${entry.type && entry.type !== "lecture" ? ` · ${entry.type}` : ""}`;
      if (deliver(uid, buildNotification({ title, message, type: "timetable", category: "class", icon: "Clock", link: "/timetable", source: "bud-reminders", action: "upcoming_class", dedup_key: key, priority: mts <= 15 ? "high" : "normal" }), "class", mts <= 15 ? "high" : "normal")) stats.classes++;
    }

    // ── Campus events (24h / 1h before) ──
    for (const ev of events || []) {
      const h = hoursUntil(ev.date);
      if (h === null || h < 0) continue;
      const stage = currentStage(h, EVENT_STAGES, 0.5);
      if (stage === null) continue;
      const uid = ev.created_by_id;
      if (!stageAllowed(prefOf(uid), stage)) continue;
      const title = stage === 1 ? `Starting in 1 hour: ${ev.title}` : `Tomorrow: ${ev.title}`;
      const message = `${ev.type ? ev.type.replace(/_/g, " ") : "Event"}${ev.location ? ` · ${ev.location}` : ""}${ev.organizer_name ? ` · ${ev.organizer_name}` : ""}`;
      const key = dedupKey("event", ev.id, String(stage));
      if (deliver(uid, buildNotification({ title, message, type: "social", category: "campus", icon: "CalendarDays", link: "/events", source: "bud-reminders", action: String(stage), dedup_key: key, priority: stage === 1 ? "high" : "normal" }), "campus", stage === 1 ? "high" : "normal")) stats.events++;
    }

    // ── Career / opportunity application deadlines (3d / 1d) ──
    for (const t of trackers || []) {
      const uid = t.created_by_id;
      if (!uid || !t.deadline) continue;
      if (["offered", "rejected", "withdrawn"].includes(t.status)) continue;
      const h = hoursUntil(t.deadline + "T23:59:59");
      if (h === null || h < 0) continue;
      const stage = currentStage(h, CAREER_STAGES, 0.5);
      if (stage === null || !stageAllowed(prefOf(uid), stage)) continue;
      const title = stage <= 24 ? `Deadline tomorrow: ${t.opportunity_title}` : `Deadline in 3 days: ${t.opportunity_title}`;
      const message = `${(t.type || "opportunity").replace(/_/g, " ")}${t.organization ? ` · ${t.organization}` : ""}`;
      const key = dedupKey("career", t.id, String(stage));
      if (deliver(uid, buildNotification({ title, message, type: "opportunity", category: "career", icon: "Briefcase", link: "/opportunities", source: "bud-reminders", action: String(stage), dedup_key: key, priority: stage <= 24 ? "high" : "normal" }), "career", stage <= 24 ? "high" : "normal")) stats.career++;
    }

    // ── Study streaks + smart Bud nudges ──
    const sessionsByUser = new Map();
    for (const s of sessions || []) {
      const uid = s.created_by_id;
      if (!uid) continue;
      if (!sessionsByUser.has(uid)) sessionsByUser.set(uid, []);
      sessionsByUser.get(uid).push(s);
    }

    // Count this week's deadlines per user (for the "3 deadlines this week" nudge)
    const weekDeadlineCount = new Map();
    const addDeadline = (uid) => weekDeadlineCount.set(uid, (weekDeadlineCount.get(uid) || 0) + 1);
    for (const a of assignments || []) { if (a.created_by_id && hoursUntil(a.due_date) !== null && hoursUntil(a.due_date) >= -24 && hoursUntil(a.due_date) <= 168) addDeadline(a.created_by_id); }
    for (const t of tasks || []) { if (t.due_date && !["completed","approved","archived","rejected"].includes(t.status)) for (const uid of (t.assignee_ids || [])) { const h = hoursUntil(t.due_date + "T23:59:59"); if (h !== null && h >= -24 && h <= 168) addDeadline(uid); } }
    for (const e of exams || []) { if (e.created_by_id) { const h = hoursUntil(e.date); if (h !== null && h >= 0 && h <= 168) addDeadline(e.created_by_id); } }

    for (const [uid, userSessions] of sessionsByUser.entries()) {
      const prefs = prefOf(uid);
      if (!categoryEnabled(prefs, "streak") && !categoryEnabled(prefs, "ai")) continue;

      const dates = userSessions.map((s) => s.session_date);
      const streak = computeStreak(dates);
      const loggedToday = dates.includes(todayDate);

      // Milestone celebration
      if (loggedToday && STREAK_MILESTONES.includes(streak) && categoryEnabled(prefs, "streak")) {
        const key = dedupKey("streak", "milestone", uid, String(streak));
        if (deliver(uid, buildNotification({
          title: `${streak}-day streak!`,
          message: streak >= 30 ? `Incredible — ${streak} days of consistent studying. That's a habit worth celebrating.` : streak >= 7 ? `A full week of showing up. That consistency is something.` : `Three days in a row — the streak is real now.`,
          type: "achievement", category: "streak", icon: "Trophy", link: "/me", source: "bud-reminders", action: "milestone", dedup_key: key, priority: "normal",
        }), "streak", "normal")) stats.streaks++;
      }

      // Daily "haven't studied today" recovery nudge (only if streak at risk)
      if (!loggedToday && streak > 0 && categoryEnabled(prefs, "streak")) {
        const hr = parseInt(lp.hour, 10) % 24;
        const studyEndHr = prefs.study_hours_end ? parseInt(prefs.study_hours_end, 10) : 20;
        if (hr >= studyEndHr) {
          const key = dedupKey("streak", "recovery", uid, todayDate);
          if (deliver(uid, buildNotification({
            title: "Your streak is about to end",
            message: budPhrase(prefs,
              `You studied ${streak} days in a row. There's still time to keep it going.`,
              `Your ${streak}-day streak is calling — even a short session counts.`,
              `${streak}-day streak at risk. Log a session now.`),
            type: "reminder", category: "streak", icon: "Flame", link: "/study", source: "bud-reminders", action: "streak_recovery", dedup_key: key, priority: "normal",
          }), "streak", "normal")) stats.streaks++;
        }
      }

      // "You usually study at X" nudge based on session time-of-day mode
      if (!loggedToday && categoryEnabled(prefs, "ai")) {
        const hr = parseInt(lp.hour, 10) % 24;
        const modeHr = computeStudyHour(userSessions);
        if (modeHr !== null && hr === modeHr) {
          const key = dedupKey("smart", "studytime", uid, todayDate);
          const tlabel = formatHour(modeHr);
          if (deliver(uid, buildNotification({
            title: "Your usual study time",
            message: budPhrase(prefs,
              `You usually study around ${tlabel}. Ready to continue?`,
              `It's ${tlabel} — your favourite time to study. Let's pick up where you left off.`,
              `Study time — ${tlabel}, as usual.`),
            type: "bud", category: "ai", icon: "Brain", link: "/study", source: "bud-reminders", action: "study_time", dedup_key: key, priority: "normal",
          }), "ai", "normal")) stats.smart++;
        }
      }

      // Weekly study summary (Sundays)
      if (lp.weekday === "Sunday" && categoryEnabled(prefs, "streak")) {
        const key = dedupKey("streak", "weekly", uid, weekKey());
        const weekCount = userSessions.filter((s) => {
          if (!s.session_date) return false;
          return (Date.now() - new Date(s.session_date).getTime()) < 7 * 86400000;
        }).length;
        if (deliver(uid, buildNotification({
          title: "Your week with Bud",
          message: budPhrase(prefs,
            `${weekCount} study session${weekCount === 1 ? "" : "s"} this week. ${weekCount >= 5 ? "A strong, steady rhythm." : weekCount > 0 ? "Nice rhythm — a little more next week?" : "Let's build a rhythm next week."}`,
            `${weekCount} sessions this week — every one counts. Onward.`,
            `Weekly summary: ${weekCount} session${weekCount === 1 ? "" : "s"}.`),
          type: "bud", category: "streak", icon: "BarChart3", link: "/me", source: "bud-reminders", action: "weekly_summary", dedup_key: key, priority: "low",
        }), "streak", "low")) stats.streaks++;
      }

      // "You have N deadlines this week"
      const dl = weekDeadlineCount.get(uid) || 0;
      if (dl >= 3 && categoryEnabled(prefs, "ai")) {
        const key = dedupKey("smart", "deadlines", uid, weekKey());
        if (deliver(uid, buildNotification({
          title: `${dl} deadlines this week`,
          message: budPhrase(prefs,
            `You have ${dl} deadlines this week. I can help you sequence them.`,
            `${dl} deadlines this week — let's map them out together.`,
            `${dl} deadlines this week. Plan now.`),
          type: "bud", category: "ai", icon: "CalendarClock", link: "/agenda", source: "bud-reminders", action: "deadline_summary", dedup_key: key, priority: "normal",
        }), "ai", "normal")) stats.smart++;
      }
    }

    return Response.json({
      status: "success",
      usersWithPrefs: prefsByUser.size,
      created: stats,
    });
  } catch (error) {
    console.error("budReminders error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/** Most common study hour (0-23) across a user's sessions, or null. */
function computeStudyHour(sessions) {
  const counts = new Array(24).fill(0);
  let total = 0;
  for (const s of sessions || []) {
    if (!s.session_date) continue;
    const d = new Date(s.session_date);
    if (Number.isNaN(d.getTime())) continue;
    counts[d.getHours()]++;
    total++;
  }
  if (total < 3) return null;
  let best = 0;
  for (let i = 1; i < 24; i++) if (counts[i] > counts[best]) best = i;
  return best;
}

function formatHour(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${ampm}`;
}
import { resolveFirstName } from "@/lib/userDisplayName";

/**
 * Adaptive Experience Engine (AEE) — Spark's core intelligence layer.
 *
 * Before building today's home, Spark evaluates the student's context
 * (time of day, weekday/weekend, exam period, weather, deadlines, fees,
 * messages, attendance, next lecture, workload, community activity) and
 * decides what deserves attention first — while preserving the user's
 * mental model of the app. Navigation never moves; content evolves.
 *
 * Pure functions, no side effects (greeting style is read from localStorage
 * so Bud can later adjust it as Spark learns the student's voice).
 */

// ── Adaptive greetings ── every phrase reads naturally as "{phrase}, {name}"
const GREETINGS = {
  morning: {
    formal: ["Good morning", "Good Morning"],
    warm:   ["Good morning", "Rise and shine", "Welcome back"],
    casual: ["Hey", "Morning", "Let's get things done", "Ready for today"],
  },
  afternoon: {
    formal: ["Good afternoon", "Good Afternoon"],
    warm:   ["Good afternoon", "Welcome back", "Hope you're doing well"],
    casual: ["Hey", "Afternoon", "Let's keep going"],
  },
  evening: {
    formal: ["Good evening", "Good Evening"],
    warm:   ["Good evening", "Welcome back", "Evening"],
    casual: ["Hey", "Yo", "Winding down"],
  },
  night: {
    formal: ["Good evening", "Still up"],
    warm:   ["Good evening", "Still up", "Late night"],
    casual: ["Hey", "Yo", "Up late"],
  },
};

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function readStyle() {
  try { return localStorage.getItem("aee.greetingStyle") || "warm"; } catch { return "warm"; }
}

/**
 * Build today's greeting. Rotates by day-of-year so each day feels fresh
 * but the greeting stays stable within a day. Always uses the resolved
 * profile first name — never a Gmail username.
 */
export function buildAdaptiveGreeting(ctx) {
  const firstName = resolveFirstName(ctx?.user);
  const tod = ctx?.timeOfDay || "morning";
  const style = readStyle();
  const group = GREETINGS[tod] || GREETINGS.morning;
  const pool = group[style] || group.warm;
  const salutation = pool[dayOfYear() % pool.length];
  return { salutation, text: `${salutation}, ${firstName}`, style };
}

/**
 * orchestrateHome — evaluate context → prioritised widget order + adaptive
 * mode, proactive Bud message, and today's greeting.
 */
export function orchestrateHome(ctx) {
  const scores = {
    weather: 5, today: 30, quickActions: 16, academics: 14,
    deadlines: 22, bud: 12, messages: 8, payments: 6, community: 6,
  };

  const tod = ctx.timeOfDay || "morning";

  // ── Experience mode (Academic | Social) ── content emphasis only.
  //    Navigation never moves; only what deserves attention shifts.
  const expMode = ctx.experienceMode || "academic";
  if (expMode === "social") {
    scores.community += 30; scores.messages += 22; scores.weather += 10; scores.today += 8; scores.bud += 4;
    scores.academics -= 30; scores.deadlines -= 26;
  } else {
    scores.academics += 10; scores.deadlines += 8; scores.today += 6;
  }

  // ── Exam period ──
  if (ctx.examWeek) { scores.deadlines += 30; scores.bud += 20; scores.academics += 10; }

  // ── Weather ──
  if (ctx.severeWeather) { scores.weather += 40; scores.today += 12; }
  else if (ctx.weatherAlerts?.length) { scores.weather += 12; }

  // ── Deadlines ──
  if (ctx.dueToday > 0) { scores.deadlines += 25; scores.today += 15; }
  else if (ctx.dueSoon > 0) { scores.deadlines += 12; }

  // ── Fees ──
  if (ctx.overdueFees > 0) { scores.payments += 35; }
  else if (ctx.upcomingPayments > 0) { scores.payments += 12; }

  // ── Messages ──
  if (ctx.unreadMessages > 3) { scores.messages += 22; }
  else if (ctx.unreadMessages > 0) { scores.messages += 8; }

  // ── Attendance ──
  if (ctx.attendanceRate != null && ctx.attendanceRate < 0.7) { scores.academics += 18; }

  // ── Weekend ──
  if (ctx.isWeekend && !ctx.examWeek) { scores.community += 16; scores.weather += 8; }

  // ── Time-of-day shaping ──
  if (tod === "morning") { scores.today += 8; scores.weather += 4; }
  if (tod === "afternoon") { scores.today += 6; scores.community += 6; scores.messages += 4; }
  if (tod === "evening") { scores.deadlines += 8; scores.community += 8; scores.bud += 6; }
  if (tod === "night") { scores.bud += 14; scores.deadlines += 6; }

  // ── Next lecture soon ──
  if (ctx.nextLectureIn != null && ctx.nextLectureIn <= 30) { scores.today += 20; }

  // ── Workload ──
  const workload = (ctx.dueToday || 0) + (ctx.examSoonCount || 0);
  if (workload >= 3) { scores.deadlines += 10; scores.bud += 8; }

  // ── Community activity ──
  if (ctx.communityActivity > 0) { scores.community += Math.min(ctx.communityActivity, 6); }

  const order = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

  // ── Active mode ──
  let mode = "Adaptive";
  let label = "Bud is adapting your dashboard";
  if (ctx.examWeek) { mode = "Exam Week"; label = "Exam Week mode"; }
  else if (ctx.severeWeather) { mode = "Weather Alert"; label = "Weather alert mode"; }
  else if (ctx.dueToday > 0) { mode = "Deadline Focus"; label = "Deadline focus mode"; }
  else if (ctx.overdueFees > 0) { mode = "Fees Due"; label = "Fees due mode"; }
  else if (ctx.isWeekend) { mode = "Weekend"; label = "Weekend mode"; }
  else if (tod === "night") { mode = "Evening Wind-down"; label = "Evening wind-down"; }
  else if (tod === "morning") { mode = "Morning Start"; label = "Morning start"; }
  else { mode = "Afternoon"; label = "Afternoon focus"; }

  // ── Bud proactively speaks before being asked ──
  let message;
  if (ctx.examWeek && ctx.nextExamDays != null) {
    message = `Your next exam is in ${ctx.nextExamDays} day${ctx.nextExamDays === 1 ? "" : "s"}. I've surfaced your deadlines and a focused study plan.`;
  } else if (ctx.nextLectureIn != null && ctx.nextLectureIn <= 30) {
    message = `Your next lecture starts in about ${ctx.nextLectureIn} minutes — I brought today's schedule up.`;
  } else if (ctx.dueToday > 0) {
    message = `You have ${ctx.dueToday} assignment${ctx.dueToday > 1 ? "s" : ""} due today. I moved deadlines to the top so nothing slips.`;
  } else if (ctx.severeWeather) {
    message = `Severe weather is nearby. Stay safe — I've prioritised campus alerts and today's plan.`;
  } else if (ctx.overdueFees > 0) {
    message = `You have ${ctx.overdueFees} overdue fee${ctx.overdueFees > 1 ? "s" : ""}. I brought payments forward so you can settle them.`;
  } else if (ctx.unreadMessages > 3) {
    message = `You have ${ctx.unreadMessages} unread messages waiting. I've moved messages up for you.`;
  } else if (ctx.isWeekend) {
    message = `It's the weekend — I've eased the pace and brought campus life to the top.`;
  } else if (tod === "night") {
    message = `Late night. Let's review tomorrow's plan and wind down gently.`;
  } else if (tod === "morning") {
    message = `Good morning. Here's your day, arranged for you.`;
  } else if (tod === "evening") {
    message = `Evening — I've lined up your deadlines and a few things to unwind with.`;
  } else {
    message = `Here's your dashboard, arranged for this afternoon.`;
  }

  // ── Mode-specific framing (additive) ──
  if (expMode === "social") {
    label = "Campus Life mode";
    if (!ctx.examWeek && !ctx.severeWeather && !ctx.overdueFees) {
      message = "Here's your campus life — friends, communities and what's happening, front and center.";
    }
  }

  const g = buildAdaptiveGreeting(ctx);
  return { mode, label, message, order, scores, greeting: g.salutation, greetingStyle: g.style };
}
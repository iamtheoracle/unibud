/**
 * orchestrateHome — Bud's predictive + recommendation layer.
 * Observes the context snapshot, predicts what the student needs now,
 * and recommends a prioritised widget order plus a proactive message.
 * Pure function — no side effects, easy to test.
 */
export function orchestrateHome(ctx) {
  const scores = {
    weather: 5,
    today: 30,
    quickActions: 16,
    academics: 14,
    deadlines: 22,
    bud: 12,
    messages: 8,
    payments: 6,
    community: 6,
  };

  // ── Predict + boost based on what Bud observes ──
  if (ctx.examWeek) {
    scores.deadlines += 30;
    scores.bud += 20;
    scores.academics += 10;
  }
  if (ctx.severeWeather) {
    scores.weather += 40;
    scores.today += 12;
  } else if (ctx.weatherAlerts.length) {
    scores.weather += 12;
  }
  if (ctx.dueToday > 0) {
    scores.deadlines += 25;
    scores.today += 15;
  } else if (ctx.dueSoon > 0) {
    scores.deadlines += 12;
  }
  if (ctx.overdueFees > 0) {
    scores.payments += 35;
  } else if (ctx.upcomingPayments > 0) {
    scores.payments += 12;
  }
  if (ctx.unreadMessages > 3) {
    scores.messages += 22;
  } else if (ctx.unreadMessages > 0) {
    scores.messages += 8;
  }
  if (ctx.attendanceRate !== null && ctx.attendanceRate < 0.7) {
    scores.academics += 18;
  }
  if (ctx.isWeekend && !ctx.examWeek) {
    scores.community += 16;
    scores.weather += 8;
  }
  if (ctx.timeOfDay === "night") {
    scores.bud += 14;
    scores.deadlines += 6;
  }
  if (ctx.timeOfDay === "morning") {
    scores.today += 6;
  }
  if (ctx.communityActivity > 0) {
    scores.community += Math.min(ctx.communityActivity, 6);
  }

  const order = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

  // ── Determine the active mode ──
  let mode = "Adaptive";
  let label = "Bud is adapting your dashboard";
  if (ctx.examWeek) {
    mode = "Exam Week";
    label = "Exam Week mode";
  } else if (ctx.severeWeather) {
    mode = "Weather Alert";
    label = "Weather alert mode";
  } else if (ctx.dueToday > 0) {
    mode = "Deadline Focus";
    label = "Deadline focus mode";
  } else if (ctx.overdueFees > 0) {
    mode = "Fees Due";
    label = "Fees due mode";
  } else if (ctx.isWeekend) {
    mode = "Weekend";
    label = "Weekend mode";
  } else if (ctx.timeOfDay === "night") {
    mode = "Evening Wind-down";
    label = "Evening wind-down";
  } else if (ctx.timeOfDay === "morning") {
    mode = "Morning Start";
    label = "Morning start";
  } else {
    mode = "Afternoon";
    label = "Afternoon focus";
  }

  // ── Bud proactively speaks before being asked ──
  let message;
  if (ctx.examWeek && ctx.nextExamDays !== null) {
    message = `Your next exam is in ${ctx.nextExamDays} day${ctx.nextExamDays === 1 ? "" : "s"}. I've surfaced your deadlines and a focused study plan.`;
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
  } else if (ctx.timeOfDay === "night") {
    message = `Late night. Let's review tomorrow's plan and wind down gently.`;
  } else if (ctx.timeOfDay === "morning") {
    message = `Good morning. Here's your day, arranged for you.`;
  } else {
    message = `Here's your dashboard, arranged for this afternoon.`;
  }

  return { mode, label, message, order, scores };
}
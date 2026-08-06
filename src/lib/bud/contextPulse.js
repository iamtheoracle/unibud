/**
 * contextPulse — Bud's single highest-priority contextual nudge, derived from
 * the unified context snapshot. Pure function; returns null when nothing is
 * urgent so the interface stays calm.
 *
 * Priority cascade (time-critical first):
 *   1. Severe / wet weather      → umbrella + indoor study
 *   2. Lecture within 15 minutes  → location + attendance
 *   3. Exam week                  → focus mode + study
 *   4. Assignments due today      → deadline tools
 *   5. Overdue fees               → wallet + funding
 *   6. Many unread messages       → messaging
 *   7. Low attendance             → attendance
 */
export function computePulse(ctx) {
  if (!ctx) return null;

  if (ctx.severeWeather || ctx.weatherScene === "rain" || ctx.weatherScene === "storm" || ctx.weatherScene === "snow") {
    return {
      key: "weather",
      tone: "information",
      title: "Heavy rain nearby",
      message: "Grab an umbrella — indoor study spots recommended.",
      actionLabel: "Weather",
      actionTo: "weather",
    };
  }

  if (ctx.nextLectureIn !== null && ctx.nextLectureIn <= 15 && ctx.nextLecture) {
    const loc = ctx.nextLecture.location ? ` · ${ctx.nextLecture.location}` : "";
    return {
      key: "lecture",
      tone: "primary",
      title: `Lecture in ${ctx.nextLectureIn} min`,
      message: `${ctx.nextLecture.course_title || "Next class"}${loc}`,
      actionLabel: "Attendance",
      actionTo: "/attendance",
    };
  }

  if (ctx.examWeek) {
    const d = ctx.nextExamDays;
    return {
      key: "exam",
      tone: "primary",
      title: "Exam week",
      message: d != null ? `Next exam in ${d} day${d === 1 ? "" : "s"}. Focus mode is on.` : "Focus mode is on.",
      actionLabel: "Study",
      actionTo: "/study",
    };
  }

  if (ctx.dueToday > 0) {
    return {
      key: "dueToday",
      tone: "warning",
      title: `${ctx.dueToday} due today`,
      message: "Bud moved deadlines up so nothing slips.",
      actionLabel: "Assignments",
      actionTo: "/assignments",
    };
  }

  if (ctx.overdueFees > 0) {
    return {
      key: "overdue",
      tone: "destructive",
      title: `${ctx.overdueFees} overdue fee${ctx.overdueFees > 1 ? "s" : ""}`,
      message: "Settle now to avoid registration holds.",
      actionLabel: "Wallet",
      actionTo: "/finance",
    };
  }

  if (ctx.unreadMessages > 3) {
    return {
      key: "messages",
      tone: "primary",
      title: `${ctx.unreadMessages} unread messages`,
      message: "Catch up before your day fills up.",
      actionLabel: "Open",
      actionTo: "/messages",
    };
  }

  if (ctx.attendanceRate !== null && ctx.attendanceRate < 0.7) {
    return {
      key: "attendance",
      tone: "warning",
      title: "Attendance is low",
      message: "You're below 70% — head to your next class.",
      actionLabel: "Attendance",
      actionTo: "/attendance",
    };
  }

  return null;
}
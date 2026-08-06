import { CalendarClock, CloudRain, Wallet, Zap, Flame, MapPin, TrendingDown, Moon } from "lucide-react";

/**
 * useBudProactive — Bud's proactive engine. Reads the unified context and
 * produces ranked "before you ask" cards: assignments due, exams, weather,
 * wallet, streak slipping, next lecture, low attendance, late-night care.
 * Bud acts before being asked, calmly.
 */
const RANK = { destructive: 0, warning: 1, primary: 2, information: 3 };

export function useBudProactive(ctx) {
  if (!ctx) return [];
  const cards = [];
  const now = new Date();

  if (ctx.nextDeadlineDays !== null && ctx.nextDeadlineDays <= 1) {
    cards.push({
      id: "due", icon: CalendarClock, tone: "warning",
      title: "Assignment due soon",
      message: "Something's due tomorrow — want help knocking it out tonight?",
      actionLabel: "Plan it", prompt: "I have an assignment due soon. Help me break it into quick steps.",
    });
  }

  if (ctx.nextExamDays !== null && ctx.nextExamDays <= 3) {
    cards.push({
      id: "exam", icon: Zap, tone: "primary",
      title: `Exam in ${ctx.nextExamDays} day${ctx.nextExamDays === 1 ? "" : "s"}`,
      message: "Let's do a focused review of your weakest topics.",
      actionLabel: "Revise", prompt: "Quiz me on my weakest topics before my exam.",
    });
  }

  if (ctx.severeWeather || ctx.weatherScene === "rain" || ctx.weatherScene === "storm") {
    cards.push({
      id: "rain", icon: CloudRain, tone: "information",
      title: "Heavy rain nearby",
      message: "Pack an umbrella — or study indoors today.",
      actionLabel: "Indoor plan", prompt: "It's raining. Suggest a calm indoor study plan for today.",
    });
  }

  if (ctx.overdueFees > 0) {
    cards.push({
      id: "wallet", icon: Wallet, tone: "destructive",
      title: "Fees overdue",
      message: "Settling this now avoids registration holds.",
      actionLabel: "Open wallet", to: "/finance",
    });
  } else if (ctx.upcomingPayments > 0) {
    cards.push({
      id: "wallet", icon: Wallet, tone: "warning",
      title: "Payment coming up",
      message: "A fee is due soon — want to plan it?",
      actionLabel: "Open wallet", to: "/finance",
    });
  }

  const sessions = (ctx.sessions || []).slice().sort((a, b) => (b.session_date || "").localeCompare(a.session_date || ""));
  const lastS = sessions[0]?.session_date;
  if (lastS) {
    const days = Math.floor((now - new Date(lastS)) / 86400000);
    if (days >= 2) {
      cards.push({
        id: "streak", icon: Flame, tone: "warning",
        title: "Study streak slipping",
        message: `It's been ${days} days since your last session — a short one counts.`,
        actionLabel: "Study", prompt: "Help me start a short study session to keep my streak alive.",
      });
    }
  }

  if (ctx.nextLectureIn !== null && ctx.nextLectureIn <= 15 && ctx.nextLecture) {
    cards.push({
      id: "lecture", icon: MapPin, tone: "primary",
      title: `Lecture in ${ctx.nextLectureIn} min`,
      message: `${ctx.nextLecture.course_title || "Next class"}${ctx.nextLecture.location ? " · " + ctx.nextLecture.location : ""}`,
      actionLabel: "Attendance", to: "/attendance",
    });
  }

  if (ctx.attendanceRate !== null && ctx.attendanceRate < 0.7) {
    cards.push({
      id: "att", icon: TrendingDown, tone: "warning",
      title: "Attendance is low",
      message: "You're below 70% — heading to your next class helps.",
      actionLabel: "Attendance", to: "/attendance",
    });
  }

  if (ctx.timeOfDay === "night") {
    cards.push({
      id: "night", icon: Moon, tone: "information",
      title: "Late night",
      message: "Easy does it. Want a calm wind-down or one short task?",
      actionLabel: "Wind down", prompt: "Help me wind down for the night with something calm.",
    });
  }

  return cards.sort((a, b) => (RANK[a.tone] ?? 9) - (RANK[b.tone] ?? 9)).slice(0, 4);
}
import { useEffect } from "react";

const KEY = "bud_behaviour_last";

/**
 * useBudBehaviour — Bud's passive Behaviour Learning Engine. Once per day it
 * composes a behaviour summary from real context signals (late-night activity,
 * study recency, overdue fees, attendance, exam-week engagement) and asks the
 * memory engine to derive a quiet learning. Bud learns from behaviour, not
 * interviews.
 */
export function useBudBehaviour(ctx, bud) {
  useEffect(() => {
    if (!ctx || !bud || bud.paused || !bud.observe) return;
    const today = new Date().toISOString().split("T")[0];
    let last = null;
    try { last = localStorage.getItem(KEY); } catch {}
    if (last === today) return;
    try { localStorage.setItem(KEY, today); } catch {}

    const bits = [];
    if (ctx.timeOfDay === "night") bits.push("Active on the app late at night");
    const sessions = ctx.sessions || [];
    if (sessions.length) {
      const lastS = sessions.slice().sort((a, b) => (b.session_date || "").localeCompare(a.session_date || ""))[0]?.session_date;
      if (lastS) {
        const d = Math.floor((Date.now() - new Date(lastS)) / 86400000);
        bits.push(`Last studied ${d} day${d === 1 ? "" : "s"} ago`);
      }
    }
    if (ctx.overdueFees > 0) bits.push("Has overdue fees — tends to pay late");
    if (ctx.attendanceRate !== null) bits.push(`Attendance at ${Math.round(ctx.attendanceRate * 100)}%`);
    if (ctx.examWeek) bits.push("Engaging with Bud during exam week");
    if (!bits.length) return;

    bud.observe({ summary: bits.join("; ") + ".", source: "passive" });
  }, [ctx, bud]);
}
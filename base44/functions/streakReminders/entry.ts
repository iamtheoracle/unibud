import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { buildNotification } from "../../shared/notifications.ts";

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100];

/**
 * Computes the current consecutive-day streak ending today or yesterday.
 * @param dates - array of ISO date strings (YYYY-MM-DD)
 */
function computeStreak(dates) {
  const unique = [...new Set(dates.filter(Boolean))].sort().reverse();
  if (unique.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  // Streak must include today or yesterday to be "active"
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 0;
  let checkDate = unique[0];
  for (const d of unique) {
    if (d === checkDate) {
      streak++;
      const dt = new Date(checkDate);
      dt.setDate(dt.getDate() - 1);
      checkDate = dt.toISOString().split("T")[0];
    } else if (d < checkDate) {
      break;
    }
  }
  return streak;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const mode = new URL(req.url).searchParams.get("mode") || "evening";

    const sessions = await base44.asServiceRole.entities.StudySession.list("-session_date", 500);
    const recentNotifications = await base44.asServiceRole.entities.Notification.list("-created_date", 200);

    // Group sessions by user
    const byUser = new Map();
    for (const s of sessions || []) {
      const uid = s.created_by_id;
      if (!uid) continue;
      if (!byUser.has(uid)) byUser.set(uid, []);
      byUser.get(uid).push(s);
    }

    const today = new Date().toISOString().split("T")[0];
    let reminders = 0;
    let celebrations = 0;

    for (const [userId, userSessions] of byUser) {
      const dates = userSessions.map((s) => s.session_date);
      const loggedToday = dates.includes(today);
      const streak = computeStreak(dates);

      // === MORNING / EVENING REMINDER ===
      // Only remind users who have been active recently (streak >= 1 or session in last 7 days)
      const lastSessionDate = dates.sort().reverse()[0];
      const daysSinceLast = lastSessionDate
        ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / 86400000)
        : 999;

      if (!loggedToday && daysSinceLast <= 7 && streak >= 1) {
        const title = mode === "morning"
          ? "Good morning! Time to study"
          : "Don't break your streak!";
        const message = streak >= 2
          ? `You're on a ${streak}-day streak. Log your study session today to keep it alive.`
          : `Log your study session today to start a new streak.`;
        const notif = buildNotification({
          title,
          message,
          type: "reminder",
          icon: "Flame",
          link: "/study-session",
        });
        await base44.asServiceRole.entities.Notification.create({ ...notif, user_id: userId }).catch(() => {});
        reminders++;
      }

      // === MILESTONE CELEBRATION ===
      // Only celebrate if they logged today (streak is fresh) and hit a milestone
      if (loggedToday && STREAK_MILESTONES.includes(streak)) {
        // Check we haven't already celebrated this milestone for this user
        const alreadyCelebrated = (recentNotifications || []).some(
          (n) => n.user_id === userId &&
            n.title === `${streak}-day streak!` &&
            n.created_date &&
            (Date.now() - new Date(n.created_date).getTime()) < 48 * 60 * 60 * 1000
        );
        if (!alreadyCelebrated) {
          const notif = buildNotification({
            title: `${streak}-day streak!`,
            message: streak >= 30
              ? `Incredible — ${streak} days of consistent studying. You're building a powerful habit.`
              : streak >= 7
                ? `A full week of consistent studying. Keep this momentum going!`
                : `Three days in a row — your streak is building. Keep going!`,
            type: "achievement",
            icon: "Trophy",
            link: "/me",
          });
          await base44.asServiceRole.entities.Notification.create({ ...notif, user_id: userId }).catch(() => {});
          celebrations++;
        }
      }
    }

    return Response.json({
      status: "success",
      mode,
      usersScanned: byUser.size,
      reminders,
      celebrations,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
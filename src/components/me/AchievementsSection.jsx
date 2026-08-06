import React from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/me/SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

function computeStreak(sessions) {
  const dates = [...new Set(sessions.filter((s) => s.session_date).map((s) => s.session_date))].sort().reverse();
  let streak = 0;
  let check = new Date().toISOString().split("T")[0];
  for (const d of dates) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().split("T")[0];
    } else if (d < check) break;
  }
  return streak;
}

const ACHIEVEMENTS = [
  { id: "streak7", title: "7-Day Study Streak", desc: "Study 7 days in a row", check: (d) => d.streak >= 7 },
  { id: "streak30", title: "30-Day Consistency", desc: "Study 30 days in a row", check: (d) => d.streak >= 30 },
  { id: "assign10", title: "Assignment Master", desc: "Complete 10 assignments", check: (d) => d.assignmentsCompleted >= 10 },
  { id: "perfect", title: "Perfect Attendance", desc: "Maintain 95% attendance", check: (d) => d.attendance >= 95 },
  { id: "flash", title: "Flashcard Champion", desc: "Master 100 flashcards", check: () => false },
  { id: "exam", title: "Exam Ready", desc: "Complete exam revision", check: () => false },
];

/**
 * Achievements — learning-habit badges that unlock from real activity,
 * with subtle celebrations for unlocked items.
 */
export default function AchievementsSection({ sessions, assignments }) {
  const streak = computeStreak(sessions || []);
  const assignmentsCompleted = (assignments || []).filter((a) => a.status === "submitted" || a.status === "graded").length;
  const data = { streak, assignmentsCompleted, attendance: 0 };
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.check(data)).length;

  return (
    <div>
      <SectionHeader title="Achievements" action={<span className="text-[11px] text-muted-foreground">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</span>} />
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a, i) => {
          const on = a.check(data);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
              className={`glass-card p-4 text-center ${on ? "ice-glow" : "opacity-60"}`}
            >
              <motion.div
                animate={on ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`w-14 h-14 mx-auto rounded-full mb-2.5 ${on ? "bg-primary/15 ring-2 ring-primary/40" : "bg-muted/50 ring-1 ring-border"}`}
              />
              <p className="text-[13px] font-semibold text-foreground leading-tight">{a.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
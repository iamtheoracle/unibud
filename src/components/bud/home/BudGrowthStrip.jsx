import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, ChevronRight } from "lucide-react";
import { useUnibudContext } from "@/lib/UnibudContext";

const EASE = [0.16, 1, 0.3, 1];

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

function isRecent(dateStr, days = 14) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < days * 86400000;
}

/**
 * BudGrowthStrip — a quiet reminder that Bud is growing alongside the student.
 *
 * Surfaces real continuity: how long they've been together, what Bud has
 * learned, goals Bud is tracking, and recent celebrations. This is NOT a
 * dashboard — it's a single calm line that reinforces the long-term companion
 * relationship. Bud remembers. Bud tracks. Bud celebrates.
 *
 * Tapping opens the memory dashboard — transparency builds trust.
 */
export default function BudGrowthStrip() {
  const ctx = useUnibudContext();
  const navigate = useNavigate();
  const user = ctx.user;

  const { data: growth } = useQuery({
    queryKey: ["bud-growth", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const [memories, goals, achievements] = await Promise.all([
        base44.entities.BudMemory.list("-created_date", 200),
        base44.entities.StudentGoal.filter({ is_completed: false }, "-created_date", 5),
        base44.entities.StudentAchievement.filter({ created_by_id: user.id }, "-created_date", 1),
      ]);
      const recentAchievement = achievements[0] || null;
      const activeGoal = goals[0] || null;
      const achievementDate = recentAchievement?.date || recentAchievement?.created_date;
      return {
        memoryCount: memories.length,
        activeGoal,
        recentAchievement,
        recentAchievementIsNew: recentAchievement && isRecent(achievementDate, 14),
        daysTogether: daysSince(user.created_date),
      };
    },
    enabled: !!user?.id,
    staleTime: 300000,
  });

  if (!growth) return null;

  let message = null;

  if (growth.recentAchievementIsNew && growth.recentAchievement) {
    message = `Recently celebrated — ${growth.recentAchievement.title}`;
  } else if (growth.activeGoal) {
    const g = growth.activeGoal;
    const progress = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0;
    message = `Tracking your goal — ${g.title}${progress > 0 ? ` · ${progress}% there` : ""}`;
  } else if (growth.daysTogether && growth.daysTogether > 1) {
    const memLabel = growth.memoryCount === 1 ? "memory" : "memories";
    message = `Day ${growth.daysTogether} together · ${growth.memoryCount} ${memLabel}`;
  } else {
    message = "I'm getting to know you — every conversation helps";
  }

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
      onClick={() => navigate("/memory")}
      className="w-full flex items-center justify-center gap-1.5 mt-4 py-2 group"
    >
      <Sparkles className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      <span className="text-[11px] text-muted-foreground/70 group-hover:text-muted-foreground transition-colors text-center">
        {message}
      </span>
      <ChevronRight className="w-3 h-3 text-muted-foreground/35 group-hover:text-muted-foreground/60 transition-colors" />
    </motion.button>
  );
}
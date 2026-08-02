import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BudHero from "@/components/bud/home/BudHero";
import BudMorningEntrance from "@/components/bud/BudMorningEntrance";
import { getCardsForWorkspace } from "@/lib/workspace/cardRegistry";
import { rankCards, buildContext } from "@/lib/workspace/cardRanker";
import WorkspaceRenderer from "@/components/workspace/WorkspaceRenderer";
import { useTodaySchedule, useUpcomingDeadlines, useExams } from "@/lib/academic/useAcademicData";

const EASE = [0.16, 1, 0.3, 1];

/**
 * BudHome — Bud IS the home. There is no separate "Home" page anymore.
 *
 * The first thing the student sees is Bud: a greeting, a live briefing
 * of what matters, and an input bar to act. Below Bud, Academic and Social
 * workspaces render as content sections — cards that Bud has ranked based
 * on the student's current context.
 *
 * Bud doesn't replace navigation. Bud prioritizes it.
 */
export default function BudHome() {
  // Morning entrance — shows once per day
  const [showEntrance, setShowEntrance] = useState(() => {
    try {
      const today = new Date().toDateString();
      return sessionStorage.getItem("bud_morning_entrance") !== today;
    } catch { return false; }
  });

  useEffect(() => {
    if (showEntrance) {
      try { sessionStorage.setItem("bud_morning_entrance", new Date().toDateString()); } catch {}
    }
  }, [showEntrance]);

  // Fetch context signals for card ranking
  const { data: today } = useTodaySchedule();
  const { data: deadlines } = useUpcomingDeadlines();
  const { data: exams } = useExams();
  const { data: events } = useQuery({
    queryKey: ["budhome-events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 5),
    staleTime: 120000,
  });

  const academicCards = useMemo(() => {
    const base = getCardsForWorkspace("academic");
    const ctx = buildContext({ assignments: deadlines, exams, events });
    return rankCards(base, ctx);
  }, [deadlines, exams, events]);

  const socialCards = useMemo(() => {
    const base = getCardsForWorkspace("social");
    const ctx = buildContext({ events });
    return rankCards(base, ctx);
  }, [events]);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* ═══ Morning entrance — Bud walks in with the briefing ═══ */}
      <BudMorningEntrance visible={showEntrance} onComplete={() => setShowEntrance(false)} />

      {/* ═══ BUD — the interface ═══ */}
      <BudHero />

      {/* ═══ Academic Workspace ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[15px] font-bold text-foreground tracking-tight">Academic</h2>
          <span className="text-[11px] text-muted-foreground font-medium">{academicCards.length} cards</span>
        </div>
        <WorkspaceRenderer cards={academicCards} />
      </motion.section>

      {/* ═══ Social Workspace ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease: EASE }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[15px] font-bold text-foreground tracking-tight">Social</h2>
          <span className="text-[11px] text-muted-foreground font-medium">{socialCards.length} cards</span>
        </div>
        <WorkspaceRenderer cards={socialCards} />
      </motion.section>
    </div>
  );
}
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { useTodaySchedule, useUpcomingDeadlines, useExams } from "@/lib/academic/useAcademicData";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getCardsForWorkspace } from "@/lib/workspace/cardRegistry";
import { rankCards, buildContext } from "@/lib/workspace/cardRanker";
import WorkspaceRenderer from "@/components/workspace/WorkspaceRenderer";

const EASE = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * AcademicHub — one intelligent academic workspace.
 *
 * Pipeline: Load Context → Load Cards → Bud ranks cards → Render cards
 *
 * All academic features (schedule, assignments, exams, GPA, courses, notes,
 * timetable) live as modular cards on this single scrollable page.
 */
export default function AcademicHub() {
  const [q, setQ] = useState("");

  // Fetch context signals for the card ranker
  const { data: today } = useTodaySchedule();
  const { data: deadlines } = useUpcomingDeadlines();
  const { data: exams } = useExams();
  const { data: events } = useQuery({
    queryKey: ["academic-hub-events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 5),
    staleTime: 120000,
  });

  // Build context and rank cards
  const rankedCards = useMemo(() => {
    const baseCards = getCardsForWorkspace("academic");
    const ctx = buildContext({
      assignments: deadlines,
      exams: exams,
      events: events,
    });
    return rankCards(baseCards, ctx);
  }, [deadlines, exams, events]);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* Greeting + Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-5"
      >
        <p className="text-[13px] text-muted-foreground font-medium">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight mt-0.5">Academics</h1>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses, assignments, notes…"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 spring-tap transition-colors duration-300"
        />
      </div>

      {/* Ranked card grid */}
      <WorkspaceRenderer cards={rankedCards} />

      {/* Search results overlay */}
      {q.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Search</p>
          <div className="crystal-card p-4">
            <p className="text-[12px] text-muted-foreground">
              Use Bud to find "{q.trim()}" across your academic workspace.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
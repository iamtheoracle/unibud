import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, Target, BookOpen, Layers, MessageSquareText, ChevronRight, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

function computeStreak(sessions) {
  if (!sessions?.length) return 0;
  const days = new Set(sessions.map((s) => new Date(s.created_date || s.started_at).toDateString()));
  let streak = 0; let d = new Date();
  // allow today to be empty but still count ongoing streak from yesterday
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export default function StudyContinue() {
  const navigate = useNavigate();
  const sessions = useQuery({ queryKey: ["studySessionsAll"], queryFn: () => base44.entities.StudySession.list("-created_date", 60) });
  const notes = useQuery({ queryKey: ["studyRecentNotes"], queryFn: () => base44.entities.Note.list("-updated_date", 3) });
  const flashcards = useQuery({ queryKey: ["studyRecentFlashcards"], queryFn: () => base44.entities.Flashcard.list("-updated_date", 3) });
  const convos = useQuery({ queryKey: ["studyRecentBudConvos"], queryFn: () => base44.entities.BudConversation.list("-last_message_at", 3) });
  const goals = useQuery({ queryKey: ["studyWeeklyGoals"], queryFn: () => base44.entities.StudyGoal.list("-created_date", 5) });

  const streak = useMemo(() => computeStreak(sessions.data), [sessions.data]);
  const weekMinutes = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return (sessions.data || []).filter((s) => new Date(s.created_date || s.started_at).getTime() >= weekAgo).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  }, [sessions.data]);

  const n = notes.data || []; const f = flashcards.data || []; const c = convos.data || []; const g = goals.data || [];

  return (
    <>
      {/* Stats strip */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="grid grid-cols-3 gap-2.5">
        <div className="glass-card p-3 text-center">
          <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-heading font-extrabold text-[18px] text-foreground leading-none">{streak}</p>
          <p className="text-[10px] text-muted-foreground mt-1">day streak</p>
        </div>
        <div className="glass-card p-3 text-center">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-heading font-extrabold text-[18px] text-foreground leading-none">{weekMinutes}</p>
          <p className="text-[10px] text-muted-foreground mt-1">min / week</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Target className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="font-heading font-extrabold text-[18px] text-foreground leading-none">{g.filter((x) => x.status === "completed").length || g.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">goals</p>
        </div>
      </motion.section>

      {/* Continue studying */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }} className="glass-card p-5">
        <h2 className="font-heading font-bold text-[15px] text-foreground mb-3">Continue Studying</h2>
        <div className="space-y-2">
          {n.length > 0 && n.map((note) => (
            <button key={note.id} onClick={() => navigate("/notes")} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 spring-tap text-left">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{note.title || "Untitled note"}</p><p className="text-[10px] text-muted-foreground">Note</p></div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
          {f.length > 0 && (
            <button onClick={() => navigate("/study/flashcards")} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 spring-tap text-left">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{f.length} flashcards ready</p><p className="text-[10px] text-muted-foreground">Review due</p></div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          )}
          {c.length > 0 && c.slice(0, 2).map((conv) => (
            <button key={conv.id} onClick={() => navigate("/bud")} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 spring-tap text-left">
              <MessageSquareText className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{conv.title || conv.summary || "Bud conversation"}</p><p className="text-[10px] text-muted-foreground">Continue with Bud</p></div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
          {n.length === 0 && f.length === 0 && c.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-3">Start a note or ask Bud to begin.</p>
          )}
        </div>
      </motion.section>

      {/* Weekly goals */}
      {g.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-[15px] text-foreground">Weekly Goals</h2>
            <button onClick={() => navigate("/academics")} className="text-[11px] font-semibold text-primary spring-tap">All →</button>
          </div>
          <div className="space-y-2.5">
            {g.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round(((goal.progress || goal.current || 0) / (goal.target || 1)) * 100));
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1"><p className="text-[12px] font-semibold text-foreground truncate">{goal.title}</p><span className="text-[10px] text-muted-foreground">{pct}%</span></div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}
    </>
  );
}
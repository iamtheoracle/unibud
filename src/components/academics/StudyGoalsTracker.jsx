import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Target, CheckCircle2, Flame, X, Sparkles, Trophy, Zap, Award,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";

const GOAL_COLORS = {
  hours: "hsl(var(--unibud-blue))", assignments: "hsl(var(--unibud-green))",
  quizzes: "hsl(var(--unibud-purple))", reading: "hsl(var(--unibud-orange))",
  attendance: "hsl(var(--unibud-gold))",
};

const GOAL_LABELS = {
  hours: "Study Hours", assignments: "Assignments", quizzes: "Quizzes",
  reading: "Reading Sessions", attendance: "Attendance %",
};

export default function StudyGoalsTracker() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [celebrate, setCelebrate] = useState(null);
  const [form, setForm] = useState({
    target_hours: 20, target_assignments: 5, target_quizzes: 3,
    target_reading_sessions: 5, target_attendance: 90,
  });

  const weekLabel = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / 86400000);
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
  })();

  const { data: goalRecords } = useQuery({
    queryKey: ["studyGoals"],
    queryFn: () => base44.entities.StudyGoal.filter({ week_label: weekLabel }),
  });

  const { data: budInsight } = useQuery({
    queryKey: ["budGoalInsight", weekLabel],
    queryFn: () => base44.integrations.Core.InvokeLLM({
      prompt: `You are Bud, a warm study mentor. A student's weekly goals: ${form.target_hours}h study, ${form.target_assignments} assignments, ${form.target_quizzes} quizzes. Give a 1-sentence motivational insight about staying on track. Be encouraging and specific.`,
      response_json_schema: { type: "object", properties: { insight: { type: "string" } } },
    }),
    staleTime: 600000,
  });

  const currentGoal = goalRecords?.[0];

  const handleCreate = async () => {
    try {
      await base44.entities.StudyGoal.create({
        ...form,
        week_label: weekLabel,
        completed_hours: 0, completed_assignments: 0, completed_quizzes: 0,
        completed_reading_sessions: 0, completed_attendance: 0,
        experience_points: 0, is_completed: false, streak_days: 0,
        bud_insight: budInsight?.insight || "",
      });
      qc.invalidateQueries({ queryKey: ["studyGoals"] });
      setShowForm(false);
    } catch (err) {}
  };

  const updateProgress = async (field, target, current) => {
    if (!currentGoal) return;
    const newValue = current + 1;
    const updates = { [`completed_${field}`]: newValue };
    const allComplete =
      (field === "hours" ? newValue >= target : currentGoal.completed_hours >= currentGoal.target_hours) &&
      (field === "assignments" ? newValue >= target : currentGoal.completed_assignments >= currentGoal.target_assignments) &&
      (field === "quizzes" ? newValue >= target : currentGoal.completed_quizzes >= currentGoal.target_quizzes) &&
      (field === "reading" ? newValue >= target : currentGoal.completed_reading_sessions >= currentGoal.target_reading_sessions) &&
      (field === "attendance" ? newValue >= target : currentGoal.completed_attendance >= currentGoal.target_attendance);

    if (newValue >= target && current < target) {
      updates.experience_points = (currentGoal.experience_points || 0) + 20;
      updates.streak_days = (currentGoal.streak_days || 0) + 1;
      setCelebrate(GOAL_LABELS[field]);
      setTimeout(() => setCelebrate(null), 3000);
    }
    if (allComplete) {
      updates.is_completed = true;
      updates.experience_points = (currentGoal.experience_points || 0) + 100;
    }
    await base44.entities.StudyGoal.update(currentGoal.id, updates);
    qc.invalidateQueries({ queryKey: ["studyGoals"] });
  };

  if (!currentGoal) {
    return (
      <div className="space-y-4">
        <GlassCard variant="solid" className="p-8 text-center" delay={0.05}>
          <div className="w-14 h-14 rounded-[20px] bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Target className="w-7 h-7 text-primary" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-foreground">No weekly goals set</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 mb-4">Set your targets to track weekly progress</p>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
            Set Weekly Goals
          </button>
        </GlassCard>
        {showForm && <GoalFormModal form={form} setForm={setForm} onSave={handleCreate} onClose={() => setShowForm(false)} budInsight={budInsight} />}
      </div>
    );
  }

  const goalItems = [
    { key: "hours", label: "Study Hours", target: currentGoal.target_hours, current: currentGoal.completed_hours, unit: "h" },
    { key: "assignments", label: "Assignments", target: currentGoal.target_assignments, current: currentGoal.completed_assignments, unit: "" },
    { key: "quizzes", label: "Quizzes", target: currentGoal.target_quizzes, current: currentGoal.completed_quizzes, unit: "" },
    { key: "reading", label: "Reading", target: currentGoal.target_reading_sessions, current: currentGoal.completed_reading_sessions, unit: "" },
    { key: "attendance", label: "Attendance", target: currentGoal.target_attendance, current: currentGoal.completed_attendance, unit: "%" },
  ];

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {celebrate && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] glass-strong rounded-[20px] px-5 py-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-[13px] font-bold text-foreground">{celebrate} goal completed! +20 XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard variant="solid" className="p-4" delay={0.05}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-[12px] font-semibold text-foreground">{currentGoal.streak_days || 0} day streak</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-bold text-primary">{currentGoal.experience_points || 0} XP</span>
          </div>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(currentGoal.experience_points || 0) % 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        {goalItems.map((g, i) => {
          const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0;
          const isComplete = g.current >= g.target;
          return (
            <GlassCard key={g.key} variant="solid" className="p-3.5" delay={i * 0.05}>
              <div className="flex flex-col items-center">
                <CircularProgressRing value={pct} size={68} strokeWidth={5}
                  color={isComplete ? "hsl(var(--unibud-green))" : GOAL_COLORS[g.key]}
                  label={`${Math.round(pct)}%`} delay={i * 0.05} />
                <p className="text-[10px] font-semibold text-muted-foreground mt-2">{g.label}</p>
                <p className="text-[11px] font-bold text-foreground">{g.current}/{g.target}{g.unit}</p>
                {!isComplete && (
                  <button onClick={() => updateProgress(g.key, g.target, g.current)}
                    className="mt-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold spring-tap">
                    +1
                  </button>
                )}
                {isComplete && <CheckCircle2 className="w-4 h-4 text-success mt-1" />}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {currentGoal.bud_insight && (
        <GlassCard variant="solid" className="p-3.5 border-primary/20" delay={0.3}>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary mb-0.5">Bud's Insight</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{currentGoal.bud_insight}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {currentGoal.is_completed && (
        <GlassCard variant="solid" className="p-4 border-success/30 bg-success/5" delay={0.35}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-success/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-heading font-bold text-[13px] text-foreground">All goals completed!</p>
              <p className="text-[10px] text-muted-foreground">+100 XP earned · Badge unlocked</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function GoalFormModal({ form, setForm, onSave, onClose, budInsight }) {
  const fields = [
    { key: "target_hours", label: "Study Hours", max: 50 },
    { key: "target_assignments", label: "Assignments", max: 20 },
    { key: "target_quizzes", label: "Quizzes", max: 15 },
    { key: "target_reading_sessions", label: "Reading Sessions", max: 20 },
    { key: "target_attendance", label: "Attendance %", max: 100 },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-[24px] w-full max-w-md p-5 premium-shadow border border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-[16px] text-foreground">Weekly Study Goals</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">{f.label}</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max={f.max} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: parseInt(e.target.value) })}
                  className="flex-1 accent-primary" />
                <span className="w-12 text-right font-heading font-bold text-[14px] text-primary">{form[f.key]}</span>
              </div>
            </div>
          ))}
          {budInsight?.insight && (
            <div className="flex items-start gap-2 p-3 rounded-[12px] bg-primary/5 border border-primary/10">
              <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{budInsight.insight}</p>
            </div>
          )}
          <button onClick={onSave} className="w-full h-12 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap">
            Set Goals
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import BudThinking from "@/components/study/BudThinking";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, Plus, Check, Clock, Target, CalendarDays, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekLabel = () => { const d = new Date(); return `Week of ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`; };

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    insight: { type: "string" },
    sessions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string" },
          start_time: { type: "string" },
          duration_minutes: { type: "number" },
          subject: { type: "string" },
          focus: { type: "string" }
        }
      }
    },
    goal: {
      type: "object",
      properties: {
        target_hours: { type: "number" },
        target_assignments: { type: "number" },
        target_quizzes: { type: "number" }
      }
    }
  }
};

function nextDateForDay(dayName) {
  const map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
  const d = new Date(); const today = d.getDay();
  let diff = (map[dayName] - today + 7) % 7; if (diff === 0) diff = 0;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export default function StudyPlanner() {
  const qc = useQueryClient();
  const [planning, setPlanning] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ subject: "", date: todayStr, start_time: "09:00", duration_minutes: 60, focus: "" });

  const goals = useQuery({ queryKey: ["plannerGoals"], queryFn: () => base44.entities.StudyGoal.list("-created_date", 5) });
  const sessions = useQuery({ queryKey: ["plannerSessions"], queryFn: () => base44.entities.CalendarEvent.filter({ type: "study_session" }, "date", 30) });
  const assignments = useQuery({ queryKey: ["plannerAssignments"], queryFn: () => base44.entities.Assignment.list("due_date", 10) });
  const exams = useQuery({ queryKey: ["plannerExams"], queryFn: () => base44.entities.Exam.list("date", 10) });

  const goal = (goals.data || [])[0];
  const upcoming = (sessions.data || []).filter((s) => s.date && s.date >= todayStr).sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const createSession = useMutation({
    mutationFn: (v) => base44.entities.CalendarEvent.create(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plannerSessions"] }); toast({ title: "Session planned" }); setAdding(false); }
  });
  const toggleDone = useMutation({
    mutationFn: ({ id, v }) => base44.entities.CalendarEvent.update(id, v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plannerSessions"] })
  });

  const planWithBud = async () => {
    setPlanning(true);
    try {
      const dueAssignments = (assignments.data || []).filter((a) => a.status === "pending" && a.due_date && a.due_date >= todayStr).slice(0, 5);
      const upcomingExams = (exams.data || []).filter((e) => e.date && e.date >= todayStr).slice(0, 3);
      const context = [
        dueAssignments.length ? `Upcoming assignments: ${dueAssignments.map((a) => `${a.title}${a.due_date ? ` (due ${a.due_date})` : ""}`).join("; ")}` : "",
        upcomingExams.length ? `Upcoming exams: ${upcomingExams.map((e) => `${e.title}${e.date ? ` (${e.date})` : ""}`).join("; ")}` : "",
      ].filter(Boolean).join(". ");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud, a study coach. Create a focused one-week study plan for a university student. ${context || "No specific deadlines — build a balanced revision plan."}. Distribute study sessions across the week (Mon-Sun) with realistic times. Each session: day, start_time (HH:MM), duration_minutes, subject, and focus (what to study). Also set weekly goals (target_hours, target_assignments, target_quizzes). Keep it achievable and calm.`,
        response_json_schema: PLAN_SCHEMA,
      });
      const plan = res || {};
      // Create calendar events for each session
      const evts = (plan.sessions || []).map((s) => ({
        title: `Study: ${s.subject || "Session"}`,
        description: s.focus || "",
        type: "study_session",
        date: nextDateForDay(s.day),
        start_time: s.start_time || "09:00",
        end_time: s.start_time,
        is_completed: false,
      }));
      if (evts.length) await base44.entities.CalendarEvent.bulkCreate(evts);
      // Create or update this week's goal
      const g = plan.goal || {};
      const label = weekLabel();
      const existing = (goals.data || []).find((x) => x.week_label === label);
      const goalData = {
        week_label: label,
        target_hours: g.target_hours || 15,
        target_assignments: g.target_assignments || (dueAssignments.length || 3),
        target_quizzes: g.target_quizzes || 2,
        bud_insight: plan.insight || "Plan ready — take it one session at a time.",
      };
      if (existing) await base44.entities.StudyGoal.update(existing.id, goalData);
      else await base44.entities.StudyGoal.create(goalData);
      qc.invalidateQueries({ queryKey: ["plannerGoals"] });
      qc.invalidateQueries({ queryKey: ["plannerSessions"] });
      toast({ title: "Your week is planned", description: `${evts.length} sessions scheduled by Bud.` });
    } catch { toast({ title: "Planning failed — try again" }); }
    finally { setPlanning(false); }
  };

  const addManual = () => {
    if (!form.subject.trim()) { toast({ title: "Enter a subject" }); return; }
    createSession.mutate({
      title: `Study: ${form.subject.trim()}`,
      description: form.focus.trim(),
      type: "study_session",
      date: form.date,
      start_time: form.start_time,
      end_time: form.start_time,
      is_completed: false,
    });
  };

  const goalPct = (g) => {
    if (!g) return 0;
    const hrs = g.target_hours ? Math.min(100, Math.round(((g.completed_hours || 0) / g.target_hours) * 100)) : 0;
    return hrs;
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Study Planner" />

      {/* AI plan */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="crystal-card p-5 mb-4 light-bloom">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
          <div className="min-w-0 flex-1">
            <p className="font-heading font-bold text-[15px] text-foreground">Plan my week with Bud</p>
            <p className="text-[12px] text-muted-foreground leading-snug">Bud builds a study schedule around your deadlines & exams.</p>
          </div>
        </div>
        <button onClick={planWithBud} disabled={planning} className="w-full h-[48px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] spring-tap disabled:opacity-50 ice-glow flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> {planning ? "Planning…" : "Generate weekly plan"}
        </button>
        {planning && <div className="mt-3"><BudThinking label="Bud is reviewing your deadlines and building a balanced week…" /></div>}
      </motion.div>

      {/* Weekly goal */}
      {goal && (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /><h2 className="font-heading font-bold text-[15px] text-foreground">{goal.week_label}</h2></div>
            <span className="text-[11px] font-semibold text-primary">{goalPct(goal)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-3"><div className="h-full bg-primary rounded-full" style={{ width: `${goalPct(goal)}%` }} /></div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-[14px] font-bold text-foreground">{goal.completed_hours || 0}/{goal.target_hours}h</p><p className="text-[10px] text-muted-foreground">study</p></div>
            <div><p className="text-[14px] font-bold text-foreground">{goal.completed_assignments || 0}/{goal.target_assignments}</p><p className="text-[10px] text-muted-foreground">assignments</p></div>
            <div><p className="text-[14px] font-bold text-foreground">{goal.completed_quizzes || 0}/{goal.target_quizzes}</p><p className="text-[10px] text-muted-foreground">quizzes</p></div>
          </div>
          {goal.bud_insight && <p className="mt-3 text-[12px] text-muted-foreground italic px-3 py-2 rounded-xl glass">{goal.bud_insight}</p>}
        </motion.section>
      )}

      {/* Planned sessions */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading font-bold text-[15px] text-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" />Planned Sessions</h2>
        <button onClick={() => setAdding(true)} className="text-[12px] font-semibold text-primary flex items-center gap-1 spring-tap"><Plus className="w-3.5 h-3.5" />Add</button>
      </div>
      {upcoming.length === 0 ? (
        <EmptyState message="No sessions planned yet. Let Bud plan your week, or add a session." />
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((s) => (
            <div key={s.id} className={`glass-card p-4 flex items-center gap-3 ${s.is_completed ? "opacity-50" : ""}`}>
              <button onClick={() => toggleDone.mutate({ id: s.id, v: { is_completed: !s.is_completed } })} className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 spring-tap ${s.is_completed ? "bg-success text-success-foreground" : "glass"}`}>
                {s.is_completed && <Check className="w-4 h-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-semibold text-foreground truncate ${s.is_completed ? "line-through" : ""}`}>{s.title}</p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-2"><CalendarDays className="w-3 h-3" />{s.date} · {s.start_time}<Clock className="w-3 h-3 ml-1" /></p>
                {s.description && <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{s.description}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Plan a study session">
        <div className="space-y-3.5">
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Linear Algebra" className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Focus (what to study)</label><input value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} placeholder="e.g. Eigenvalues revision" className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 w-full h-[48px] px-3 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
            <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Time</label><input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="mt-1.5 w-full h-[48px] px-3 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
            <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Minutes</label><input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="mt-1.5 w-full h-[48px] px-3 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
          </div>
        </div>
        <button onClick={addManual} disabled={createSession.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{createSession.isPending ? "Saving…" : "Plan session"}</button>
      </Sheet>
    </div>
  );
}
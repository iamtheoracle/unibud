import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import BudThinking from "@/components/study/BudThinking";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, Plus, Check, BookOpen, Dumbbell, RefreshCw, HelpCircle, ClipboardCheck, FileText, Clock, Trophy } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const PATH_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    estimated_hours: { type: "number" },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string" },
          summary: { type: "string" },
          duration_minutes: { type: "number" }
        }
      }
    }
  }
};

const TYPE_ICON = { lesson: BookOpen, reading: FileText, exercise: Dumbbell, revision: RefreshCw, practice: HelpCircle, assessment: ClipboardCheck };

export default function LearningPaths() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", goal: "", level: "beginner" });
  const [genLoading, setGenLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const paths = useQuery({ queryKey: ["learningPaths"], queryFn: () => base44.entities.LearningPath.list("-created_date", 50) });

  const createPath = useMutation({
    mutationFn: (v) => base44.entities.LearningPath.create(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["learningPaths"] }); setCreating(false); }
  });
  const updatePath = useMutation({
    mutationFn: ({ id, v }) => base44.entities.LearningPath.update(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["learningPaths"] }); if (selected) { const p = (paths.data || []).find((x) => x.id === selected.id); if (p) setSelected(p); } }
  });
  const delPath = useMutation({
    mutationFn: (id) => base44.entities.LearningPath.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["learningPaths"] }); setSelected(null); }
  });

  const generate = async () => {
    if (!form.subject.trim()) { toast({ title: "Enter a subject" }); return; }
    setGenLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud, a learning path designer. Create a structured learning path for a ${form.level} student on "${form.subject}".${form.goal.trim() ? ` Goal: ${form.goal.trim()}.` : ""} Order modules from foundational to advanced, mixing lessons, readings, exercises, revision, practice, and assessments. Each module: title, type, summary, and duration_minutes. Return a title, description, estimated_hours, and modules array.`,
        response_json_schema: PATH_SCHEMA,
      });
      const data = res || {};
      const modules = (data.modules || []).map((m) => ({ ...m, completed: false }));
      const completedHours = modules.reduce((s, m) => s + (m.duration_minutes || 30), 0) / 60;
      await createPath.mutateAsync({
        title: data.title || form.subject,
        subject: form.subject.trim(),
        goal: form.goal.trim(),
        level: form.level,
        description: data.description || `A structured path to master ${form.subject}.`,
        modules,
        estimated_hours: data.estimated_hours || Math.round(completedHours),
        progress_percent: 0,
        status: "active",
      });
      toast({ title: "Learning path created", description: `${modules.length} modules ready.` });
      setForm({ subject: "", goal: "", level: "beginner" });
    } catch { toast({ title: "Generation failed — try again" }); }
    finally { setGenLoading(false); }
  };

  const toggleModule = (idx) => {
    if (!selected) return;
    const modules = selected.modules.map((m, i) => i === idx ? { ...m, completed: !m.completed } : m);
    const done = modules.filter((m) => m.completed).length;
    const pct = Math.round((done / modules.length) * 100);
    updatePath.mutate({ id: selected.id, v: { modules, progress_percent: pct, status: pct >= 100 ? "completed" : "active" } });
    setSelected({ ...selected, modules, progress_percent: pct });
  };

  // Detail view
  if (selected) {
    const done = (selected.modules || []).filter((m) => m.completed).length;
    return (
      <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
        <PageHeader title="Learning Path" action={<button onClick={() => setSelected(null)} className="text-[12px] font-semibold text-primary spring-tap">Back</button>} />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="crystal-card p-5 mb-4 light-bloom">
          <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-primary" /><span className="text-[11px] font-semibold uppercase tracking-wide text-primary">{selected.level}</span></div>
          <h2 className="font-heading font-bold text-[18px] text-foreground leading-tight">{selected.title}</h2>
          {selected.description && <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{selected.description}</p>}
          <div className="flex items-center gap-4 mt-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selected.estimated_hours || 0}h</span>
            <span>{done}/{(selected.modules || []).length} modules</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-3"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${selected.progress_percent || 0}%` }} /></div>
          <p className="text-[12px] font-semibold text-primary mt-1.5">{selected.progress_percent || 0}% complete</p>
        </motion.div>

        <div className="space-y-2.5">
          <AnimatePresence>
            {(selected.modules || []).map((m, i) => {
              const Icon = TYPE_ICON[m.type] || BookOpen;
              return (
                <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => toggleModule(i)} className={`w-full glass-card p-4 flex items-center gap-3 text-left spring-tap ${m.completed ? "opacity-60" : ""}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.completed ? "bg-success text-success-foreground" : "bg-primary/10"}`}>
                    {m.completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-semibold text-foreground ${m.completed ? "line-through" : ""}`}>{i + 1}. {m.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{m.type} · {m.duration_minutes || 30} min</p>
                    {m.summary && <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-0.5">{m.summary}</p>}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <button onClick={() => { if (confirm("Delete this learning path?")) delPath.mutate(selected.id); }} className="w-full mt-5 text-[12px] font-semibold text-destructive spring-tap">Delete path</button>
      </div>
    );
  }

  // List view
  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Learning Paths" action={<button onClick={() => setCreating(true)} className="text-[12px] font-semibold text-primary spring-tap">+ New</button>} />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="crystal-card p-5 mb-4 light-bloom">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
          <div className="min-w-0 flex-1">
            <p className="font-heading font-bold text-[15px] text-foreground">Bud builds your path</p>
            <p className="text-[12px] text-muted-foreground leading-snug">Tell Bud a subject & goal — get a full structured path.</p>
          </div>
        </div>
        <button onClick={() => setCreating(true)} className="w-full h-[44px] rounded-2xl bg-primary text-primary-foreground font-semibold text-[13px] spring-tap ice-glow flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Create a path</button>
      </motion.div>

      {(paths.data || []).length === 0 && !paths.isLoading ? (
        <EmptyState message="No learning paths yet. Let Bud design one for any subject." />
      ) : (
        <div className="space-y-2.5">
          {(paths.data || []).map((p, i) => (
            <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} onClick={() => setSelected(p)} className="w-full glass-card p-4 text-left spring-tap card-hover">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-semibold text-foreground truncate flex-1">{p.title}</p>
                <span className="text-[10px] font-semibold uppercase text-primary ml-2 shrink-0">{p.level}</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{p.subject}</p>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2.5"><div className="h-full bg-primary rounded-full" style={{ width: `${p.progress_percent || 0}%` }} /></div>
              <p className="text-[10px] text-muted-foreground mt-1">{p.progress_percent || 0}% · {(p.modules || []).length} modules</p>
            </motion.button>
          ))}
        </div>
      )}

      <Sheet open={creating} onClose={() => setCreating(false)} title="New Learning Path">
        <div className="space-y-3.5">
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures & Algorithms" className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Goal (optional)</label><input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Prepare for technical interviews" className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Level</label><div className="flex gap-2 mt-1.5">{["beginner", "intermediate", "advanced"].map((l) => <button key={l} onClick={() => setForm({ ...form, level: l })} className={`flex-1 py-2.5 rounded-2xl text-[12px] font-semibold capitalize spring-tap ${form.level === l ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{l}</button>)}</div></div>
        </div>
        {genLoading && <div className="mt-4"><BudThinking label="Bud is designing your structured learning path…" /></div>}
        <button onClick={generate} disabled={genLoading} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"><Sparkles className="w-4 h-4" />{genLoading ? "Designing…" : "Generate path with Bud"}</button>
      </Sheet>
    </div>
  );
}
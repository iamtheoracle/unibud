import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import BudThinking from "@/components/study/BudThinking";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EXAM_TYPES = ["University Semester", "Polytechnic", "College", "Professional Certification", "WAEC", "NECO", "NABTEB", "JAMB", "IJMB", "JUPEB", "Cambridge", "IELTS", "TOEFL", "SAT", "GRE", "GMAT"];

export default function ExamPreparation() {
  const { data: exams } = useQuery({ queryKey: ["studyExams"], queryFn: () => base44.entities.Exam.list("date", 20) });
  const [type, setType] = useState("University Semester");
  const [subjects, setSubjects] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");

  const run = async () => {
    if (!subjects.trim()) { toast({ title: "Enter subjects or topics" }); return; }
    setLoading(true); setPlan("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `You are Bud. Create a concise, day-by-day revision schedule for a student preparing for ${type} covering: ${subjects}. ${date ? `Exam date: ${date}. ` : ""}Balance topics, include active recall, practice, and rest. Keep it encouraging and practical.` });
      setPlan(typeof res === "string" ? res : res?.response || "Here's a plan to get you ready.");
    } catch { setPlan("I'm here — try again in a moment."); }
    finally { setLoading(false); }
  };

  const upcoming = (exams || []).filter((e) => new Date((e.date || "") + "T00:00:00") >= new Date(new Date().toDateString())).slice(0, 4);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Exam Preparation" />
      {upcoming.length > 0 && (
        <div className="glass-card p-4 mb-4">
          <p className="text-[13px] font-bold text-foreground mb-2">Upcoming exams</p>
          <div className="space-y-2">{upcoming.map((e) => { const d = e.date ? new Date(e.date + "T00:00:00") : null; const days = d ? Math.ceil((d - new Date(new Date().toDateString())) / 86400000) : null; return (<div key={e.id} className="flex justify-between"><span className="text-[12px] text-foreground/80">{e.title}</span><span className="text-[12px] font-semibold text-primary">{days != null ? `${days}d to go` : "—"}</span></div>); })}</div>
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Examination</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">{EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <GlassInput label="Subjects / Topics" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Biology, Chemistry, Physics" />
        <GlassInput label="Exam Date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <button onClick={run} disabled={loading} className="w-full h-[52px] mt-4 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Planning…" : "Create revision schedule"}</button>
      {(loading || plan) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
          {loading ? <BudThinking label="Bud is building your revision schedule…" /> : <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{plan}</p>}
        </motion.div>
      )}
    </div>
  );
}
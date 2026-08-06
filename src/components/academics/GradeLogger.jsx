import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Plus, X, BookOpen, GraduationCap, Calculator,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";

const ASSESSMENT_TYPES = [
  { k: "assignment", l: "Assignment", icon: BookOpen, color: "hsl(var(--unibud-blue))" },
  { k: "quiz", l: "Quiz", icon: BookOpen, color: "hsl(var(--unibud-purple))" },
  { k: "test", l: "Test", icon: BookOpen, color: "hsl(var(--unibud-green))" },
  { k: "lab", l: "Lab", icon: BookOpen, color: "hsl(var(--unibud-orange))" },
  { k: "project", l: "Project", icon: BookOpen, color: "hsl(var(--unibud-gold))" },
  { k: "midterm", l: "Midterm", icon: BookOpen, color: "hsl(var(--unibud-red))" },
  { k: "exam", l: "Exam", icon: GraduationCap, color: "hsl(var(--unibud-gold))" },
];

export default function GradeLogger() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    course_code: "", course_title: "", assessment_type: "assignment",
    score: "", max_score: "100", weight: "10", date: new Date().toISOString().split("T")[0],
  });

  const { data: grades, isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: () => base44.entities.Grade.list("-date", 100),
  });

  const handleSave = async () => {
    if (!form.course_code || !form.score) return;
    try {
      await base44.entities.Grade.create({
        ...form,
        score: parseFloat(form.score),
        max_score: parseFloat(form.max_score) || 100,
        weight: parseFloat(form.weight) || 10,
        is_verified: false,
      });
      qc.invalidateQueries({ queryKey: ["grades"] });
      setShowForm(false);
      setForm({ course_code: "", course_title: "", assessment_type: "assignment", score: "", max_score: "100", weight: "10", date: new Date().toISOString().split("T")[0] });
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    await base44.entities.Grade.delete(id);
    qc.invalidateQueries({ queryKey: ["grades"] });
  };

  const calcGPA = (gradesList) => {
    if (!gradesList || gradesList.length === 0) return { cgpa: 0, semesterGPA: 0, avg: 0 };
    let totalWeighted = 0;
    let totalWeight = 0;
    gradesList.forEach((g) => {
      const pct = (g.score / g.max_score) * 100;
      const weight = g.weight || 10;
      totalWeighted += pct * weight;
      totalWeight += weight;
    });
    const avgPct = totalWeight > 0 ? totalWeighted / totalWeight : 0;
    const gpaFromPct = (pct) => {
      if (pct >= 70) return 5.0;
      if (pct >= 60) return 4.0;
      if (pct >= 50) return 3.0;
      if (pct >= 45) return 2.0;
      if (pct >= 40) return 1.0;
      return 0.0;
    };
    return {
      cgpa: gpaFromPct(avgPct),
      semesterGPA: gpaFromPct(avgPct),
      avg: avgPct,
    };
  };

  const { cgpa, semesterGPA, avg } = calcGPA(grades);
  const courseGroups = {};
  (grades || []).forEach((g) => {
    if (!courseGroups[g.course_code]) courseGroups[g.course_code] = [];
    courseGroups[g.course_code].push(g);
  });

  const courseAverages = Object.entries(courseGroups).map(([code, grs]) => {
    let tw = 0, t = 0;
    grs.forEach((g) => { tw += (g.score / g.max_score) * 100 * (g.weight || 10); t += g.weight || 10; });
    return { code, title: grs[0]?.course_title || code, avg: t > 0 ? tw / t : 0, count: grs.length };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <GlassCard variant="solid" className="p-3 text-center" delay={0.05}>
          <CircularProgressRing value={cgpa} max={5} size={64} strokeWidth={5} color="hsl(var(--primary))" label={cgpa.toFixed(2)} delay={0.1} />
          <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">CGPA</p>
        </GlassCard>
        <GlassCard variant="solid" className="p-3 text-center" delay={0.1}>
          <CircularProgressRing value={semesterGPA} max={5} size={64} strokeWidth={5} color="hsl(var(--unibud-blue))" label={semesterGPA.toFixed(2)} delay={0.15} />
          <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Semester</p>
        </GlassCard>
        <GlassCard variant="solid" className="p-3 text-center" delay={0.15}>
          <CircularProgressRing value={avg} size={64} strokeWidth={5} color="hsl(var(--unibud-green))" label={`${Math.round(avg)}%`} delay={0.2} />
          <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">Average</p>
        </GlassCard>
      </div>

      <button onClick={() => setShowForm(true)} className="w-full h-12 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap gold-glow">
        <Plus className="w-4 h-4" /> Log New Grade
      </button>

      {isLoading ? (
        <div className="h-32 rounded-[20px] shimmer" />
      ) : courseAverages.length > 0 ? (
        <div className="space-y-2">
          {courseAverages.map((c, i) => (
            <GlassCard key={c.code} variant="solid" className="p-3.5" delay={i * 0.04}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[12px] text-foreground">{c.code}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.title} · {c.count} grades</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-[14px] text-foreground">{c.avg.toFixed(1)}%</p>
                  <p className="text-[8px] text-muted-foreground">avg</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard variant="solid" className="p-8 text-center">
          <Calculator className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[12px] font-semibold text-foreground">No grades logged yet</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Log your first grade to start tracking</p>
        </GlassCard>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowForm(false)}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-[24px] w-full max-w-md p-5 premium-shadow border border-border/40 max-h-[85vh] overflow-y-auto no-scrollbar"
            style={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-[16px] text-foreground">Log Grade</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Course Code *</label>
                  <input value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                    placeholder="CSC 301" className="w-full px-3 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Course Title</label>
                  <input value={form.course_title} onChange={(e) => setForm({ ...form, course_title: e.target.value })}
                    placeholder="Data Structures" className="w-full px-3 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-foreground mb-1 block">Assessment Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ASSESSMENT_TYPES.map((t) => (
                    <button key={t.k} onClick={() => setForm({ ...form, assessment_type: t.k })}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold spring-tap ${form.assessment_type === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Score *</label>
                  <input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })}
                    placeholder="85" className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Max</label>
                  <input type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Weight</label>
                  <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-foreground mb-1 block">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button onClick={handleSave} disabled={!form.course_code || !form.score}
                className="w-full h-12 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50">
                Save Grade
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
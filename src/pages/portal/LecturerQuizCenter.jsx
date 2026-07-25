import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, X, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";
import { useToast } from "@/components/ui/use-toast";

const EXAM_TYPES = [
  { key: "quiz", label: "Quiz" },
  { key: "midterm", label: "Midterm" },
  { key: "final", label: "Final" },
  { key: "practical", label: "Practical" },
  { key: "oral", label: "Oral" },
];

const emptyForm = { title: "", course_code: "", type: "quiz", date: "", duration_minutes: "", location: "", topics: "" };

export default function LecturerQuizCenter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { data: exams } = useQuery({
    queryKey: ["lecturerExams"],
    queryFn: () => base44.entities.Exam.list("-date", 100),
    retry: false,
  });

  const submit = async () => {
    if (!form.title || !form.course_code || !form.date) {
      toast({ title: "Title, course code and date are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Exam.create({
        title: form.title,
        course_code: form.course_code,
        type: form.type,
        date: form.date,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
        location: form.location || undefined,
        topics: form.topics ? form.topics.split(",").map((t) => t.trim()).filter(Boolean) : [],
        status: "upcoming",
      });
      await queryClient.invalidateQueries({ queryKey: ["lecturerExams"] });
      toast({ title: "Assessment created", description: `${form.title} scheduled for ${form.date}.` });
      setForm(emptyForm);
      setOpen(false);
    } catch {
      toast({ title: "Could not create assessment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const markComplete = async (exam) => {
    try {
      await base44.entities.Exam.update(exam.id, { status: "completed" });
      await queryClient.invalidateQueries({ queryKey: ["lecturerExams"] });
      toast({ title: "Marked complete" });
    } catch {
      toast({ title: "Could not update", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quiz & Examination Center"
        subtitle="Create quizzes, tests, and examinations across your courses."
        action={
          <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
            <Plus className="w-4 h-4" /> New Assessment
          </button>
        }
      />

      <SectionCard title="Assessments" description="All quizzes and examinations" delay={0.1}>
        <SmartList
          items={exams || []}
          emptyMessage="No assessments yet — create your first quiz or exam."
          renderRow={(exam) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{exam.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {exam.course_code} · {EXAM_TYPES.find((t) => t.key === exam.type)?.label || exam.type} · {exam.date ? new Date(exam.date).toLocaleDateString() : "—"}
                  {exam.duration_minutes ? ` · ${exam.duration_minutes} min` : ""}
                  {exam.location ? ` · ${exam.location}` : ""}
                </p>
              </div>
              {exam.status === "upcoming" ? (
                <button onClick={() => markComplete(exam)} className="px-2.5 py-1.5 rounded-[10px] bg-success/12 text-success text-[11px] font-semibold spring-tap flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark done
                </button>
              ) : (
                <StatusPill status={exam.status === "completed" ? "operational" : "open"} label={exam.status} />
              )}
            </div>
          )}
        />
      </SectionCard>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm safe-area-px"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[17px] text-foreground">New Assessment</h3>
                <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Title</label>
                  <input className="input-base" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. ENG 201 Midterm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Course code</label>
                    <input className="input-base" value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} placeholder="ENG 201" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Type</label>
                    <select className="input-base" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      {EXAM_TYPES.map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Date</label>
                    <input type="date" className="input-base" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Duration (min)</label>
                    <input type="number" className="input-base" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} placeholder="60" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Location</label>
                  <input className="input-base" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hall A / Online" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">Topics (comma separated)</label>
                  <input className="input-base" value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} placeholder="Kinematics, Dynamics" />
                </div>
                <button onClick={submit} disabled={submitting} className="w-full py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50">
                  {submitting ? "Creating..." : "Create assessment"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
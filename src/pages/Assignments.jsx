import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, FileText, AlertCircle, CheckCircle2, Circle, Sparkles, GraduationCap, PenTool, Award } from "lucide-react";
import { useBudPanel } from "@/lib/BudPanelContext";

const TABS = ["Assignments", "Exams", "Revision", "Practice"];

const PRIORITY_COLORS = { high: "text-destructive", medium: "text-primary", low: "text-muted-foreground" };

export default function Assignments() {
  const [tab, setTab] = useState("Assignments");
  const qc = useQueryClient();
  const { openBud } = useBudPanel();

  const { data: assignments } = useQuery({ queryKey: ["assignments"], queryFn: () => base44.entities.Assignment.list("-due_date", 50) });
  const { data: exams } = useQuery({ queryKey: ["exams"], queryFn: () => base44.entities.Exam.list("date", 50) });

  const pending = assignments?.filter(a => a.status === "pending") || [];
  const submitted = assignments?.filter(a => a.status === "submitted" || a.status === "graded") || [];
  const upcomingExams = exams?.filter(e => e.status === "upcoming") || [];
  const overdue = pending.filter(a => new Date(a.due_date) < new Date());

  const toggleStatus = async (a) => {
    await base44.entities.Assignment.update(a.id, { status: a.status === "pending" ? "submitted" : "pending" });
    qc.invalidateQueries({ queryKey: ["assignments"] });
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between pt-12 pb-3 px-5"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Assignments</h1>
          <p className="text-[12px] text-muted-foreground">Stay on top of deadlines</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow"><FileText className="w-5 h-5 text-primary-foreground" /></div>
      </motion.div>

      <div className="px-4 mb-4 flex gap-1.5 p-1 bg-muted/60 rounded-[16px]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 px-2 rounded-[12px] text-[11px] font-semibold transition-all ${tab === t ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="px-4 pb-8 space-y-4">
        {tab === "Assignments" && (
          <>
            <DeadlineCard count={overdue.length} label="Overdue" urgent />
            <DeadlineCard count={pending.length} label="Pending" />

            {pending.length > 0 && <SectionTitle title="Pending" />}
            {pending.map((a, i) => (
              <AssignmentItem key={a.id} assignment={a} onToggle={() => toggleStatus(a)} delay={i * 0.05} openBud={openBud} />
            ))}
            {submitted.length > 0 && <SectionTitle title="Submitted" />}
            {submitted.map((a, i) => (
              <AssignmentItem key={a.id} assignment={a} onToggle={() => toggleStatus(a)} delay={i * 0.05} openBud={openBud} />
            ))}
            {pending.length === 0 && submitted.length === 0 && (
              <EmptyState icon={FileText} title="No assignments yet" subtitle="Your assignments will appear here" />
            )}
          </>
        )}

        {tab === "Exams" && (
          <>
            {upcomingExams.length > 0 ? (
              upcomingExams.map((e, i) => <ExamCard key={e.id} exam={e} delay={i * 0.05} />)
            ) : (
              <EmptyState icon={GraduationCap} title="No upcoming exams" subtitle="Your exam timetable will appear here" />
            )}
          </>
        )}

        {tab === "Revision" && <RevisionPlanner exams={upcomingExams} openBud={openBud} />}
        {tab === "Practice" && <PracticeTests />}
      </div>
    </div>
  );
}

function AssignmentItem({ assignment, onToggle, delay, openBud }) {
  const [showBud, setShowBud] = useState(false);
  const isOverdue = assignment.status === "pending" && new Date(assignment.due_date) < new Date();
  const done = assignment.status === "submitted" || assignment.status === "graded";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover">
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 spring-tap">
          {done ? <CheckCircle2 className="w-5 h-5 text-success" /> : isOverdue ? <AlertCircle className="w-5 h-5 text-destructive" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-heading font-semibold text-[13px] leading-snug ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{assignment.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{assignment.course_code} · {assignment.course_title}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              <Clock className="w-3 h-3" /> {isOverdue ? "Overdue" : new Date(assignment.due_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
            <span className={`text-[10px] font-semibold capitalize ${PRIORITY_COLORS[assignment.priority] || "text-muted-foreground"}`}>{assignment.priority}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{assignment.type}</span>
            {assignment.grade != null && <span className="text-[10px] font-bold text-success">{assignment.grade}/{assignment.max_grade}</span>}
          </div>
        </div>
        <button onClick={() => setShowBud(!showBud)} className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0 spring-tap">
          <Sparkles className="w-4 h-4 text-primary" />
        </button>
      </div>
      {showBud && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border/30 overflow-hidden">
          <p className="text-[11px] text-muted-foreground mb-2">Ask Bud for help with this assignment</p>
          <button onClick={() => openBud("Help me with my " + assignment.course_code + " assignment: " + assignment.title + ". " + (assignment.description || ""))} className="w-full h-[40px] rounded-[14px] bg-primary text-primary-foreground font-semibold text-[12px] flex items-center justify-center gap-1.5 spring-tap">
            <Sparkles className="w-4 h-4" /> Get Help from Bud
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function ExamCard({ exam, delay }) {
  const examDate = new Date(exam.date);
  const daysLeft = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-[16px] bg-primary/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-primary" /></div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-[13px] text-foreground">{exam.title}</p>
          <p className="text-[11px] text-muted-foreground">{exam.course_code}</p>
        </div>
        <span className={`text-[11px] font-bold ${daysLeft <= 3 ? "text-destructive" : "text-muted-foreground"}`}>{daysLeft} days</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="w-3 h-3" /> {examDate.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" /> {exam.start_time}</span>
        {exam.location && <span className="text-[10px] text-muted-foreground">{exam.location}</span>}
        <span className="text-[10px] font-semibold text-primary capitalize">{exam.type}</span>
      </div>
      {exam.topics && exam.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {exam.topics.slice(0, 4).map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-[9px] font-medium text-muted-foreground">{t}</span>)}
        </div>
      )}
      {exam.revision_progress > 0 && (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${exam.revision_progress}%` }} /></div>
          <span className="text-[10px] font-semibold text-muted-foreground">{exam.revision_progress}%</span>
        </div>
      )}
    </motion.div>
  );
}

function RevisionPlanner({ exams, openBud }) {
  return (
    <>
      <SectionTitle title="Revision Plan" />
      {exams.length > 0 ? exams.map((e, i) => (
        <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover">
          <div className="flex items-center gap-2.5 mb-3">
            <PenTool className="w-4 h-4 text-primary" />
            <p className="font-heading font-semibold text-[13px] text-foreground flex-1">{e.course_code} Revision</p>
          </div>
          <div className="space-y-2">
            {["Review notes", "Practice past questions", "Watch Bud summary", "Flashcards", "Mock test"].map((task, ti) => (
              <div key={ti} className="flex items-center gap-2.5 py-1">
                <div className="w-4 h-4 rounded border-2 border-border" />
                <span className="text-[12px] text-foreground">{task}</span>
              </div>
            ))}
          </div>
          <button onClick={() => openBud("Create a revision plan for my " + e.course_code + " exam on " + new Date(e.date).toLocaleDateString() + ". Topics: " + ((e.topics || []).join(", ") || "all course content"))} className="mt-3 w-full h-[40px] rounded-[14px] bg-primary/10 text-primary font-semibold text-[12px] flex items-center justify-center gap-1.5 spring-tap">
            <Sparkles className="w-4 h-4" /> Generate Plan with Bud
          </button>
        </motion.div>
      )) : <EmptyState icon={PenTool} title="No revision needed" subtitle="No upcoming exams to plan for" />}
    </>
  );
}

function PracticeTests() {
  return (
    <>
      <SectionTitle title="Practice Tests" />
      <div className="bg-card rounded-[20px] p-4 soft-shadow border border-primary/20 mb-3">
        <div className="flex items-center gap-2.5 mb-1"><Sparkles className="w-4 h-4 text-primary" /><p className="font-heading font-semibold text-[13px] text-foreground">Bud Practice Mode</p></div>
        <p className="text-[11px] text-muted-foreground">Take AI-generated practice tests tailored to your courses</p>
      </div>
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
          <Award className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
        </div>
        <p className="text-[13px] font-semibold text-foreground">No practice tests yet</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Add courses to generate AI-powered practice tests</p>
      </div>
    </>
  );
}

function DeadlineCard({ count, label, urgent }) {
  return (
    <div className={`rounded-[20px] p-3.5 flex items-center gap-3 ${urgent ? "bg-destructive/10 border border-destructive/20" : "bg-card border border-border/40 soft-shadow"}`}>
      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${urgent ? "bg-destructive/15" : "bg-primary/10"}`}>
        {urgent ? <AlertCircle className="w-[18px] h-[18px] text-destructive" /> : <Clock className="w-[18px] h-[18px] text-primary" />}
      </div>
      <div><p className={`font-heading font-bold text-[18px] ${urgent ? "text-destructive" : "text-foreground"}`}>{count}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>
    </div>
  );
}

function SectionTitle({ title }) { return <p className="font-heading font-bold text-[14px] text-foreground mt-2">{title}</p>; }
function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-12">
      <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
      </div>
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}
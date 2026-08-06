import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { examTypeLabel, examTypeAccent } from "@/lib/exam/examTypes";
import { Clock, ListChecks, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ExamStart() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [user, setUser] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      try { setPaper(await base44.entities.ExamPaper.get(paperId)); } catch {}
      try { setUser(await base44.auth.me()); } catch {}
    })();
  }, [paperId]);

  const start = async () => {
    setStarting(true);
    try {
      const att = await base44.entities.ExamAttempt.create({
        paper_id: paperId,
        user_name: user?.full_name || "",
        status: "in_progress",
        started_at: new Date().toISOString(),
        randomization_seed: Math.floor(Math.random() * 1e9),
        is_proctored: !!paper.is_proctored,
        answers: [],
      });
      navigate(`/exam/take/${att.id}`);
    } catch { setStarting(false); }
  };

  if (!paper) return <div className="p-6 text-muted-foreground">Loading exam…</div>;

  return (
    <div className="w-full max-w-[560px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-5">
      <Link to="/exam" className="text-[13px] text-muted-foreground">← Back to exams</Link>
      <div className="glass-card radius-lg p-5 space-y-3">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${examTypeAccent(paper.exam_type)}22`, color: examTypeAccent(paper.exam_type) }}>{examTypeLabel(paper.exam_type)}</span>
        <h1 className="text-[20px] font-heading font-bold">{paper.title}</h1>
        <p className="text-[13px] text-muted-foreground">{paper.subject || "General"}</p>
        {paper.instructions && <p className="text-[13px] text-muted-foreground/90 glass-card radius-md p-3">{paper.instructions}</p>}
        <div className="grid grid-cols-3 gap-2">
          <Info icon={ListChecks} label="Questions" value={paper.questions_count || 0} />
          <Info icon={Clock} label="Duration" value={`${paper.duration_minutes || 0}m`} />
          <Info icon={CheckCircle2} label="Pass" value={`${paper.pass_mark || 50}%`} />
        </div>
        {paper.is_proctored && (
          <div className="flex items-start gap-2 glass-card radius-md p-3 border border-destructive/30">
            <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-[12px] text-muted-foreground">AI proctoring is enabled. Leaving this tab or window during the exam will be flagged. Stay focused.</p>
          </div>
        )}
        <Button className="w-full" onClick={start} disabled={starting}>{starting ? "Starting…" : "Begin Exam"}</Button>
      </div>
    </div>
  );
}

const Info = ({ icon: Icon, label, value }) => (
  <div className="glass-card radius-md p-3 text-center"><Icon className="w-4 h-4 mx-auto text-primary" /><p className="text-[16px] font-heading font-bold mt-1">{value}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p></div>
);
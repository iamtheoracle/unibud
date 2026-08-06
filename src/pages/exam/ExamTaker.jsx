import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";
import { computeScore, seededShuffle } from "@/lib/exam/grading";

export default function ExamTaker() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [flagModal, setFlagModal] = useState(false);
  const saveRef = useRef();
  const proctorRef = useRef([]);

  useEffect(() => {
    (async () => {
      try {
        const att = await base44.entities.ExamAttempt.get(attemptId);
        setAttempt(att);
        const p = await base44.entities.ExamPaper.get(att.paper_id);
        setPaper(p);
        const qs = await base44.entities.ExamQuestion.filter({ paper_id: p.id });
        setQuestions(p.randomize ? seededShuffle(qs, att.randomization_seed || 1) : qs);
        const map = {};
        (att.answers || []).forEach((a) => (map[a.question_id] = a.answer));
        setAnswers(map);
        const end = new Date(att.started_at).getTime() + (p.duration_minutes || 0) * 60000;
        setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
      } catch { toast({ title: "Could not load exam" }); }
    })();
  }, [attemptId]);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (attempt && left === 0 && !submitting) submit(true);   }, [left]);

  useEffect(() => {
    if (!paper?.is_proctored) return;
    const onVis = () => { if (document.hidden) { proctorRef.current.push({ type: "tab_hidden", at: new Date().toISOString() }); toast({ title: "Proctoring alert", description: "Leaving the exam is recorded.", variant: "destructive" }); } };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [paper?.is_proctored]);

  const save = (next) => {
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const arr = Object.entries(next).map(([question_id, answer]) => ({ question_id, answer }));
      try { await base44.entities.ExamAttempt.update(attemptId, { answers: arr, proctor_flags: proctorRef.current }); } catch {}
    }, 1200);
  };

  const setAns = (qId, value) => { const n = { ...answers, [qId]: value }; setAnswers(n); save(n); };

  const submit = async (auto = false) => {
    if (submitting) return;
    if (!auto && !confirm("Submit your exam? You cannot change answers after.")) return;
    setSubmitting(true);
    const arr = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
    const { earned, total, percent } = computeScore(questions, answers);
    try {
      await base44.entities.ExamAttempt.update(attemptId, {
        status: "completed", answers: arr, score: earned, total_marks: total, score_percent: percent,
        completed_at: new Date().toISOString(),
        duration_seconds: attempt ? Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000) : 0,
        proctor_flags: proctorRef.current,
      });
      if (paper && percent >= (paper.pass_mark || 50)) {
        try {
          await base44.entities.ExamCertificate.create({
            attempt_id: attemptId, paper_id: paper.id, user_name: attempt?.user_name || "", paper_title: paper.title,
            exam_type: paper.exam_type, subject: paper.subject, score_percent: percent,
            certificate_code: `UNIBUD-${(paper.exam_type || "EX").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
            issued_at: new Date().toISOString(),
          });
        } catch {}
      }
      navigate(`/exam/result/${attemptId}`);
    } catch { setSubmitting(false); toast({ title: "Submit failed" }); }
  };

  if (!paper) return <div className="p-6 text-muted-foreground">Loading exam…</div>;
  const q = questions[idx];
  const opts = q && q.type === "mcq" ? seededShuffle(q.options || [], (attempt?.randomization_seed || 1) + idx + 7) : [];
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-[15px] truncate">{paper.title}</h2>
          <p className="text-[11px] text-muted-foreground">{answered}/{questions.length} answered</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-heading font-bold text-[14px] ${left < 60 ? "bg-destructive/15 text-destructive animate-pulse" : "glass"}`}>
          <Clock className="w-4 h-4" />{fmt(left)}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="max-w-[640px] mx-auto space-y-4">
          <div className="flex gap-1 flex-wrap">
            {questions.map((qq, i) => (
              <button key={qq.id} onClick={() => setIdx(i)} className={`w-8 h-8 rounded-lg text-[12px] font-semibold spring-tap ${i === idx ? "bg-primary text-primary-foreground" : answers[qq.id] ? "bg-success/20 text-success" : "glass text-muted-foreground"}`}>{i + 1}</button>
            ))}
          </div>

          {q && (
            <div className="glass-card radius-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Q{idx + 1} · {q.topic || "—"} · {q.marks || 1} mark(s)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{q.difficulty}</span>
              </div>
              <p className="text-[15px] font-body leading-relaxed">{q.question}</p>

              {q.type === "mcq" && (
                <div className="space-y-2">
                  {opts.map((o) => (
                    <button key={o} onClick={() => setAns(q.id, o)} className={`w-full text-left px-4 py-3 rounded-xl border text-[14px] spring-tap ${answers[q.id] === o ? "border-primary bg-primary/15 text-foreground" : "border-border glass"}`}>{o}</button>
                  ))}
                </div>
              )}
              {q.type === "true_false" && (
                <div className="grid grid-cols-2 gap-2">
                  {["true", "false"].map((o) => (
                    <button key={o} onClick={() => setAns(q.id, o)} className={`px-4 py-3 rounded-xl border text-[14px] font-semibold capitalize spring-tap ${answers[q.id] === o ? "border-primary bg-primary/15" : "border-border glass"}`}>{o}</button>
                  ))}
                </div>
              )}
              {(q.type === "short_answer" || q.type === "essay") && (
                <Textarea value={answers[q.id] || ""} onChange={(e) => setAns(q.id, e.target.value)} rows={q.type === "essay" ? 6 : 3} placeholder="Type your answer…" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}><ChevronLeft className="w-4 h-4 mr-1" />Prev</Button>
            {idx < questions.length - 1 ? (
              <Button onClick={() => setIdx((i) => i + 1)}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
            ) : (
              <Button onClick={() => submit(false)} disabled={submitting}><Send className="w-4 h-4 mr-1" />Submit</Button>
            )}
          </div>
        </div>
      </div>

      {paper.is_proctored && (
        <div className="px-4 py-2 border-t border-border bg-destructive/5 flex items-center gap-2 text-[12px] text-destructive">
          <AlertTriangle className="w-4 h-4" /> Proctored · {proctorRef.current.length} flag(s)
        </div>
      )}
    </div>
  );
}

function fmt(s) { const m = Math.floor(s / 60); const ss = s % 60; return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`; }
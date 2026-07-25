import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { examTypeLabel, examTypeAccent } from "@/lib/exam/examTypes";
import { Award, Sparkles, Loader2, Printer, RefreshCw, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ExamResult() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [cert, setCert] = useState(null);
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const att = await base44.entities.ExamAttempt.get(attemptId);
        setAttempt(att);
        const p = await base44.entities.ExamPaper.get(att.paper_id);
        setPaper(p);
        setQuestions(await base44.entities.ExamQuestion.filter({ paper_id: p.id }));
        try { const certs = await base44.entities.ExamCertificate.filter({ attempt_id: attemptId }); setCert(certs[0] || null); } catch {}
      } catch {}
    })();
  }, [attemptId]);

  const passed = attempt && paper && attempt.score_percent >= (paper.pass_mark || 50);
  const answersMap = {};
  (attempt?.answers || []).forEach((a) => (answersMap[a.question_id] = a.answer));

  const wrong = questions.filter((q) => q.type === "mcq" || q.type === "true_false").filter((q) => String(answersMap[q.id] ?? "") !== String(q.correct_answer ?? ""));

  const buildRevision = async () => {
    setLoading(true); setRevision("");
    const prompt = `You are Bud, a warm exam coach. A student just finished "${paper?.title}" and scored ${attempt?.score_percent}%. These topics were answered incorrectly:\n${wrong.map((w) => `- ${w.question} (correct: ${w.correct_answer}${w.explanation ? ` — ${w.explanation}` : ""})`).join("\n")}\n\nWrite a concise, encouraging revision plan covering these topics with key points to remember. Use simple headings.`;
    try { const res = await base44.integrations.Core.InvokeLLM({ prompt }); setRevision(typeof res === "string" ? res : JSON.stringify(res)); }
    catch { toast({ title: "Bud is unavailable" }); }
    finally { setLoading(false); }
  };

  if (!attempt || !paper) return <div className="p-6 text-muted-foreground">Loading result…</div>;

  return (
    <div className="w-full max-w-[640px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-5">
      <Link to="/exam" className="text-[13px] text-muted-foreground">← Back to exams</Link>

      <div className={`glass-card radius-lg p-6 text-center ${passed ? "border-success/40" : "border-destructive/40"}`}>
        <div className={`w-16 h-16 rounded-full grid place-items-center mx-auto ${passed ? "bg-success/20" : "bg-destructive/15"}`}>
          {passed ? <Check className="w-8 h-8 text-success" /> : <X className="w-8 h-8 text-destructive" />}
        </div>
        <h1 className="text-[22px] font-heading font-bold mt-3">{passed ? "Passed" : "Not yet"}</h1>
        <p className="text-[13px] text-muted-foreground">{paper.title}</p>
        <p className="text-[40px] font-heading font-bold mt-2">{attempt.score_percent}%</p>
        <p className="text-[13px] text-muted-foreground">{attempt.score}/{attempt.total_marks} marks · pass mark {paper.pass_mark}%</p>
        {attempt.is_proctored && attempt.proctor_flags?.length > 0 && (
          <p className="text-[12px] text-destructive mt-2">⚠ {attempt.proctor_flags.length} proctoring flag(s) recorded</p>
        )}
      </div>

      {cert && (
        <div className="glass-card radius-lg p-5 border-2 border-primary/40">
          <div className="flex items-center gap-2 mb-2"><Award className="w-5 h-5 text-primary" /><h3 className="font-heading font-semibold">Certificate of Achievement</h3></div>
          <p className="text-[13px]">Awarded to <span className="font-semibold">{cert.user_name || "You"}</span></p>
          <p className="text-[13px] text-muted-foreground">{cert.paper_title} · {examTypeLabel(cert.exam_type)}</p>
          <p className="text-[11px] text-muted-foreground mt-2 font-mono">Code: {cert.certificate_code}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print / Save PDF</Button>
        </div>
      )}

      <div>
        <h3 className="font-heading font-semibold text-[15px] mb-2">Review</h3>
        <div className="space-y-2">
          {questions.map((q, i) => {
            const yours = answersMap[q.id];
            const correct = q.type === "mcq" || q.type === "true_false" ? String(yours ?? "") === String(q.correct_answer ?? "") : null;
            return (
              <div key={q.id} className="glass-card radius-lg p-3">
                <div className="flex items-start gap-2">
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${correct === true ? "bg-success/20 text-success" : correct === false ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>{correct === true ? "Correct" : correct === false ? "Wrong" : "Written"}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">Q{i + 1}. {q.question}</p>
                    {q.type === "mcq" || q.type === "true_false" ? (
                      <>
                        <p className="text-[12px] text-muted-foreground mt-1">Your answer: {yours || "—"}</p>
                        {correct === false && <p className="text-[12px] text-success mt-0.5">Correct: {q.correct_answer}</p>}
                      </>
                    ) : (
                      <p className="text-[12px] text-muted-foreground mt-1">Your answer: {yours || "—"} (not auto-graded)</p>
                    )}
                    {q.explanation && <p className="text-[12px] text-muted-foreground/80 mt-1 italic">{q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card radius-lg p-5 space-y-3">
        <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /><h3 className="font-heading font-semibold">Revision Assistant</h3></div>
        <p className="text-[12px] text-muted-foreground">Bud builds a study plan from the questions you missed.</p>
        <Button onClick={buildRevision} disabled={loading} variant="secondary">{loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Building…</> : "Build revision plan"}</Button>
        {revision && <pre className="whitespace-pre-wrap text-[13px] font-body leading-relaxed glass-card radius-md p-3">{revision}</pre>}
      </div>

      <Button asChild variant="secondary" className="w-full"><Link to="/exam"><RefreshCw className="w-4 h-4 mr-1" />Back to Exams</Link></Button>
    </div>
  );
}
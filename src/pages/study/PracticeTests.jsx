import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

const SCHEMA = { type: "object", properties: { questions: { type: "array", items: { type: "object", properties: { type: { type: "string" }, question: { type: "string" }, options: { type: "array", items: { type: "string" } }, answer: { type: "string" }, explanation: { type: "string" } } } } } };

const normalize = (s) => String(s || "").trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

export default function PracticeTests() {
  const qc = useQueryClient();
  const { data: attempts } = useQuery({ queryKey: ["quizAttempts"], queryFn: () => base44.entities.QuizAttempt.list("-taken_at", 20) });
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [types, setTypes] = useState(["mcq", "true_false"]);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const save = useMutation({ mutationFn: (v) => base44.entities.QuizAttempt.create(v), onSuccess: () => qc.invalidateQueries({ queryKey: ["quizAttempts"] }) });

  const toggleType = (t) => setTypes((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t]);

  const run = async () => {
    if (!topic.trim()) { toast({ title: "Enter a topic" }); return; }
    setLoading(true); setQuiz(null); setAnswers({}); setSubmitted(false);
    const typeMap = { mcq: "multiple choice", true_false: "true or false", short_answer: "short answer", essay: "essay", fill: "fill in the blanks" };
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `Generate a ${difficulty} practice test on "${topic}" with ${count} questions. Use these types: ${types.map((t) => typeMap[t]).join(", ")}. For multiple choice and true/false, include options; for short answer/essay/fill, leave options empty and put the expected answer in "answer". Include a brief explanation for each.`, response_json_schema: SCHEMA });
      setQuiz(res?.questions || []);
    } catch { toast({ title: "Generation failed — try again" }); }
    finally { setLoading(false); }
  };

  const submit = () => {
    let correct = 0;
    quiz.forEach((q, i) => { const a = answers[i]; if (q.type === "mcq" || q.type === "true_false") { if (String(a) === String(q.answer)) correct++; } else { if (a && normalize(a) === normalize(q.answer)) correct++; } });
    const pct = Math.round((correct / quiz.length) * 100);
    setSubmitted(true);
    save.mutate({ topic, question_types: types, total_questions: quiz.length, correct, score_percent: pct, difficulty, taken_at: new Date().toISOString() });
    if (pct >= 80) setDifficulty((d) => (d === "easy" ? "medium" : "hard"));
    else if (pct < 50) setDifficulty((d) => (d === "hard" ? "medium" : "easy"));
    toast({ title: `Scored ${pct}%` });
  };

  const avgScore = () => { if (!attempts?.length) return null; return Math.round(attempts.reduce((s, a) => s + (a.score_percent || 0), 0) / attempts.length); };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Practice Tests" />
      {avgScore() != null && <div className="glass-card p-3.5 mb-4 border border-primary/15 bg-primary/8"><p className="text-[13px] text-foreground/90">Average across {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}: <span className="font-heading font-bold text-primary">{avgScore()}%</span></p></div>}
      {!quiz && (
        <div className="space-y-3">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic e.g. Organic chemistry" className="w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" />
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Question types</label>
            <div className="flex flex-wrap gap-2 mt-1.5">{[["mcq", "Multiple choice"], ["true_false", "True / False"], ["short_answer", "Short answer"], ["essay", "Essay"], ["fill", "Fill in the blanks"]].map(([k, l]) => <button key={k} onClick={() => toggleType(k)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold spring-tap ${types.includes(k) ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{l}</button>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Questions</label><select value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60">{[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
            <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Difficulty</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60">{["easy", "medium", "hard"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}</select></div>
          </div>
          <button onClick={run} disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Generating…" : "Generate test"}</button>
        </div>
      )}
      {loading && <div className="glass-card p-4 mt-4"><BudThinking label="Bud is writing your test…" /></div>}
      {quiz && (
        <div className="space-y-3 mt-2">
          {quiz.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
              <p className="text-[13px] font-semibold text-foreground">{i + 1}. {q.question}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{q.type?.replace("_", " ")}</p>
              {q.options?.length > 0 ? (
                <div className="space-y-1.5 mt-2">{q.options.map((o, j) => { const selected = answers[i] === o; const correct = submitted && o === q.answer; const wrong = submitted && selected && o !== q.answer; return (<button key={j} onClick={() => !submitted && setAnswers({ ...answers, [i]: o })} className={`w-full text-left p-2.5 rounded-xl text-[13px] spring-tap ${correct ? "bg-primary/20 text-primary" : wrong ? "bg-destructive/15 text-destructive" : selected ? "bg-primary/10 text-foreground" : "bg-muted/30 text-foreground/80"}`}>{o}</button>); })}</div>
              ) : (
                <input value={answers[i] || ""} onChange={(e) => !submitted && setAnswers({ ...answers, [i]: e.target.value })} disabled={submitted} placeholder="Your answer…" className="mt-2 w-full h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" />
              )}
              {submitted && <p className="text-[12px] text-muted-foreground mt-2">Answer: <span className="text-foreground font-semibold">{q.answer}</span>{q.explanation ? ` — ${q.explanation}` : ""}</p>}
            </motion.div>
          ))}
          {!submitted ? <button onClick={submit} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap ice-glow">Submit test</button>
            : <button onClick={() => { setQuiz(null); setAnswers({}); setSubmitted(false); }} className="w-full h-[52px] rounded-2xl glass text-foreground font-heading font-semibold text-[15px] spring-tap">New test</button>}
        </div>
      )}
    </div>
  );
}
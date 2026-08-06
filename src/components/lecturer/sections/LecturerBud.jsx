import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Select } from "../ui";

const MODES = [
  { key: "rubric", label: "Rubric", prompt: (t) => `Create a clear grading rubric for: ${t}. Use a 4-level scale with descriptors.` },
  { key: "questions", label: "Question Generation", prompt: (t) => `Generate 10 exam-style questions (mix MCQ and short answer) with answers on: ${t}.` },
  { key: "lesson", label: "Lesson Plan", prompt: (t) => `Build a 60-minute lesson plan with objectives, activities, and assessment for: ${t}.` },
  { key: "summary", label: "Course Summary", prompt: (t) => `Summarise the key concepts of: ${t} for students in concise bullet points.` },
  { key: "writing", label: "Academic Writing", prompt: (t) => `Improve and academically refine this text: ${t}` },
  { key: "moderation", label: "Exam Moderation", prompt: (t) => `Review this exam paper for balance, coverage, and bias; suggest improvements: ${t}` },
];

export default function LecturerBud() {
  const [mode, setMode] = useState(MODES[0].key);
  const [topic, setTopic] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topic) { toast({ title: "Enter a topic or text" }); return; }
    setLoading(true); setOut("");
    try { const m = MODES.find((x) => x.key === mode); const res = await base44.integrations.Core.InvokeLLM({ prompt: m.prompt(topic) }); setOut(typeof res === "string" ? res : JSON.stringify(res, null, 2)); }
    catch { toast({ title: "Bud is unavailable" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 max-w-[760px]">
      <div className="glass-card radius-lg p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center"><Sparkles className="w-5 h-5 text-primary" /></div>
        <div><p className="font-heading font-semibold text-[15px]">Bud — Teaching Assistant</p><p className="text-[12px] text-muted-foreground">Rubrics · questions · lesson plans · summaries · writing · moderation</p></div>
      </div>
      <div className="glass-card radius-lg p-4 space-y-3">
        <Select label="Task" value={mode} onChange={setMode} options={MODES.map((m) => m.key)} />
        <UDSInput label="Topic / Text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Introductory Calculus" />
        <UDSButton onClick={run} disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Working…</> : "Ask Bud"}</UDSButton>
      </div>
      {out && <div className="glass-card radius-lg p-4"><p className="text-[12px] font-semibold text-muted-foreground mb-2">Result</p><pre className="whitespace-pre-wrap text-[13px] font-body leading-relaxed">{out}</pre></div>}
    </div>
  );
}
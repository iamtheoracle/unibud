import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import UploadTile from "@/components/study/UploadTile";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

const SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    key_concepts: { type: "array", items: { type: "string" } },
    definitions: { type: "array", items: { type: "object", properties: { term: { type: "string" }, definition: { type: "string" } } } },
    flashcards: { type: "array", items: { type: "object", properties: { front: { type: "string" }, back: { type: "string" } } } },
    quiz: { type: "array", items: { type: "object", properties: { question: { type: "string" }, options: { type: "array", items: { type: "string" } }, answer: { type: "string" } } } },
    practice_questions: { type: "array", items: { type: "string" } },
    difficult_topics: { type: "array", items: { type: "string" } },
  },
};

export default function SmartNotes() {
  const [fileUrl, setFileUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  const run = async () => {
    if (!fileUrl && !text.trim()) { toast({ title: "Upload a file or paste notes" }); return; }
    setLoading(true); setData(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these study materials and produce a structured breakdown for revision. ${text.trim() ? `Notes:\n${text.trim()}` : "See attached document."} Summarize, extract key concepts and definitions, create flashcards, a short quiz, practice questions, and identify difficult topics.`,
        response_json_schema: SCHEMA,
        ...(fileUrl ? { file_urls: [fileUrl] } : {}),
      });
      setData(res || null);
    } catch { toast({ title: "Analysis failed — try again" }); }
    finally { setLoading(false); }
  };

  const saveFlashcards = async () => {
    if (!data?.flashcards?.length) return;
    setSaving(true);
    try { await base44.entities.Flashcard.bulkCreate(data.flashcards.map((f) => ({ front: f.front, back: f.back, deck: "Smart Notes", difficulty: "medium" }))); toast({ title: `Saved ${data.flashcards.length} flashcards` }); }
    catch { toast({ title: "Save failed" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Smart Notes" />
      <div className="space-y-2 mb-3">
        <UploadTile label="Upload PDF, Word, slides, or image" accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx" onUploaded={(u) => setFileUrl(u)} />
        {fileUrl && <p className="text-[11px] text-primary">Document attached</p>}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="…or paste notes here" className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60 mb-3" />
      <button onClick={run} disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Analyzing…" : "Analyze with Bud"}</button>
      {loading && <div className="glass-card p-4 mt-4"><BudThinking label="Bud is summarizing, extracting concepts, building flashcards and quizzes…" /></div>}
      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
          {data.summary && <Section title="Summary"><p className="text-[13px] text-foreground/90 leading-relaxed">{data.summary}</p></Section>}
          {data.key_concepts?.length > 0 && <Section title="Key Concepts"><ul className="list-disc list-inside space-y-1">{data.key_concepts.map((c, i) => <li key={i} className="text-[13px] text-foreground/80">{c}</li>)}</ul></Section>}
          {data.definitions?.length > 0 && <Section title="Definitions"><div className="space-y-2">{data.definitions.map((d, i) => <div key={i}><span className="text-[13px] font-semibold text-foreground">{d.term}: </span><span className="text-[13px] text-muted-foreground">{d.definition}</span></div>)}</div></Section>}
          {data.flashcards?.length > 0 && <Section title={`Flashcards (${data.flashcards.length})`}><div className="space-y-2">{data.flashcards.map((f, i) => <div key={i} className="p-3 rounded-xl bg-muted/30"><p className="text-[12px] font-semibold text-foreground">{f.front}</p><p className="text-[12px] text-muted-foreground mt-1">{f.back}</p></div>)}</div><button onClick={saveFlashcards} disabled={saving} className="text-[12px] font-semibold text-primary spring-tap mt-2">{saving ? "Saving…" : "Save to Flashcards"}</button></Section>}
          {data.quiz?.length > 0 && <Section title="Quick Quiz"><div className="space-y-2">{data.quiz.map((q, i) => <div key={i} className="p-3 rounded-xl bg-muted/30"><p className="text-[12px] font-semibold text-foreground">{q.question}</p><p className="text-[11px] text-muted-foreground mt-1">Answer: {q.answer}</p></div>)}</div></Section>}
          {data.practice_questions?.length > 0 && <Section title="Practice Questions"><ul className="list-disc list-inside space-y-1">{data.practice_questions.map((q, i) => <li key={i} className="text-[13px] text-foreground/80">{q}</li>)}</ul></Section>}
          {data.difficult_topics?.length > 0 && <Section title="Difficult Topics"><p className="text-[13px] text-muted-foreground">{data.difficult_topics.join(", ")}</p></Section>}
        </motion.div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (<div className="glass-card p-4"><p className="text-[13px] font-bold text-foreground mb-2">{title}</p>{children}</div>);
}
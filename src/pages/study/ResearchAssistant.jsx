import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import AIModeSelector from "@/components/study/AIModeSelector";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

const SCHEMA = {
  type: "object",
  properties: {
    overview: { type: "string" },
    sources: { type: "array", items: { type: "object", properties: { title: { type: "string" }, authors: { type: "string" }, year: { type: "string" }, url: { type: "string" } } } },
    reading_list: { type: "array", items: { type: "string" } },
    concepts: { type: "array", items: { type: "object", properties: { term: { type: "string" }, explanation: { type: "string" } } } },
    research_plan: { type: "string" },
  },
};

export default function ResearchAssistant() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("research");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  const run = async () => {
    if (!topic.trim()) { toast({ title: "Enter a research topic" }); return; }
    setLoading(true); setData(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud in Research Mode. Research topic: "${topic}". Use web context to: give an overview, list credible sources (with title, authors, year, url), suggest a reading list, explain key concepts, and outline a research plan. Mode: ${mode}.`,
        add_context_from_internet: true, model: "gemini_3_flash",
        response_json_schema: SCHEMA,
      });
      setData(res || null);
    } catch { toast({ title: "Research failed — try again" }); }
    finally { setLoading(false); }
  };

  const saveSources = async () => {
    if (!data?.sources?.length) return;
    setSaving(true);
    try {
      await base44.entities.Citation.bulkCreate(data.sources.map((s) => ({
        title: s.title || "Untitled", authors: s.authors || "", year: s.year || "", url: s.url || "",
        source_type: "journal", citation_style: "APA 7",
        formatted: `${s.authors || ""} (${s.year || "n.d."}). ${s.title || "Untitled"}. ${s.url || ""}`,
      })));
      toast({ title: `Saved ${data.sources.length} sources to Citations` });
    } catch { toast({ title: "Save failed" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Research Assistant" />
      <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} placeholder="What are you researching?" className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60 mb-3" />
      <AIModeSelector mode={mode} setMode={setMode} />
      <button onClick={run} disabled={loading} className="w-full h-[52px] mt-3 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Researching…" : "Research with Bud"}</button>
      {loading && <div className="glass-card p-4 mt-4"><BudThinking label="Bud is searching sources and organizing research…" /></div>}
      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
          {data.overview && <Section title="Overview"><p className="text-[13px] text-foreground/90 leading-relaxed">{data.overview}</p></Section>}
          {data.concepts?.length > 0 && <Section title="Key Concepts"><div className="space-y-2">{data.concepts.map((c, i) => <div key={i}><span className="text-[13px] font-semibold text-foreground">{c.term}: </span><span className="text-[13px] text-muted-foreground">{c.explanation}</span></div>)}</div></Section>}
          {data.sources?.length > 0 && <Section title={`Sources (${data.sources.length})`}><div className="space-y-2">{data.sources.map((s, i) => <div key={i} className="p-3 rounded-xl bg-muted/30"><p className="text-[12px] font-semibold text-foreground">{s.title}</p><p className="text-[11px] text-muted-foreground">{s.authors}{s.year ? ` · ${s.year}` : ""}</p>{s.url && <a href={s.url} target="_blank" rel="noreferrer" className="text-[11px] text-primary">Open</a>}</div>)}</div><button onClick={saveSources} disabled={saving} className="text-[12px] font-semibold text-primary spring-tap mt-2">{saving ? "Saving…" : "Save sources to Citations"}</button></Section>}
          {data.reading_list?.length > 0 && <Section title="Reading List"><ul className="list-disc list-inside space-y-1">{data.reading_list.map((r, i) => <li key={i} className="text-[13px] text-foreground/80">{r}</li>)}</ul></Section>}
          {data.research_plan && <Section title="Research Plan"><p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{data.research_plan}</p></Section>}
        </motion.div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (<div className="glass-card p-4"><p className="text-[13px] font-bold text-foreground mb-2">{title}</p>{children}</div>);
}
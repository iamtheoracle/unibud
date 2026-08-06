import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import AIModeSelector from "@/components/study/AIModeSelector";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

const ACTIONS = [
  ["topics", "Generate topics"],
  ["proposal", "Draft proposal"],
  ["outline", "Chapter outline"],
  ["literature", "Literature review plan"],
  ["methodology", "Methodology guidance"],
  ["timeline", "Timeline plan"],
];

export default function ProjectAssistant() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("project");
  const [action, setAction] = useState("topics");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const run = async () => {
    if (!topic.trim()) { toast({ title: "Enter a topic or idea first" }); return; }
    setLoading(true); setResult("");
    const map = { topics: "suggest 5 specific project topic ideas", proposal: "draft a clear project proposal", outline: "create a chapter-by-chapter outline", literature: "plan a literature review with themes and sources", methodology: "recommend a research methodology with justification", timeline: "build a project timeline with milestones" };
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `You are Bud, a research companion. Mode: ${mode}. Project idea: "${topic}". Please ${map[action]}. Keep it structured, practical, and encouraging.` });
      setResult(typeof res === "string" ? res : res?.response || "Here's a starting point.");
    } catch { setResult("I'm here — try again in a moment."); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!result) return;
    try { await base44.entities.Project.create({ title: topic, notes: result, status: "planning" }); toast({ title: "Saved to Projects" }); }
    catch { toast({ title: "Save failed" }); }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Project Assistant" />
      <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} placeholder="What's your project about?" className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60 mb-3" />
      <AIModeSelector mode={mode} setMode={setMode} />
      <div className="grid grid-cols-2 gap-2 my-3">
        {ACTIONS.map(([k, l]) => <button key={k} onClick={() => setAction(k)} className={`px-3 py-2.5 rounded-2xl text-[12px] font-semibold spring-tap ${action === k ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{l}</button>)}
      </div>
      <button onClick={run} disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Working…" : "Run"}</button>
      {(loading || result) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
          {loading ? <BudThinking label="Bud is researching…" /> : (
            <>
              <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{result}</p>
              <button onClick={save} className="text-[12px] font-semibold text-primary spring-tap mt-3">Save to Projects</button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
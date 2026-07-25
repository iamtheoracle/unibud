import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import UploadTile from "@/components/study/UploadTile";
import AIModeSelector from "@/components/study/AIModeSelector";
import BudThinking from "@/components/study/BudThinking";
import { toast } from "@/components/ui/use-toast";

const STYLES = ["APA 7", "MLA", "Chicago", "Harvard", "IEEE"];

export default function AssignmentAssistant() {
  const [q, setQ] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [mode, setMode] = useState("assignment");
  const [style, setStyle] = useState("APA 7");
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [result, setResult] = useState("");

  const addVoice = async (file_url) => {
    setTranscribing(true);
    try { const text = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url }); setVoiceText(text || ""); toast({ title: "Voice transcribed" }); }
    catch { toast({ title: "Transcription failed" }); }
    finally { setTranscribing(false); }
  };

  const run = async () => {
    const full = [q.trim(), voiceText ? `Voice note: ${voiceText}` : ""].filter(Boolean).join("\n\n");
    if (!full && !fileUrl) { toast({ title: "Add a question, file, or voice note" }); return; }
    setLoading(true); setResult("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud, a supportive academic tutor. Mode: ${mode}. ${full ? `Question/assignment:\n${full}` : "Analyze the attached document and help the student understand it."}
Help by: (1) explaining the question simply, (2) breaking the problem into clear steps (guide learning, don't just give the answer), (3) helpful hints, (4) a structured answer outline the student can build on, (5) grammar suggestions, (6) plagiarism risk and how to avoid it, (7) 3 references in ${style} style. Never encourage academic dishonesty.`,
        ...(fileUrl ? { file_urls: [fileUrl] } : {}),
      });
      setResult(typeof res === "string" ? res : res?.response || "Here's some guidance.");
    } catch { setResult("I'm here — try again in a moment."); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Assignment Assistant" />
      <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={4} placeholder="Paste your question or assignment here…" className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60 mb-3" />
      <div className="space-y-2 mb-3">
        <UploadTile label="Upload document or photo" accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx" onUploaded={(u) => setFileUrl(u)} />
        {fileUrl && <p className="text-[11px] text-primary">Document attached</p>}
        <UploadTile label={transcribing ? "Transcribing…" : "Record / upload voice note"} accept="audio/*" onUploaded={addVoice} />
        {voiceText && <p className="text-[11px] text-muted-foreground italic line-clamp-2">{voiceText}</p>}
      </div>
      <AIModeSelector mode={mode} setMode={setMode} />
      <div className="mt-3 mb-4">
        <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Citation style</label>
        <select value={style} onChange={(e) => setStyle(e.target.value)} className="mt-1.5 w-full h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60">{STYLES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      <button onClick={run} disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{loading ? "Working…" : "Get help from Bud"}</button>
      <p className="text-[10px] text-muted-foreground/70 mt-2 text-center">Bud supports learning — it won't write answers to submit as your own.</p>
      {(loading || result) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mt-4">
          {loading ? <BudThinking label="Bud is guiding you…" /> : <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">{result}</p>}
        </motion.div>
      )}
    </div>
  );
}
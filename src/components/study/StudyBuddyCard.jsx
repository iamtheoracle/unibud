import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { Sparkles, Mic, Send, FileQuestion, BookOpen, Calculator, Languages, ClipboardList, GraduationCap } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const STUDY_PROMPTS = [
  { label: "Explain a Topic", icon: BookOpen, prompt: "Explain a topic I'm struggling with in simple terms with examples." },
  { label: "Solve a Question", icon: Calculator, prompt: "Help me solve this question step by step without just giving the answer." },
  { label: "Quiz Me", icon: FileQuestion, prompt: "Quiz me on my weakest subject and check my answers with feedback." },
  { label: "Summarize Lecture", icon: BookOpen, prompt: "Summarize my latest lecture into the key points I must remember." },
  { label: "Citation Help", icon: ClipboardList, prompt: "Help me format citations in APA for my current sources." },
  { label: "Translate Notes", icon: Languages, prompt: "Translate my study notes into simpler, clearer language." },
];

/**
 * StudyBuddyCard — Study Buddy lives inside Bud. This card surfaces
 * study-focused prompts that open Bud (the companion) with context.
 * It does NOT reimplement Bud — it routes into the existing companion.
 */
export default function StudyBuddyCard({ message }) {
  const navigate = useNavigate();
  const { openWithPrompt, openVoice } = useBudLauncher();
  const [text, setText] = React.useState("");
  const submit = (e) => { e?.preventDefault?.(); const v = text.trim(); if (!v) return; setText(""); openWithPrompt(v); };

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="crystal-card p-5 light-bloom">
      <div className="flex items-center gap-3 mb-3">
        <div className="bud-breathe"><GraduationCap className="w-9 h-9 text-primary" strokeWidth={1.6} /></div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-[15px] text-foreground leading-tight">Study Buddy</p>
          <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">{message || "Your personal tutor, researcher & study coach — powered by Bud."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2 items-center">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask your study buddy anything…" className="flex-1 h-11 px-4 rounded-2xl bg-muted/40 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 min-w-0" />
        <button type="submit" className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center spring-tap ice-glow flex-shrink-0" aria-label="Send to Bud"><Send className="w-4 h-4" /></button>
        <button type="button" onClick={openVoice} className="w-11 h-11 rounded-2xl glass text-primary flex items-center justify-center spring-tap flex-shrink-0" aria-label="Voice tutor"><Mic className="w-4 h-4" /></button>
      </form>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {STUDY_PROMPTS.map((q) => (
          <button key={q.label} onClick={() => openWithPrompt(q.prompt)} className="flex items-center gap-2 p-3 rounded-2xl glass spring-tap card-hover min-w-0">
            <q.icon className="w-[18px] h-[18px] text-primary shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] font-semibold text-foreground truncate">{q.label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => navigate("/bud")} className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl glass spring-tap">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-[12px] font-semibold text-foreground">Open Bud companion</span>
      </button>
    </motion.section>
  );
}
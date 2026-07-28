import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Send, FileText, BookOpen, HelpCircle, CalendarClock, Languages, Layers, FolderKanban } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";

const EASE = [0.16, 1, 0.3, 1];

const QUICK_PROMPTS = [
  { label: "Explain Assignment", icon: FileText, prompt: "Explain my next assignment to me step by step so I know exactly what to do." },
  { label: "Summarize Lecture", icon: BookOpen, prompt: "Summarize today's lecture notes into the key points I need to remember." },
  { label: "Quiz Me", icon: HelpCircle, prompt: "Quiz me on my weakest topic and check my answers." },
  { label: "Study Planner", icon: CalendarClock, prompt: "Plan my study schedule for this week around my deadlines and classes." },
  { label: "Ask About Timetable", icon: CalendarClock, prompt: "What classes do I have today and what should I prepare for each?" },
  { label: "Translate Notes", icon: Languages, prompt: "Translate my notes into simple, easy-to-understand language." },
  { label: "Generate Flashcards", icon: Layers, prompt: "Generate flashcards from my recent notes for revision." },
  { label: "Project Assistant", icon: FolderKanban, prompt: "Help me break my project into tasks and a timeline." },
];

export default function BudHero({ message }) {
  const { openWithPrompt, openVoice } = useBudLauncher();
  const [text, setText] = useState("");
  const submit = (e) => { e?.preventDefault?.(); const v = text.trim(); if (!v) return; setText(""); openWithPrompt(v); };

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="crystal-card p-5 light-bloom">
      <div className="flex items-center gap-3 mb-3.5">
        <div className="bud-breathe"><BudVoiceOrb size={44} state="idle" /></div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-[15px] text-foreground leading-tight">Bud</p>
          <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">{message || "Your academic companion — ask anything."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2 items-center">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Ask Bud anything…"
          className="flex-1 h-12 px-4 rounded-2xl bg-muted/40 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 min-w-0"
        />
        <button type="submit" className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center spring-tap ice-glow flex-shrink-0" aria-label="Send to Bud">
          <Send className="w-4 h-4" strokeWidth={2} />
        </button>
        <button type="button" onClick={openVoice} className="w-12 h-12 rounded-2xl glass text-primary flex items-center justify-center spring-tap flex-shrink-0" aria-label="Voice mode">
          <Mic className="w-4 h-4" strokeWidth={2} />
        </button>
      </form>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {QUICK_PROMPTS.map((q) => (
          <button key={q.label} onClick={() => openWithPrompt(q.prompt)} className="flex items-center gap-2 p-3 rounded-2xl glass spring-tap card-hover min-w-0">
            <q.icon className="w-[18px] h-[18px] text-primary shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] font-semibold text-foreground truncate">{q.label}</span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
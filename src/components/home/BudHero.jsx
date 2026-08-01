import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Send, FileText, BookOpen, HelpCircle, CalendarClock } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";

const EASE = [0.16, 1, 0.3, 1];

const QUICK_PROMPTS = [
  { label: "Explain my next assignment", icon: FileText, prompt: "Explain my next assignment to me step by step so I know exactly what to do." },
  { label: "Summarize today's lecture", icon: BookOpen, prompt: "Summarize today's lecture notes into the key points I need to remember." },
  { label: "Quiz me on my weakest topic", icon: HelpCircle, prompt: "Quiz me on my weakest topic and check my answers." },
  { label: "Plan my study schedule", icon: CalendarClock, prompt: "Plan my study schedule for this week around my deadlines and classes." },
];

export default function BudHero({ message }) {
  const { openWithPrompt, openVoice } = useBudLauncher();
  const [text, setText] = useState("");
  const submit = (e) => { e?.preventDefault?.(); const v = text.trim(); if (!v) return; setText(""); openWithPrompt(v); };

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bud-breathe"><BudVoiceOrb size={40} state="idle" /></div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-[15px] text-foreground leading-tight">Bud</p>
          <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2">{message || "Your academic companion — ask anything."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2.5">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Ask Bud anything…"
          className="flex-1 h-13 px-4 rounded-2xl bg-muted/30 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:bg-muted/50 transition-colors min-w-0"
          style={{ height: 52 }}
        />
        <button type="submit" className="w-[52px] h-[52px] rounded-2xl bg-primary text-primary-foreground flex items-center justify-center spring-tap flex-shrink-0" aria-label="Send to Bud">
          <Send className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>
        <button type="button" onClick={openVoice} className="w-[52px] h-[52px] rounded-2xl glass text-muted-foreground flex items-center justify-center spring-tap flex-shrink-0" aria-label="Voice mode">
          <Mic className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </form>

      <div className="space-y-2 mt-5">
        {QUICK_PROMPTS.map((q) => (
          <button key={q.label} onClick={() => openWithPrompt(q.prompt)} className="w-full flex items-center gap-3 py-2.5 text-left spring-tap group min-w-0">
            <q.icon className="w-[16px] h-[16px] text-muted-foreground/70 shrink-0 group-hover:text-primary transition-colors" strokeWidth={1.7} />
            <span className="text-[14px] text-muted-foreground group-hover:text-foreground transition-colors truncate">{q.label}</span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
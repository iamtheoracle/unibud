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
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="bud-breathe"><BudVoiceOrb size={36} state="idle" /></div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-[15px] text-foreground leading-tight">Bud</p>
          <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{message || "Your academic companion — ask anything."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Ask Bud anything…"
          className="flex-1 px-4 rounded-2xl bg-muted/30 border border-border/20 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-border/40 transition-colors min-w-0"
          style={{ height: 48 }}
        />
        <button type="submit" className="w-[48px] h-[48px] rounded-2xl bg-primary text-primary-foreground flex items-center justify-center spring-tap flex-shrink-0" aria-label="Send to Bud">
          <Send className="w-[17px] h-[17px]" strokeWidth={2} />
        </button>
        <button type="button" onClick={openVoice} className="w-[48px] h-[48px] rounded-2xl bg-muted/30 border border-border/20 text-muted-foreground flex items-center justify-center spring-tap flex-shrink-0" aria-label="Voice mode">
          <Mic className="w-[17px] h-[17px]" strokeWidth={1.7} />
        </button>
      </form>

      <div className="mt-5 divide-y divide-border/15">
        {QUICK_PROMPTS.map((q) => (
          <button key={q.label} onClick={() => openWithPrompt(q.prompt)} className="w-full flex items-center gap-3 py-3 text-left spring-tap group min-w-0">
            <q.icon className="w-[16px] h-[16px] text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" strokeWidth={1.7} />
            <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors truncate">{q.label}</span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
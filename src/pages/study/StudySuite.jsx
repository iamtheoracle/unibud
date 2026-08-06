import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "@/components/academics/PageHeader";

const EASE = [0.16, 1, 0.3, 1];

const MODULES = [
  { to: "/study/assignment", label: "Assignment Assistant", desc: "Explain, break down, and draft — ethically." },
  { to: "/study/project", label: "Project Assistant", desc: "Topics, proposals, outlines, timelines." },
  { to: "/study/notes", label: "Smart Notes", desc: "Summaries, flashcards, quizzes from your notes." },
  { to: "/study/research", label: "Research Assistant", desc: "Search, organize sources, reading lists." },
  { to: "/study/exams", label: "Exam Preparation", desc: "Revision schedules for any examination." },
  { to: "/study/flashcards", label: "Flashcards", desc: "Spaced repetition with AI decks." },
  { to: "/study/practice", label: "Practice Tests", desc: "Adaptive quizzes with performance analysis." },
  { to: "/study/citations", label: "Citation Manager", desc: "APA, MLA, Chicago, Harvard, IEEE." },
  { to: "/study/library", label: "Document Library", desc: "AI document understanding and OCR." },
];

export default function StudySuite() {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Study Suite" />
      <div className="glass-card p-4 mb-4 border border-primary/15 bg-primary/8">
        <p className="text-[14px] font-heading font-semibold text-foreground">Your personal tutor, researcher & study coach</p>
        <p className="text-[12px] text-muted-foreground mt-1">Works for universities, polytechnics, colleges, professional academies, and independent learners — for any examination.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map((m, i) => (
          <motion.button key={m.to} onClick={() => navigate(m.to)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} className="glass-card p-4 text-left spring-tap card-hover">
            <p className="text-[13px] font-semibold text-foreground leading-tight">{m.label}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{m.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FileText, BookOpen, Layers, HelpCircle, FileSearch, CalendarClock,
  Library, FolderKanban, Quote, Users, FlaskConical, BarChart3,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const MODULES = [
  { to: "/study/planner", label: "Planner", desc: "AI weekly study plan", icon: CalendarClock },
  { to: "/study/paths", label: "Learning Paths", desc: "Bud-designed study paths", icon: Layers },
  { to: "/study/assignment", label: "Assignment", desc: "Explain & break down briefs", icon: FileText },
  { to: "/study/project", label: "Project", desc: "Topics, outlines, timelines", icon: FolderKanban },
  { to: "/study/notes", label: "Smart Notes", desc: "AI summaries & flashcards", icon: BookOpen },
  { to: "/study/research", label: "Research", desc: "Sources & reading lists", icon: FlaskConical },
  { to: "/study/exams", label: "Exam Prep", desc: "Revision schedules", icon: CalendarClock },
  { to: "/study/flashcards", label: "Flashcards", desc: "Spaced repetition decks", icon: Layers },
  { to: "/study/practice", label: "Practice", desc: "Adaptive quizzes", icon: HelpCircle },
  { to: "/study/citations", label: "Citations", desc: "APA, MLA, IEEE", icon: Quote },
  { to: "/study/library", label: "Documents", desc: "AI file understanding", icon: FileSearch },
  { to: "/notes", label: "My Notes", desc: "All your notes", icon: BookOpen },
  { to: "/library", label: "Library", desc: "Borrowed & digital", icon: Library },
  { to: "/study-groups", label: "Study Groups", desc: "Collaborate in Spark", icon: Users },
];

export default function StudyModules() {
  const navigate = useNavigate();
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Study Tools</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {MODULES.map((m, i) => (
          <motion.button key={m.to} onClick={() => navigate(m.to)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.4, ease: EASE }} className="flex items-center gap-3 p-3 rounded-2xl glass spring-tap card-hover text-left min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <m.icon className="w-[18px] h-[18px] text-primary" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-foreground truncate">{m.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{m.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Check, Sparkles, Mountain } from "lucide-react";

const ITEMS = [
  "Loading university information", "Building your timetable", "Finding your classmates",
  "Preparing Bud", "Finding scholarships", "Finding internships", "Preparing Campus",
  "Joining your faculty", "Finding student communities", "Personalizing your dashboard",
];

const BUD_MESSAGES = [
  "I'm almost ready.",
  "Finding useful opportunities...",
  "Preparing today's dashboard...",
  "Getting everything ready...",
];

export default function PreparingCampus() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [budMsg, setBudMsg] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const itemInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= ITEMS.length) { clearInterval(itemInterval); return p; }
        return p + 1;
      });
    }, 550);

    const msgInterval = setInterval(() => setBudMsg((m) => (m + 1) % BUD_MESSAGES.length), 2500);
    return () => { clearInterval(itemInterval); clearInterval(msgInterval); };
  }, []);

  useEffect(() => {
    if (progress >= ITEMS.length && !completedRef.current) {
      completedRef.current = true;
      const timer = setTimeout(async () => {
        try { await base44.auth.updateMe({ onboarding_completed: true }); } catch {}
        sessionStorage.setItem("showCampusTutorial", "true");
        navigate("/");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [progress, navigate]);

  const pct = Math.round((progress / ITEMS.length) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[35%] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center gold-glow">
          <Mountain className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
        </div>
        <span className="font-heading font-extrabold text-[17px] text-foreground">UNIBUD</span>
      </motion.div>

      {/* Progress ring */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="relative w-28 h-28 mb-8 z-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 44} animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - pct / 100) }} transition={{ ease: "easeOut", duration: 0.4 }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-extrabold text-[24px] text-foreground">{pct}%</span>
        </div>
      </motion.div>

      {/* Items */}
      <div className="w-full max-w-sm space-y-1.5 mb-8 relative z-10">
        {ITEMS.map((item, i) => {
          const done = i < progress;
          const active = i === progress;
          return (
            <motion.div key={i} animate={{ opacity: done || active ? 1 : 0.35 }} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? "bg-primary" : active ? "bg-primary/20" : "bg-muted"}`}>
                {done ? <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} /> : active ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 rounded-full bg-primary" /> : null}
              </div>
              <span className={`text-[12px] transition-colors ${done ? "text-foreground font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{item}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Bud message */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 relative z-10">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
        <motion.p key={budMsg} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[13px] text-muted-foreground font-medium">
          {BUD_MESSAGES[budMsg]}
        </motion.p>
      </motion.div>
    </div>
  );
}
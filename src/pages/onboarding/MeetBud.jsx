import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, ArrowRight, MessageCircle, BookOpen, Play, PenTool, Layers, FileQuestion, Calendar, FileText, Award, Briefcase, GraduationCap } from "lucide-react";

const MESSAGES = [
  "Hi 👋 I'm Bud, your university companion.",
  "I'm here to make university life simpler, calmer, and more enjoyable.",
  "I'll help you learn smarter, stay organized, connect with classmates, and build your future.",
];

const CAPABILITIES = [
  { icon: BookOpen, label: "Explain difficult topics" },
  { icon: Play, label: "Recommend videos" },
  { icon: PenTool, label: "Draw diagrams & sketches" },
  { icon: Layers, label: "Build flashcards" },
  { icon: FileQuestion, label: "Generate quizzes" },
  { icon: Calendar, label: "Make study plans" },
  { icon: FileText, label: "Help with assignments" },
  { icon: Award, label: "Find scholarships" },
  { icon: Briefcase, label: "Discover internships" },
  { icon: GraduationCap, label: "Prepare for exams" },
  { icon: MessageCircle, label: "Answer university questions" },
  { icon: Sparkles, label: "Support your wellbeing" },
];

export default function MeetBud() {
  const navigate = useNavigate();
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [typing, setTyping] = useState(true);
  const [showCaps, setShowCaps] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visibleMsgs >= MESSAGES.length) {
      const t1 = setTimeout(() => setShowCaps(true), 400);
      const t2 = setTimeout(() => setShowButtons(true), 1400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    setTyping(true);
    const t = setTimeout(() => { setTyping(false); setVisibleMsgs((v) => v + 1); }, 1100);
    return () => clearTimeout(t);
  }, [visibleMsgs]);

  const handleContinue = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ onboarding_step: "preparing_campus" }); navigate("/onboarding/preparing-campus"); } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[35%] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />

      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8 relative z-10 no-scrollbar">
        {/* Bud avatar */}
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="flex justify-center mb-6">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-20 h-20 rounded-full bg-primary flex items-center justify-center gold-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </motion.div>
        </motion.div>

        {/* Messages */}
        <div className="space-y-3 mb-6">
          {MESSAGES.slice(0, visibleMsgs).map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
              <p className="text-center text-[15px] text-foreground leading-relaxed max-w-[300px] font-medium">{msg}</p>
            </motion.div>
          ))}
          {typing && visibleMsgs < MESSAGES.length && (
            <div className="flex justify-center">
              <div className="bg-card rounded-2xl px-4 py-2.5 premium-shadow border border-border/30 flex items-center gap-1.5">
                {[0, 150, 300].map((d) => <div key={d} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Capabilities */}
        <AnimatePresence>
          {showCaps && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
              <p className="text-[13px] font-semibold text-muted-foreground text-center mb-3">Here's what I can do</p>
              <div className="grid grid-cols-2 gap-2">
                {CAPABILITIES.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="bg-card rounded-2xl p-3 premium-shadow border border-border/30 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground leading-tight">{cap.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "I'm always one tap away." */}
        <AnimatePresence>
          {showButtons && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[14px] font-heading font-semibold text-foreground mb-6">
              I'm always one tap away. 🌟
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-shrink-0 px-6 pb-6 pt-3 relative z-10 space-y-2">
            <button onClick={handleContinue} disabled={loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
              Let's Go <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </button>
            <button onClick={handleContinue} disabled={loading} className="w-full h-[48px] rounded-2xl bg-card text-foreground font-heading font-semibold text-[14px] border border-border/50 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
              <MessageCircle className="w-4 h-4" /> Ask Bud
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
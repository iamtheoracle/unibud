import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain, ArrowRight, Lock, KeyRound, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const cards = [
  {
    emoji: "📚",
    title: "Study Smarter",
    desc: "Learn with Bud using videos, sketches, quizzes and personalised study plans.",
  },
  {
    emoji: "🌍",
    title: "Connect",
    desc: "Meet classmates, lecturers, mentors and communities from universities around the world.",
  },
  {
    emoji: "🚀",
    title: "Grow",
    desc: "Discover scholarships, internships, careers, competitions and opportunities.",
  },
];

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Slowly moving background lighting */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[70%] h-[45%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[25%] right-[-15%] w-[60%] h-[40%] rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pt-14 pb-4 relative z-10 no-scrollbar">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center mb-7"
        >
          <div className="w-16 h-16 rounded-[20px] bg-primary flex items-center justify-center mb-3 gold-glow">
            <Mountain className="w-8 h-8 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <p className="text-[10px] font-heading font-medium text-muted-foreground tracking-[0.18em] uppercase mb-0.5">
            University Buddy
          </p>
          <h1 className="font-heading font-extrabold text-[28px] tracking-tight text-foreground leading-none">
            UNIBUD
          </h1>
          <p className="text-[13px] text-primary font-semibold mt-1.5">
            The Future Starts Together.
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center text-[14px] text-muted-foreground leading-relaxed mb-7 max-w-[300px] mx-auto"
        >
          Everything you need for university, all in one place.
        </motion.p>

        {/* Three premium floating cards */}
        <div className="space-y-3 mb-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[24px] p-4 premium-shadow border border-border/30 flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {card.emoji}
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-heading font-bold text-[14px] text-foreground mb-0.5">
                  {card.title}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating black bottom sheet for authentication */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-4 mb-3 rounded-[28px] bg-black p-5 elevated-shadow border border-n6"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/register")}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mb-2.5"
        >
          Create Account
          <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/login")}
          className="w-full h-[52px] rounded-2xl bg-transparent text-white font-heading font-semibold text-[15px] border border-n6 flex items-center justify-center gap-2 hover:bg-n7 transition-colors mb-3"
        >
          <Lock className="w-[16px] h-[16px]" strokeWidth={2} />
          Sign In
        </motion.button>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-[12px] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
          >
            <KeyRound className="w-3 h-3" />
            Forgot Password?
          </Link>
        </div>
      </motion.div>

      {/* Limited access to Bud */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="relative z-10 px-6 pb-6 text-center"
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Sparkles className="w-3 h-3 text-primary" strokeWidth={2} />
          <p className="text-[11px] font-semibold text-foreground">Limited access to Bud</p>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
          Visitors may ask Bud up to three questions before signing in. After three
          questions Bud politely asks them to create an account.
        </p>
      </motion.div>
    </div>
  );
}
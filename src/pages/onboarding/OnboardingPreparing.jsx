import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import MeetBudOrb from "@/components/bud/MeetBudOrb";
import SparkField from "@/components/foundation/SparkField";

const EASE = [0.16, 1, 0.3, 1];
const PERSONA = "Andrew";

const ITEMS = [
  "Confirming your department at UNIBEN",
  "Linking your academic calendar",
  "Finding classmates",
  "Preparing your study dashboard",
  "Waking Bud up",
];

export default function OnboardingPreparing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= ITEMS.length) { clearInterval(interval); return p; }
        return p + 1;
      });
    }, 550);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= ITEMS.length && !doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(() => navigate("/home", { replace: true }), 700);
      return () => clearTimeout(t);
    }
  }, [progress, navigate]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-6">
      <SparkField count={16} />
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}>
          <MeetBudOrb />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: EASE }}
          className="font-heading font-bold text-[24px] tracking-tight text-foreground mt-6 mb-1"
        >
          Welcome, {PERSONA}! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-[14px] text-muted-foreground leading-relaxed mb-8"
        >
          Give me a few seconds while I prepare your campus experience.
        </motion.p>

        <div className="w-full space-y-2.5 text-left">
          {ITEMS.map((item, i) => {
            const done = i < progress;
            const active = i === progress;
            return (
              <motion.div
                key={i}
                animate={{ opacity: done || active ? 1 : 0.4 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    done ? "bg-primary" : active ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  {done ? (
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  ) : active ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ) : null}
                </div>
                <span
                  className={`text-[14px] transition-colors ${
                    done ? "text-foreground font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
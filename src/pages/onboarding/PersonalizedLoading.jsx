import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, GraduationCap, Users, BookOpen, Compass } from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { hapticImpact } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

const STEPS = [
  { icon: Sparkles, label: "Preparing your dashboard", desc: "Setting up your personalized space" },
  { icon: BookOpen, label: "Loading your courses", desc: "Organizing your academic workspace" },
  { icon: Users, label: "Connecting your community", desc: "Finding peers and communities" },
  { icon: Compass, label: "Discovering opportunities", desc: "Matching scholarships and careers" },
  { icon: GraduationCap, label: "Finalizing your journey", desc: "You're all set!" },
];

export default function PersonalizedLoading() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          hapticImpact();
          setTimeout(() => navigate("/"), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [navigate]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Ambient glow */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-[60%] h-[40%] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className="relative z-10 mb-8"
      >
        <div className="w-16 h-16 rounded-[22px] bg-black flex items-center justify-center premium-shadow">
          <span className="text-white">
            <UnibudMark className="w-8 h-8" />
          </span>
        </div>
      </motion.div>

      {/* Progress ring area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative z-10 mb-8"
      >
        <div className="w-14 h-14 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </motion.div>

      {/* Step content */}
      <div className="relative z-10 w-full max-w-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="text-center"
          >
            {(() => {
              const Icon = STEPS[currentStep].icon;
              return (
                <div className="flex items-center justify-center gap-2 mb-2">
                  {currentStep === STEPS.length - 1 ? (
                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-5 h-5 text-success-foreground" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  )}
                  <h2 className="font-heading font-bold text-[18px] text-foreground">
                    {STEPS[currentStep].label}
                  </h2>
                </div>
              );
            })()}
            <p className="text-[13px] text-muted-foreground">
              {STEPS[currentStep].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full max-w-[280px] mt-8">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      {/* Completed steps */}
      <div className="relative z-10 mt-6 flex items-center gap-1.5">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === currentStep ? 1.2 : 1,
              opacity: i <= currentStep ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className={`w-1.5 h-1.5 rounded-full ${i <= currentStep ? "bg-primary" : "bg-muted-foreground"}`}
          />
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

const TUTORIAL_STEPS = [
  { message: (name) => `Welcome to UNIBUD, ${name}. Everything you need for university is now ready.` },
  { message: () => "This is your daily dashboard." },
  { message: () => "Bud is always here if you need help. Just tap the gold button." },
  { message: () => "Quad keeps you connected with campus life." },
  { message: () => "Connect helps you meet classmates and build your network." },
  { message: () => "Enjoy your university journey. The Future Starts Together." },
];

export default function CampusTutorial({ user }) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("showCampusTutorial") === "true") {
      setShow(true);
      sessionStorage.removeItem("showCampusTutorial");
    }
  }, []);

  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const current = TUTORIAL_STEPS[step];

  const handleNext = () => {
    if (isLast) setShow(false);
    else setStep(step + 1);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShow(false)}
        >
          <motion.div
            key={step}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="w-full max-w-lg bg-card rounded-t-[28px] p-6 premium-shadow border-t border-border/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShow(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-4">
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-14 h-14 rounded-full bg-primary flex items-center justify-center gold-glow">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </motion.div>
            </div>

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-center text-[15px] text-foreground leading-relaxed font-medium min-h-[44px] flex items-center justify-center">
              {current.message(firstName)}
            </motion.p>

            <div className="flex justify-center gap-1.5 mt-4 mb-5">
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted"}`} />
              ))}
            </div>

            <div className="flex gap-2">
              {!isLast && (
                <button onClick={() => setShow(false)} className="flex-1 h-[48px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[14px] border border-border/50 hover:bg-muted/50 transition-colors">
                  Skip Tour
                </button>
              )}
              <button onClick={handleNext} className={`h-[48px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] hover:bg-primary/90 transition-colors shadow-[0_4px_20px_rgba(218,175,55,0.3)] ${isLast ? "flex-1" : "flex-[2]"}`}>
                {isLast ? "Get Started" : "Next"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
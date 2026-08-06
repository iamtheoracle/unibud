import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { INTEREST_CATEGORIES } from "@/data/interestCategories";
import { useInterests } from "@/hooks/useInterests";
import InterestCard from "@/components/communities/InterestCard";
import BudHead from "@/components/bud/BudHead";
import BudScene from "@/components/bud/BudScene";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * InterestSelection — a multi-step experience where Bud helps the student
 * pick their interests so Bud can personalize their community feed.
 *
 * Steps: Welcome → Choose Interests → Bud Building → Done
 *
 * @param {function} onComplete — called with selected interest IDs when done
 * @param {string[]} initialInterests — pre-selected IDs (for edit mode)
 * @param {boolean} editMode — skip the welcome step
 */
export default function InterestSelection({ onComplete, initialInterests = [], editMode = false }) {
  const { saveInterests } = useInterests();
  const [step, setStep] = useState(editMode ? "interests" : "welcome");
  const [selected, setSelected] = useState(new Set(initialInterests));

  const toggleInterest = (id) => {
    hapticTap();
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleContinue = async () => {
    hapticTap();
    setStep("building");
    const ids = [...selected];
    await saveInterests(ids);
    setTimeout(() => {
      setStep("done");
      onComplete?.(ids);
    }, 2200);
  };

  const selectedCount = selected.size;
  const minSelected = 3;

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      <AnimatePresence mode="wait">
        {/* ── Step 1: Welcome ── */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center text-center pt-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <BudHead size={88} mood="happy" glow active />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
              className="text-[22px] font-bold text-foreground mt-6 tracking-tight"
            >
              I'm going to personalize your community experience.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4, ease: EASE }}
              className="text-[13px] text-muted-foreground mt-3 max-w-[300px]"
            >
              Tell me what you enjoy and I'll find the right communities for you. You can change these anytime.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
              onClick={() => { hapticTap(); setStep("interests"); }}
              className="mt-8 px-6 py-3 rounded-full bg-foreground text-background text-[14px] font-semibold spring-tap flex items-center gap-2"
            >
              Let's go
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 2: Choose Interests ── */}
        {step === "interests" && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="mb-5">
              <h1 className="text-[22px] font-bold text-foreground tracking-tight">What are you into?</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Pick at least {minSelected} to help me recommend the right communities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTEREST_CATEGORIES.map((cat, i) => (
                <InterestCard
                  key={cat.id}
                  category={cat}
                  index={i}
                  selected={selected.has(cat.id)}
                  onToggle={() => toggleInterest(cat.id)}
                />
              ))}
            </div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
              className="fixed bottom-0 left-0 right-0 z-30 p-4 safe-area-pb"
            >
              <div className="max-w-[520px] mx-auto">
                <button
                  onClick={handleContinue}
                  disabled={selectedCount < minSelected}
                  className={`w-full py-3.5 rounded-full text-[14px] font-semibold spring-tap flex items-center justify-center gap-2 transition-all ${
                    selectedCount >= minSelected
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {selectedCount >= minSelected
                    ? `Continue with ${selectedCount} ${selectedCount === 1 ? "interest" : "interests"}`
                    : `Select ${minSelected - selectedCount} more`}
                  {selectedCount >= minSelected && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 3: Bud Building ── */}
        {step === "building" && (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center justify-center pt-20"
          >
            <BudScene activity="organizing" size={120} />
          </motion.div>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center text-center pt-16"
          >
            <BudHead size={72} mood="happy" glow active />
            <h1 className="text-[20px] font-bold text-foreground mt-6 tracking-tight">All set!</h1>
            <p className="text-[13px] text-muted-foreground mt-2 max-w-[280px]">
              I'll recommend communities based on your interests. You can update these anytime in Settings.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
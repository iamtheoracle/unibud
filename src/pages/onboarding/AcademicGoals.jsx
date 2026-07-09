import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, SkipForward, Sparkles } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SelectionChip from "@/components/onboarding/SelectionChip";
import BudMessage from "@/components/onboarding/BudMessage";

const GOALS = [
  "Improve GPA", "Pass Exams", "Graduate with Honors", "Stay Organized",
  "Build Better Study Habits", "Complete Assignments Early", "Find Scholarships",
  "Find Internships", "Build Projects", "Learn New Skills", "Become a Researcher",
  "Start a Business", "Study Abroad", "Build My Resume", "Prepare for Interviews",
  "Get My Dream Job",
];
const MAX_GOALS = 3;

export default function AcademicGoals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (g) => {
    setGoals((p) => {
      if (p.includes(g)) return p.filter((x) => x !== g);
      if (p.length >= MAX_GOALS) return p;
      return [...p, g];
    });
  };
  const canContinue = goals.length > 0;

  const handleContinue = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ goals, onboarding_step: "study_schedule" }); navigate("/onboarding/study-schedule"); } catch {}
    setLoading(false);
  };
  const handleSkip = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ onboarding_step: "study_schedule" }); navigate("/onboarding/study-schedule"); } catch {}
    setLoading(false);
  };

  return (
    <OnboardingLayout step={2} totalSteps={5} stepLabel="Academic Goals" footer={
      <>
        <button onClick={handleContinue} disabled={!canContinue || loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
          Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        <button onClick={handleSkip} disabled={loading} className="w-full h-[44px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:text-foreground transition-colors">
          <SkipForward className="w-3.5 h-3.5" /> Skip for now
        </button>
      </>
    }>
      <BudMessage>What would you like to achieve during your university journey?</BudMessage>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-4 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-foreground">Pick your top {MAX_GOALS} priorities</h3>
        <span className={`text-[12px] font-bold ${goals.length === MAX_GOALS ? "text-primary" : "text-muted-foreground"}`}>{goals.length}/{MAX_GOALS}</span>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2 mb-6">
        {GOALS.map((g) => <SelectionChip key={g} label={g} variant="card" selected={goals.includes(g)} onClick={() => toggleGoal(g)} />)}
      </motion.div>

      <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">These goals will personalize recommendations throughout UNIBUD — from study tips to scholarship alerts.</p>
      </div>
    </OnboardingLayout>
  );
}
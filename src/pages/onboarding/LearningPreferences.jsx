import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, SkipForward, Sparkles } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SelectionChip from "@/components/onboarding/SelectionChip";
import BudMessage from "@/components/onboarding/BudMessage";

const METHODS = [
  "Reading", "Videos", "Diagrams", "Sketches", "Mind Maps", "Flashcards",
  "Practice Questions", "Quizzes", "Audio Lessons", "Voice Conversations",
  "Interactive Lessons", "Step-by-Step Explanations", "Real-life Examples", "Mixed Learning",
];

const DURATIONS = ["Less than 30 minutes", "30–60 minutes", "1–2 hours", "More than 2 hours"];
const TIMES = ["Morning", "Afternoon", "Evening", "Late Night"];

export default function LearningPreferences() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [duration, setDuration] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMethod = (m) => setMethods((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));
  const canContinue = methods.length > 0 || duration || time;

  const handleContinue = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({ learning_styles: methods, study_duration: duration, preferred_study_time: time, onboarding_step: "academic_goals" });
      navigate("/onboarding/academic-goals");
    } catch {}
    setLoading(false);
  };

  const handleSkip = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ onboarding_step: "academic_goals" }); navigate("/onboarding/academic-goals"); } catch {}
    setLoading(false);
  };

  return (
    <OnboardingLayout step={1} totalSteps={5} stepLabel="Learning Preferences" footer={
      <>
        <button onClick={handleContinue} disabled={!canContinue || loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(109, 40, 217,0.3)]">
          Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        <button onClick={handleSkip} disabled={loading} className="w-full h-[44px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:text-foreground transition-colors">
          <SkipForward className="w-3.5 h-3.5" /> Skip for now
        </button>
      </>
    }>
      <BudMessage>Let's personalize how you learn.</BudMessage>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">Learning Methods</h3>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => <SelectionChip key={m} label={m} selected={methods.includes(m)} onClick={() => toggleMethod(m)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">How long do you usually study?</h3>
        <div className="grid grid-cols-2 gap-2">
          {DURATIONS.map((d) => <SelectionChip key={d} label={d} variant="card" selected={duration === d} onClick={() => setDuration(d)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">When do you study best?</h3>
        <div className="flex flex-wrap gap-2">
          {TIMES.map((t) => <SelectionChip key={t} label={t} selected={time === t} onClick={() => setTime(t)} />)}
        </div>
      </motion.div>

      <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">These preferences help Bud create better study plans and explanations tailored to how you learn best.</p>
      </div>
    </OnboardingLayout>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, SkipForward, Sparkles } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SelectionChip from "@/components/onboarding/SelectionChip";
import BudMessage from "@/components/onboarding/BudMessage";

const INTERESTS = [
  "Technology", "Business", "Medicine", "Engineering", "Law", "Arts", "Science",
  "Sports", "Gaming", "Photography", "Music", "Movies", "Artificial Intelligence",
  "Programming", "Cybersecurity", "Robotics", "Entrepreneurship", "Research",
  "Volunteering", "Travel", "Reading", "Fitness", "Cooking", "Design", "Content Creation",
];

const PERSONALIZES = ["Campus", "Quad", "Connect", "Scholarships", "Internships", "Events", "Communities", "Career"];

export default function Interests() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (i) => setInterests((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  const canContinue = interests.length > 0;

  const handleContinue = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ interests, onboarding_step: "meet_bud" }); navigate("/onboarding/meet-bud"); } catch {}
    setLoading(false);
  };
  const handleSkip = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ onboarding_step: "meet_bud" }); navigate("/onboarding/meet-bud"); } catch {}
    setLoading(false);
  };

  return (
    <OnboardingLayout step={4} totalSteps={5} stepLabel="Interests" footer={
      <>
        <button onClick={handleContinue} disabled={!canContinue || loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
          Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        <button onClick={handleSkip} disabled={loading} className="w-full h-[44px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:text-foreground transition-colors">
          <SkipForward className="w-3.5 h-3.5" /> Skip for now
        </button>
      </>
    }>
      <BudMessage>Let's discover your interests.</BudMessage>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-4">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">What do you enjoy?</h3>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => <SelectionChip key={i} label={i} selected={interests.includes(i)} onClick={() => toggle(i)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
        <p className="text-[12px] font-semibold text-muted-foreground mb-2">These personalize:</p>
        <div className="flex flex-wrap gap-1.5">
          {PERSONALIZES.map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">{p}</span>
          ))}
        </div>
      </motion.div>

      <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">Your interests shape what you see across UNIBUD — communities, events, scholarships, and more.</p>
      </div>
    </OnboardingLayout>
  );
}
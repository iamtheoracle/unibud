import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, BookHeart, Smile, LifeBuoy } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import MoodTracker from "@/components/wellness/MoodTracker";
import JournalSection from "@/components/wellness/JournalSection";
import WellnessBud from "@/components/wellness/WellnessBud";
import WellnessResources from "@/components/wellness/WellnessResources";

const TABS = [
  { key: "mood", label: "Mood", icon: Smile },
  { key: "journal", label: "Journal", icon: BookHeart },
  { key: "bud", label: "Talk to Bud", icon: Heart },
  { key: "resources", label: "Resources", icon: LifeBuoy },
];

export default function Wellbeing() {
  const [tab, setTab] = useState("mood");

  return (
    <div className="min-h-screen pb-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Wellbeing</h1>
        </div>
        <p className="text-[12px] text-muted-foreground">Your private space for balance and support</p>
      </motion.div>

      <div className="px-4 mb-4">
        <div className="flex gap-1.5 p-1 bg-muted/60 rounded-[16px]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 px-2 rounded-[12px] text-[11px] font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                tab === t.key ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {tab === "mood" && <MoodTracker />}
        {tab === "journal" && <JournalSection />}
        {tab === "bud" && <WellnessBud />}
        {tab === "resources" && <WellnessResources />}
      </div>

      <div className="px-4 mt-6">
        <GlassCard variant="glass" className="p-4 text-center">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            If you're going through a difficult time, please reach out to your campus counselling centre or student affairs office.
            UNIBUD and Bud are here to support you, not replace professional help.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
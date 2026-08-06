import React from "react";
import { motion } from "framer-motion";
import BudOrb from "@/components/brand/BudOrb";
import {
  STUDENT_OS, LECTURER_OS, INSTITUTION_OS, PRE_UNIVERSITY, BUD_INTERACTIONS,
} from "@/lib/posterData";
import { PosterHero, PosterSection, ModuleCard } from "@/components/posters/PosterShared";
import { SPRING } from "@/lib/glassPresets";

export default function PosterExperience() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Hero — Center: Bud Orb */}
        <PosterHero
          number="02"
          title="The UNIBUD Experience"
          subtitle="Everything users can do — every Operating System, every module, and every way to interact with Bud."
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.bouncy}
            className="relative"
          >
            <BudOrb className="w-20 h-20 text-primary gold-glow" />
          </motion.div>
          <p className="text-[13px] font-heading font-bold text-primary">Bud</p>
          <p className="text-[11px] text-muted-foreground -mt-2">My Realm Orbit</p>
        </PosterHero>

        {/* Student OS */}
        <PosterSection title="Student OS" description="Fifteen modules — the complete student journey" delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STUDENT_OS.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.15 + i * 0.03} />
            ))}
          </div>
        </PosterSection>

        {/* Lecturer OS */}
        <PosterSection title="Lecturer OS" description="Seven modules for teaching and management" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {LECTURER_OS.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.2 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

        {/* Institution OS */}
        <PosterSection title="Institution OS" description="Eight modules for university administration" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INSTITUTION_OS.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.25 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

        {/* Pre-University */}
        <PosterSection title="Pre-University" description="Seven modules for future students" delay={0.25}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {PRE_UNIVERSITY.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.3 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

        {/* Bud Interactions */}
        <PosterSection title="Bud Interactions" description="Eight ways to interact with Bud" delay={0.3}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BUD_INTERACTIONS.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.35 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

      </div>
    </div>
  );
}
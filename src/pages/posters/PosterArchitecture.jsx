import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";
import BudOrb from "@/components/brand/BudOrb";
import { Crown, ChevronDown } from "lucide-react";
import {
  ORACLE_SYSTEMS, PLATFORM_ENGINES, PLATFORM_SERVICES, INFRASTRUCTURE,
} from "@/lib/posterData";
import { PosterHero, PosterSection, ModuleCard } from "@/components/posters/PosterShared";
import { SPRING, scaleEntranceDelay, slideInRight } from "@/lib/glassPresets";
import { GlassSheen } from "@/components/portal/Glass";

export default function PosterArchitecture() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Hero — Center: UNIBUD Logo + Bud Orb + Oracle Core */}
        <PosterHero
          number="01"
          title="Platform Blueprint"
          subtitle="The complete technical architecture — Oracle Core, Bud, Oracle Systems, Platform Engines, Platform Services, and Infrastructure."
        >
          <div className="flex flex-col items-center gap-3">
            {/* UNIBUD Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.bouncy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[20px] glass border border-primary/20 gold-glow"
            >
              <UnibudMark className="w-6 h-6 text-primary" />
              <span className="font-heading font-extrabold text-[18px] tracking-tight text-foreground">UNIBUD</span>
            </motion.div>
            <ChevronDown className="w-4 h-4 text-primary/40" />
            {/* Bud Orb */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING.bouncy, delay: 0.1 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[20px] glass border border-primary/20"
            >
              <BudOrb className="w-6 h-6 text-primary gold-glow" />
              <span className="font-heading font-bold text-[14px] text-foreground">Bud</span>
              <span className="text-[10px] text-muted-foreground">My Realm Orbit</span>
            </motion.div>
            <ChevronDown className="w-4 h-4 text-primary/40" />
            {/* Oracle Core */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING.bouncy, delay: 0.2 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[20px] glass border border-primary/20 gold-glow"
            >
              <Crown className="w-6 h-6 text-primary" strokeWidth={2.2} />
              <span className="font-heading font-extrabold text-[16px] text-foreground">Oracle Core</span>
            </motion.div>
          </div>
        </PosterHero>

        {/* Oracle Systems */}
        <PosterSection title="Oracle Systems" description="Five business domain systems" delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ORACLE_SYSTEMS.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.15 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

        {/* Platform Engines */}
        <PosterSection title="Platform Engines" description="Thirteen cross-cutting engines powering every system" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PLATFORM_ENGINES.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.2 + i * 0.03} />
            ))}
          </div>
        </PosterSection>

        {/* Platform Services */}
        <PosterSection title="Platform Services" description="Shared infrastructure layer" delay={0.2}>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {PLATFORM_SERVICES.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.25 + i * 0.05} />
            ))}
          </div>
        </PosterSection>

        {/* Infrastructure */}
        <PosterSection title="Infrastructure" description="Foundational platform layer" delay={0.25}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {INFRASTRUCTURE.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.3 + i * 0.03} />
            ))}
          </div>
        </PosterSection>

      </div>
    </div>
  );
}
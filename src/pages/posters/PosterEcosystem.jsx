import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";
import BudOrb from "@/components/brand/BudOrb";
import { Crown, ChevronDown } from "lucide-react";
import {
  ECOSYSTEM_HIERARCHY, ECOSYSTEM_CONNECTED, ECOSYSTEM_INTEGRATIONS,
} from "@/lib/posterData";
import { PosterHero, PosterSection, ModuleCard } from "@/components/posters/PosterShared";
import { SPRING } from "@/lib/glassPresets";
import { GlassSheen } from "@/components/portal/Glass";

export default function PosterEcosystem() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Hero — Center: UNIBUD → Bud → Oracle */}
        <PosterHero
          number="03"
          title="Global Education Ecosystem"
          subtitle="The connected world of UNIBUD — from countries to alumni, linked services, and official integrations."
        >
          <div className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.bouncy}
              className="flex items-center gap-2 px-4 py-2 rounded-[18px] glass border border-primary/20 gold-glow"
            >
              <UnibudMark className="w-5 h-5 text-primary" />
              <span className="font-heading font-extrabold text-[14px] text-foreground">UNIBUD</span>
            </motion.div>
            <ChevronDown className="w-3 h-3 text-primary/40" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING.bouncy, delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-[18px] glass border border-primary/20"
            >
              <BudOrb className="w-5 h-5 text-primary" />
              <span className="font-heading font-bold text-[13px] text-foreground">Bud</span>
            </motion.div>
            <ChevronDown className="w-3 h-3 text-primary/40" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...SPRING.bouncy, delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-[18px] glass border border-primary/20 gold-glow"
            >
              <Crown className="w-5 h-5 text-primary" strokeWidth={2.2} />
              <span className="font-heading font-extrabold text-[14px] text-foreground">Oracle</span>
            </motion.div>
          </div>
        </PosterHero>

        {/* Ecosystem Hierarchy — vertical flow */}
        <PosterSection title="Ecosystem Hierarchy" description="From countries to alumni — the global education graph" delay={0.1}>
          <div className="flex flex-col items-center gap-1">
            {ECOSYSTEM_HIERARCHY.map((item, i) => (
              <React.Fragment key={item.name}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING.gentle, delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-[16px] glass border border-border/20"
                >
                  <div className={`w-8 h-8 rounded-[12px] ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={2.2} />
                  </div>
                  <span className="font-heading font-semibold text-[13px] text-foreground">{item.name}</span>
                </motion.div>
                {i < ECOSYSTEM_HIERARCHY.length - 1 && <ChevronDown className="w-3 h-3 text-muted-foreground/50" />}
              </React.Fragment>
            ))}
          </div>
        </PosterSection>

        {/* Connected Services */}
        <PosterSection title="Connected To" description="Services linked across the ecosystem" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ECOSYSTEM_CONNECTED.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.2 + i * 0.03} />
            ))}
          </div>
        </PosterSection>

        {/* Official Integrations */}
        <PosterSection title="Official Integrations" description="External services connected through the Integration Bridge" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ECOSYSTEM_INTEGRATIONS.map((item, i) => (
              <ModuleCard key={item.name} {...item} delay={0.25 + i * 0.03} />
            ))}
          </div>
        </PosterSection>

      </div>
    </div>
  );
}
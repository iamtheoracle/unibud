import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  OPERATING_SYSTEMS, BUD_CAPABILITIES, SCREEN_FLOWS, ORACLE_INTELLIGENCE_FLOW,
} from "@/lib/posterData";
import { PosterHeader, PosterSection, EntityCard, FlowStep } from "@/components/posters/PosterShared";
import { SPRING, scaleEntranceDelay, slideInRight } from "@/lib/glassPresets";
import { GlassSheen } from "@/components/portal/Glass";

export default function PosterExperience() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PosterHeader
          number="02"
          title="User Experience"
          subtitle="Everything users see — all Operating Systems, Bud interactions, navigation, and complete screen flows for every user journey."
        />

        {/* Operating Systems */}
        <PosterSection title="All Operating Systems" description="Every user type has a dedicated experience" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OPERATING_SYSTEMS.map((os, i) => (
              <EntityCard key={os.id} item={os} delay={0.15 + i * 0.05} />
            ))}
          </div>
        </PosterSection>

        {/* Bud Capabilities */}
        <PosterSection title="Bud — AI Companion" description="Eleven specialist capabilities delivered through one warm interface" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {BUD_CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.name}
                {...scaleEntranceDelay(0.2 + i * 0.04)}
                whileHover={{ y: -3, transition: SPRING.hover }}
                className="relative overflow-hidden p-4 rounded-[20px] glass border border-border/20"
              >
                <GlassSheen />
                <div className={`w-10 h-10 rounded-[14px] ${cap.bg} flex items-center justify-center mb-2.5`}>
                  <cap.icon className={`w-4 h-4 ${cap.color}`} strokeWidth={2.2} />
                </div>
                <h4 className="font-heading font-bold text-[13px] text-foreground">{cap.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Navigation — 4 Pillars */}
        <PosterSection title="Navigation — Four Pillars" description="The persistent bottom navigation across the entire app" delay={0.2}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Campus", icon: "🏠", desc: "Your academic command center" },
              { name: "Quad", icon: "💬", desc: "Your social universe" },
              { name: "Connect", icon: "👥", desc: "Your people & network" },
              { name: "Me", icon: "👤", desc: "Your personal space" },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.name}
                {...scaleEntranceDelay(0.25 + i * 0.05)}
                className="flex flex-col items-center p-5 rounded-[22px] glass border border-border/20 text-center"
              >
                <div className="text-3xl mb-2">{pillar.icon}</div>
                <h4 className="font-heading font-bold text-[14px] text-primary">{pillar.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Oracle Intelligence Flow */}
        <PosterSection title="Oracle Intelligence Flow" description="How a student's request flows through the platform" delay={0.25}>
          <div className="flex flex-wrap items-center gap-1">
            {ORACLE_INTELLIGENCE_FLOW.map((step, i) => (
              <FlowStep key={step.step} step={step} isLast={i === ORACLE_INTELLIGENCE_FLOW.length - 1} />
            ))}
          </div>
          <div className="mt-4 p-4 rounded-[16px] bg-primary/5 border border-primary/15">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">Key principle:</span> The student only ever interacts with Bud. Oracle orchestrates specialist systems behind the scenes — Learning Studio for academic intelligence, Campus Central for institution context, Community Circle for social context — then Bud delivers a single, cohesive answer.
            </p>
          </div>
        </PosterSection>

        {/* Screen Flows */}
        <PosterSection title="Screen Flows" description="Complete user journeys for every path through the platform" delay={0.3}>
          <div className="space-y-3">
            {SCREEN_FLOWS.map((flow, i) => (
              <motion.div
                key={flow.id}
                {...slideInRight(0.35 + i * 0.05)}
                className="p-4 rounded-[20px] glass border border-border/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-[14px] bg-muted/40 flex items-center justify-center flex-shrink-0`}>
                    <flow.icon className={`w-4 h-4 ${flow.color}`} strokeWidth={2.2} />
                  </div>
                  <h4 className="font-heading font-bold text-[14px] text-foreground">{flow.name}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-1 ml-1">
                  {flow.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-1">
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING.gentle, delay: 0.4 + i * 0.05 + j * 0.03 }}
                        className="px-2.5 py-1 rounded-[10px] bg-muted/30 text-[10px] font-semibold text-foreground whitespace-nowrap"
                      >
                        {step}
                      </motion.span>
                      {j < flow.steps.length - 1 && <ChevronDown className="w-3 h-3 text-muted-foreground rotate-[-90deg] flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </PosterSection>
      </div>
    </div>
  );
}
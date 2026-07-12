import React from "react";
import { motion } from "framer-motion";
import {
  Crown, Sparkles, Brain, Layers, Plug, Settings, ChevronDown,
} from "lucide-react";
import { ORACLE_SYSTEMS } from "@/lib/oracleSystems";
import { PLATFORM_ENGINES, ENGINE_FLOW_EXAMPLE } from "@/lib/platformEngines";
import { PLATFORM_SERVICES } from "@/lib/platformServices";
import { OPERATIONS_HIERARCHY, ORCHESTRATION_PROTOCOL } from "@/lib/oracleEcosystem";
import { INTEGRATIONS } from "@/lib/posterData";
import { PosterHeader, PosterSection, EntityCard, IntegrationCard } from "@/components/posters/PosterShared";
import { GlassSheen } from "@/components/portal/Glass";
import {
  SPRING, glassEntrance, scaleEntranceDelay, slideInRight,
} from "@/lib/glassPresets";

export default function PosterArchitecture() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PosterHeader
          number="01"
          title="Platform Architecture"
          subtitle="Everything technical — Oracle Core, Bud, Oracle Systems, Platform Engines, Operations Center, and Integrations. The complete intelligence and infrastructure stack."
        />

        {/* Architecture Stack Diagram */}
        <PosterSection title="Architecture Stack" description="Five layers — from intelligence to infrastructure" delay={0.1}>
          <div className="space-y-3">
            {[
              { label: "Oracle Core", icon: Crown, color: "text-primary", bg: "bg-primary/10", desc: "Intelligence & orchestration — the supreme authority" },
              { label: "Bud", icon: Sparkles, color: "text-primary", bg: "bg-primary/10", desc: "The only user-facing assistant — powered by Oracle" },
              { label: "Oracle Systems (5)", icon: Layers, color: "text-purple", bg: "bg-purple/10", desc: "Learning Studio · Campus Central · Community Circle · Trust Shield · Architect" },
              { label: "Platform Engines (10)", icon: Brain, color: "text-info", bg: "bg-info/10", desc: "Interaction · Workflow · Communication · Component · Configuration · Integration · Operations · Intelligence · Rendering · Code Execution" },
              { label: "Platform Services (6)", icon: Plug, color: "text-success", bg: "bg-success/10", desc: "Integration Bridge · Operations Center · Notifications · Search · Media · Payment" },
              { label: "Infrastructure", icon: Settings, color: "text-warning", bg: "bg-warning/10", desc: "Authentication · Database · API Gateway · Realtime · Storage · CDN" },
            ].map((layer, i) => (
              <motion.div
                key={layer.label}
                {...slideInRight(i * 0.06)}
                className="flex items-center gap-4 p-4 rounded-[20px] glass border border-border/20"
              >
                <div className={`w-12 h-12 rounded-[16px] ${layer.bg} flex items-center justify-center flex-shrink-0`}>
                  <layer.icon className={`w-5 h-5 ${layer.color}`} strokeWidth={2.2} />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-[14px] text-foreground">{layer.label}</h4>
                  <p className="text-[11px] text-muted-foreground">{layer.desc}</p>
                </div>
                <div className="text-[11px] font-bold text-muted-foreground">L{6 - i}</div>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Oracle Systems */}
        <PosterSection title="Oracle Systems" description="Five business domain systems — all communication flows through Oracle Core" delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ORACLE_SYSTEMS.map((system, i) => (
              <EntityCard key={system.id} item={system} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </PosterSection>

        {/* Platform Engines */}
        <PosterSection title="Platform Engines" description="Ten cross-cutting engines — how the platform makes everything work" delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PLATFORM_ENGINES.map((engine, i) => (
              <motion.div
                key={engine.id}
                {...scaleEntranceDelay(0.25 + i * 0.04)}
                whileHover={{ y: -3, transition: SPRING.hover }}
                className="relative overflow-hidden p-4 rounded-[20px] glass border border-border/20"
              >
                <GlassSheen />
                <div className={`w-10 h-10 rounded-[14px] ${engine.bg} flex items-center justify-center mb-2.5`}>
                  <engine.icon className={`w-4 h-4 ${engine.color}`} strokeWidth={2.2} />
                </div>
                <h4 className="font-heading font-bold text-[12px] text-foreground">{engine.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{engine.purpose}</p>
              </motion.div>
            ))}
          </div>

          {/* Flow Example */}
          <div className="mt-5 p-4 rounded-[20px] glass border border-primary/15">
            <h5 className="font-heading font-bold text-[13px] text-primary mb-3">{ENGINE_FLOW_EXAMPLE.title}</h5>
            <div className="flex flex-wrap items-center gap-2">
              {ENGINE_FLOW_EXAMPLE.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING.gentle, delay: 0.4 + i * 0.06 }}
                    className="px-3 py-1.5 rounded-[12px] bg-muted/30 border border-border/15"
                  >
                    <p className="text-[10px] font-bold text-primary">
                      {step.engine ? step.engine.replace(/_/g, " ") : step.system.replace(/_/g, " ")}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{step.action}</p>
                  </motion.div>
                  {i < ENGINE_FLOW_EXAMPLE.steps.length - 1 && <ChevronDown className="w-3 h-3 text-muted-foreground rotate-[-90deg]" />}
                </div>
              ))}
            </div>
          </div>
        </PosterSection>

        {/* Platform Services */}
        <PosterSection title="Platform Services" description="Shared infrastructure that powers all Oracle Systems" delay={0.25}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLATFORM_SERVICES.map((service, i) => (
              <EntityCard key={service.id} item={service} delay={0.3 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

        {/* Operations Center */}
        <PosterSection title="Operations Center" description="Four-tier hierarchy — from Founder to Operators" delay={0.3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {OPERATIONS_HIERARCHY.filter(h => h.id !== "bud").map((tier, i) => (
              <motion.div
                key={tier.id}
                {...scaleEntranceDelay(0.35 + i * 0.05)}
                whileHover={{ y: -4, transition: SPRING.hover }}
                className="relative overflow-hidden p-5 rounded-[22px] glass border border-border/20"
              >
                <GlassSheen />
                <div className={`w-12 h-12 rounded-[16px] ${tier.bg} flex items-center justify-center mb-3`}>
                  <tier.icon className={`w-5 h-5 ${tier.color}`} strokeWidth={2.2} />
                </div>
                <h4 className="font-heading font-bold text-[14px] text-foreground">{tier.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{tier.description}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Integrations */}
        <PosterSection title="Integrations" description="External services connected through the Integration Bridge" delay={0.35}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INTEGRATIONS.map((item, i) => (
              <IntegrationCard key={item.name} item={item} delay={0.4 + i * 0.04} />
            ))}
          </div>
        </PosterSection>

        {/* Communication Protocol */}
        <PosterSection title="Oracle Communication Protocol" description="How a request flows through the platform" delay={0.4}>
          <div className="space-y-2">
            {ORCHESTRATION_PROTOCOL.flow.map((flowStep, i) => (
              <motion.div
                key={i}
                {...slideInRight(0.45 + i * 0.06)}
                className="flex items-center gap-3 p-3 rounded-[16px] glass border border-border/15"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                  {flowStep.step}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-foreground">{flowStep.from} → {flowStep.to}</p>
                  <p className="text-[10px] text-muted-foreground">{flowStep.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </PosterSection>
      </div>
    </div>
  );
}
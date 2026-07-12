import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown, Sparkles, ChevronRight, Database, X,
} from "lucide-react";
import { SectionCard, StatusPill, PortalPageHeader } from "@/components/portal/PortalUI";
import {
  ORACLE_CORE, BUD_INTERFACE, INTELLIGENCE_AGENTS, INTERNAL_SERVICES,
} from "@/lib/oracleEcosystem";

const EASE = [0.16, 1, 0.3, 1];

export default function AgentNetwork() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Agent Network"
        subtitle="Full topology of the UNIBUD intelligence ecosystem — Oracle, Bud, named agents, and all internal specialist services."
        action={<StatusPill status="operational" label="All Agents Online" />}
      />

      {/* Oracle → Bud → Agents Flow */}
      <SectionCard title="Intelligence Topology" description="Oracle mediates all communication between Bud and specialist agents" delay={0}>
        <div className="p-6">
          {/* Oracle at top */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="p-5 rounded-[24px] bg-primary/8 border border-primary/20 elevated-shadow text-center max-w-[280px]"
            >
              <div className="w-14 h-14 rounded-[20px] bg-primary/15 flex items-center justify-center gold-glow mx-auto mb-3">
                <Crown className="w-7 h-7 text-primary" strokeWidth={2.2} />
              </div>
              <h4 className="font-heading font-bold text-[15px] text-foreground">{ORACLE_CORE.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{ORACLE_CORE.codename}</p>
            </motion.div>

            {/* Connecting line */}
            <div className="w-px h-8 bg-primary/20" />

            {/* Bud */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="p-5 rounded-[24px] bg-card border border-primary/15 elevated-shadow text-center max-w-[280px]"
            >
              <div className="w-14 h-14 rounded-[20px] bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-primary" strokeWidth={2.2} />
              </div>
              <h4 className="font-heading font-bold text-[15px] text-foreground">{BUD_INTERFACE.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Only Visible Assistant</p>
            </motion.div>

            {/* Connecting lines to agents */}
            <div className="w-px h-8 bg-border/30" />

            {/* Named Agents Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-4xl">
              {INTELLIGENCE_AGENTS.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, ease: EASE }}
                  className="p-4 rounded-[20px] bg-muted/20 border border-border/20 text-center"
                >
                  <div className={`w-10 h-10 rounded-[14px] ${agent.bg} flex items-center justify-center mx-auto mb-2`}>
                    <agent.icon className={`w-4 h-4 ${agent.color}`} strokeWidth={2.2} />
                  </div>
                  <h5 className="font-heading font-bold text-[13px] text-foreground">{agent.name}</h5>
                  <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">{agent.codename}</p>
                  <div className="mt-2">
                    <StatusPill status="operational" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Internal Specialist Services */}
      <SectionCard title="Internal Specialist Services" description="All specialist capabilities managed through Oracle and delivered via Bud" delay={0.15}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {INTERNAL_SERVICES.map((service, i) => {
            const parentAgent = INTELLIGENCE_AGENTS.find((a) => a.id === service.parentAgent);
            return (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.03, ease: EASE }}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                className={`text-left p-4 rounded-[20px] border transition-all spring-tap ${
                  selectedService === service.id
                    ? "border-primary/25 bg-primary/5"
                    : "border-border/15 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-[12px] ${service.color === "text-primary" ? "bg-primary/10" : service.color === "text-info" ? "bg-info/10" : service.color === "text-success" ? "bg-success/10" : service.color === "text-warning" ? "bg-warning/10" : service.color === "text-error" ? "bg-error/10" : service.color === "text-purple" ? "bg-purple/10" : "bg-muted/40"} flex items-center justify-center flex-shrink-0`}>
                    <service.icon className={`w-4 h-4 ${service.color}`} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-heading font-semibold text-[13px] text-foreground">{service.name}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                    {parentAgent && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
                        <parentAgent.icon className={`w-2.5 h-2.5 ${parentAgent.color}`} />
                        <span className="text-[9px] font-semibold text-muted-foreground">{parentAgent.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Service Detail */}
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-5"
          >
            {(() => {
              const service = INTERNAL_SERVICES.find((s) => s.id === selectedService);
              const parentAgent = INTELLIGENCE_AGENTS.find((a) => a.id === service.parentAgent);
              return (
                <div className="p-5 rounded-[24px] bg-muted/20 border border-border/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[14px] bg-muted/40 flex items-center justify-center`}>
                        <service.icon className={`w-5 h-5 ${service.color}`} />
                      </div>
                      <div>
                        <h5 className="font-heading font-bold text-[15px] text-foreground">{service.name}</h5>
                        <p className="text-[11px] text-muted-foreground">{service.domain} Domain</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedService(null)} className="p-1 rounded-lg hover:bg-muted/40">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Parent Agent</p>
                      <div className="flex items-center gap-2">
                        {parentAgent && <parentAgent.icon className={`w-4 h-4 ${parentAgent.color}`} />}
                        <span className="text-[13px] font-semibold text-foreground">{parentAgent?.name || "—"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Modules</p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.modules.map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded-full bg-muted/40 text-[10px] font-semibold text-foreground">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </SectionCard>

      {/* Communication Matrix */}
      <SectionCard title="Agent Communication Matrix" description="How agents collaborate through Oracle mediation" delay={0.25}>
        <div className="p-5 space-y-2">
          {INTELLIGENCE_AGENTS.map((agent, i) => {
            const services = INTERNAL_SERVICES.filter((s) => s.parentAgent === agent.id);
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 p-3.5 rounded-[18px] bg-muted/20 border border-border/15"
              >
                <div className={`w-10 h-10 rounded-[14px] ${agent.bg} flex items-center justify-center flex-shrink-0`}>
                  <agent.icon className={`w-4 h-4 ${agent.color}`} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground">{services.length} services · {agent.domain} domain</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  {services.slice(0, 3).map((s) => (
                    <span key={s.id} className="px-2 py-1 rounded-full bg-card border border-border/20 text-[10px] font-medium text-muted-foreground">
                      {s.name.replace(" Service", "")}
                    </span>
                  ))}
                  {services.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{services.length - 3}</span>
                  )}
                </div>
                <StatusPill status="operational" />
              </motion.div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
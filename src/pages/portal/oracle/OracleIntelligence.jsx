import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown, Sparkles, ChevronRight, Database, Search, BarChart3,
  Brain, Globe, ShieldCheck, Layers, Settings, Zap, ArrowDown,
  Network, Activity, BookOpen, Lock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, StatusPill, PortalPageHeader } from "@/components/portal/PortalUI";
import {
  ORACLE_CORE, BUD_INTERFACE, INTELLIGENCE_AGENTS, INTERNAL_SERVICES,
  OPERATIONS_HIERARCHY, ORCHESTRATION_PROTOCOL, INTELLIGENCE_STACK,
} from "@/lib/oracleEcosystem";

const EASE = [0.16, 1, 0.3, 1];

export default function OracleIntelligence() {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: conversations } = useQuery({
    queryKey: ["oracleConversations"],
    queryFn: () => base44.entities.BudConversation.list("-created_date", 5),
    retry: false,
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Oracle Intelligence Core"
        subtitle="The platform's knowledge, memory, orchestration, search, analytics, and global education indexing layer."
        action={<StatusPill status="operational" label="Intelligence Active" />}
      />

      {/* Intelligence Stack Visualization */}
      <SectionCard title="Intelligence Stack" description="Oracle → Bud → Architect → Management → Operators → Platform Services" delay={0}>
        <div className="p-6 space-y-3">
          {INTELLIGENCE_STACK.map((layer, i) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
              className="flex items-center gap-4"
            >
              <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                <div className={`w-12 h-12 rounded-[16px] ${layer.bg} flex items-center justify-center`}>
                  <layer.icon className={`w-5 h-5 ${layer.color}`} strokeWidth={2.2} />
                </div>
                {i < INTELLIGENCE_STACK.length - 1 && (
                  <ArrowDown className="w-4 h-4 text-muted-foreground/40 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">L{layer.layer}</span>
                  <h4 className="font-heading font-bold text-[15px] text-foreground">{layer.name}</h4>
                  <span className="text-[11px] text-muted-foreground">{layer.subtitle}</span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{layer.description}</p>
              </div>
              {layer.centerPath && (
                <button
                  onClick={() => navigate(layer.centerPath)}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 spring-tap"
                >
                  Open <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Oracle Core Capabilities + Memory */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Oracle Capabilities" description="Core intelligence functions" delay={0.1}>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ORACLE_CORE.capabilities.map((cap, i) => {
              const icons = [Database, Search, Brain, BarChart3, Globe, Activity, Zap, Lock];
              const Icon = icons[i] || Database;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="p-3.5 rounded-[18px] bg-muted/30 border border-border/20"
                >
                  <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[12px] font-semibold text-foreground leading-snug">{cap}</p>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Memory Stores" description="Oracle's persistent knowledge layers" delay={0.15}>
          <div className="p-5 space-y-3">
            {ORACLE_CORE.memoryStores.map((store, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-3 p-3.5 rounded-[18px] bg-muted/30 border border-border/20"
              >
                <div className="w-8 h-8 rounded-[12px] bg-purple/10 flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-purple" />
                </div>
                <p className="text-[12px] font-medium text-foreground leading-snug pt-1">{store}</p>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bud Interface Summary */}
      <SectionCard title="Bud — The Only Visible Assistant" description="All specialist capabilities are delivered through Bud" delay={0.2}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-primary/15 flex items-center justify-center gold-glow flex-shrink-0">
              <Sparkles className="w-7 h-7 text-primary" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-bold text-[16px] text-foreground">{BUD_INTERFACE.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">{BUD_INTERFACE.tagline}</p>
              <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">{BUD_INTERFACE.description}</p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUD_INTERFACE.domains.map((domain, i) => (
                  <div key={i} className="px-3 py-2 rounded-[12px] bg-primary/5 border border-primary/15">
                    <p className="text-[11px] font-semibold text-primary">{domain}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Named Intelligence Agents */}
      <SectionCard title="Intelligence Agents" description="Six named agents operating behind the scenes through Oracle" delay={0.25}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTELLIGENCE_AGENTS.map((agent, i) => (
            <motion.button
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, ease: EASE }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              className={`text-left p-5 rounded-[24px] border transition-all spring-tap ${
                selectedAgent === agent.id
                  ? "border-primary/30 bg-primary/5 elevated-shadow"
                  : "border-border/20 bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <div className={`w-12 h-12 rounded-[16px] ${agent.bg} flex items-center justify-center mb-3`}>
                <agent.icon className={`w-5 h-5 ${agent.color}`} strokeWidth={2.2} />
              </div>
              <h4 className="font-heading font-bold text-[15px] text-foreground">{agent.name}</h4>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">{agent.codename}</p>
              <p className="text-[11px] text-muted-foreground mt-2 leading-snug line-clamp-2">{agent.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">{getServicesByAgent(agent.id).length} services</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <StatusPill status="operational" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Agent Detail */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-5"
          >
            {(() => {
              const agent = INTELLIGENCE_AGENTS.find((a) => a.id === selectedAgent);
              const services = getServicesByAgent(agent.id);
              return (
                <div className="p-5 rounded-[24px] bg-muted/20 border border-border/20 space-y-4">
                  <div>
                    <h5 className="font-heading font-bold text-[14px] text-foreground mb-2">Responsibilities</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {agent.responsibilities.map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-[12px] text-muted-foreground leading-snug">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-[14px] text-foreground mb-2">Managed Services</h5>
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <span key={s.id} className="px-3 py-1.5 rounded-full bg-card border border-border/30 text-[11px] font-semibold text-foreground">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </SectionCard>

      {/* Orchestration Protocol */}
      <SectionCard title="Orchestration Protocol" description="How requests flow through the intelligence stack" delay={0.3}>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-stretch gap-3">
            {ORCHESTRATION_PROTOCOL.flow.map((step, i) => (
              <React.Fragment key={step.step}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="flex-1 p-4 rounded-[20px] bg-muted/30 border border-border/20 text-center"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-[12px] font-bold text-primary">{step.step}</span>
                  </div>
                  <p className="text-[12px] font-bold text-foreground">{step.from} → {step.to}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{step.description}</p>
                </motion.div>
                {i < ORCHESTRATION_PROTOCOL.flow.length - 1 && (
                  <div className="hidden lg:flex items-center">
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-[16px] bg-primary/5 border border-primary/15">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">Rule:</span> Agents never communicate directly with users or with each other. Every message flows through Oracle's secure mediation layer.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Recent Conversations */}
      <SectionCard title="Recent Bud Conversations" description="Latest user interactions processed through the intelligence stack" delay={0.35}
        action={<button onClick={() => navigate("/portal/bud-config")} className="text-[12px] font-semibold text-primary hover:underline">Configure Bud</button>}
      >
        <div className="p-5 space-y-2">
          {(conversations || []).length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-[16px] bg-muted/20 border border-border/15"
              >
                <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{conv.title}</p>
                  <p className="text-[10px] text-muted-foreground">{conv.message_count || 0} messages</p>
                </div>
                {conv.type && <StatusPill status="info" label={conv.type} />}
              </motion.div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function getServicesByAgent(agentId) {
  return INTERNAL_SERVICES.filter((s) => s.parentAgent === agentId);
}
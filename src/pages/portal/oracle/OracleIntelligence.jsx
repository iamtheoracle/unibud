import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown, Sparkles, ChevronRight, Database, Search, BarChart3,
  Brain, Globe, ShieldCheck, Layers, Settings, Zap, ArrowDown,
  Network, Activity, BookOpen, Lock, Server,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, StatusPill, PortalPageHeader } from "@/components/portal/PortalUI";
import {
  ORACLE_CORE, BUD_INTERFACE, INTELLIGENCE_AGENTS, INTERNAL_SERVICES,
  OPERATIONS_HIERARCHY, ORCHESTRATION_PROTOCOL, INTELLIGENCE_STACK,
} from "@/lib/oracleEcosystem";
import { ORACLE_SYSTEMS } from "@/lib/oracleSystems";
import { PLATFORM_ENGINES, ENGINE_FLOW_EXAMPLE } from "@/lib/platformEngines";
import { PLATFORM_SERVICES } from "@/lib/platformServices";
import { REGISTRIES, REGISTRY_PRINCIPLES } from "@/lib/globalRegistries";
import { KNOWLEDGE_NODES, SEARCH_CATEGORIES } from "@/lib/knowledgeNetwork";
import { COUNTRY_DOMAINS, COUNTRY_ENGINE_PRINCIPLES } from "@/lib/countryEngine";

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

      {/* Full Architecture Diagram */}
      <SectionCard title="Platform Architecture" description="Oracle Core → Bud → Oracle Systems → Platform Engines → Platform Services" delay={0.05}>
        <div className="p-6 space-y-4">
          {/* Layer 1: Oracle Core */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, ease: EASE }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-4 rounded-[24px] bg-primary/10 border border-primary/20 elevated-shadow">
              <div className="w-10 h-10 rounded-[14px] bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[15px] text-foreground">Oracle Core</h4>
                <p className="text-[10px] text-muted-foreground">Intelligence & Orchestration</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground/40" /></div>

          {/* Layer 2: Bud */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, ease: EASE }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-[20px] bg-primary/8 border border-primary/15">
              <div className="w-8 h-8 rounded-[12px] bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[14px] text-foreground">Bud</h4>
                <p className="text-[10px] text-muted-foreground">The Only User-Facing Assistant</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground/40" /></div>

          {/* Layer 3: Oracle Systems */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, ease: EASE }}
            className="p-4 rounded-[20px] bg-muted/20 border border-border/20"
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center mb-3">Oracle Systems — Business Domains</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {ORACLE_SYSTEMS.map((sys) => (
                <div key={sys.id} className="flex flex-col items-center gap-1.5 p-2.5 rounded-[14px] bg-card border border-border/15">
                  <div className={`w-8 h-8 rounded-[12px] ${sys.bg} flex items-center justify-center`}>
                    <sys.icon className={`w-4 h-4 ${sys.color}`} strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{sys.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground/40" /></div>

          {/* Layer 4: Platform Engines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, ease: EASE }}
            className="p-4 rounded-[20px] bg-muted/20 border border-border/20"
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center mb-3">Platform Engines — How It Works</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PLATFORM_ENGINES.map((eng) => (
                <div key={eng.id} className="flex flex-col items-center gap-1.5 p-2.5 rounded-[14px] bg-card border border-border/15">
                  <div className={`w-8 h-8 rounded-[12px] ${eng.bg} flex items-center justify-center`}>
                    <eng.icon className={`w-4 h-4 ${eng.color}`} strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{eng.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground/40" /></div>

          {/* Layer 5: Platform Services */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.24, ease: EASE }}
            className="p-4 rounded-[20px] bg-muted/20 border border-border/20"
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center mb-3">Platform Services — Shared Infrastructure</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PLATFORM_SERVICES.map((svc) => (
                <div key={svc.id} className="flex flex-col items-center gap-1.5 p-2.5 rounded-[14px] bg-card border border-border/15">
                  <div className={`w-8 h-8 rounded-[12px] ${svc.bg} flex items-center justify-center`}>
                    <svc.icon className={`w-4 h-4 ${svc.color}`} strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{svc.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-muted-foreground/40" /></div>

          {/* Layer 6: Infrastructure */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, ease: EASE }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-[16px] bg-muted/30 border border-border/20">
              <Server className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[12px] font-semibold text-muted-foreground">Infrastructure</span>
            </div>
          </motion.div>
        </div>
      </SectionCard>

      {/* Oracle Systems — The 5 Business Domain Systems */}
      <SectionCard title="Oracle Systems" description="Five business domain systems — all communication flows through Oracle Core" delay={0.22}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ORACLE_SYSTEMS.map((system, i) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.04, ease: EASE }}
              className="p-5 rounded-[24px] border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-[16px] ${system.bg} flex items-center justify-center`}>
                  <system.icon className={`w-5 h-5 ${system.color}`} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-[14px] text-foreground">{system.name}</h4>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{system.codename}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-3 line-clamp-2">{system.description}</p>
              <div className="flex flex-wrap gap-1">
                {system.managedServices.slice(0, 4).map((sid) => {
                  const svc = INTERNAL_SERVICES.find((s) => s.id === sid);
                  if (!svc) return null;
                  return (
                    <span key={sid} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">
                      {svc.name}
                    </span>
                  );
                })}
                {system.managedServices.length > 4 && (
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">
                    +{system.managedServices.length - 4}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="p-4 rounded-[16px] bg-primary/5 border border-primary/15">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">Architecture Rule:</span> Oracle Systems never communicate directly with one another. All inter-system data flows through Oracle Core's orchestration layer. Users interact only with Bud.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Platform Engines */}
      <SectionCard title="Platform Engines" description="Cross-cutting capabilities shared by all Oracle Systems — they define how the platform works" delay={0.26}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_ENGINES.map((engine, i) => (
            <motion.div
              key={engine.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.04, ease: EASE }}
              className="p-5 rounded-[24px] border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-[14px] ${engine.bg} flex items-center justify-center`}>
                  <engine.icon className={`w-5 h-5 ${engine.color}`} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-[13px] text-foreground">{engine.name}</h4>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{engine.purpose}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-3 line-clamp-2">{engine.description}</p>
              <div className="flex flex-wrap gap-1">
                {engine.capabilities.slice(0, 4).map((cap) => (
                  <span key={cap} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">
                    {cap}
                  </span>
                ))}
                {engine.capabilities.length > 4 && (
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">
                    +{engine.capabilities.length - 4}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="p-4 rounded-[16px] bg-info/5 border border-info/15">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-info">Design Principle:</span> Oracle Systems answer "What part of the business does this belong to?" Platform Engines answer "How does the platform make it work?" No engine belongs to a single system — all systems use all engines.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Example Flow */}
      <SectionCard title="Example: Student Taps 'Enroll'" description="How a single action flows through engines and systems" delay={0.3}>
        <div className="p-5">
          <div className="flex flex-col gap-2">
            {ENGINE_FLOW_EXAMPLE.steps.map((step, i) => {
              const isEngine = !!step.engine;
              const item = isEngine
                ? PLATFORM_ENGINES.find((e) => e.id === step.engine)
                : ORACLE_SYSTEMS.find((s) => s.id === step.system);
              if (!item) return null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-[10px] font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className={`w-8 h-8 rounded-[12px] ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[12px] font-bold text-foreground">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">({isEngine ? "Engine" : "System"})</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground">{step.action}</span>
                  {i < ENGINE_FLOW_EXAMPLE.steps.length - 1 && (
                    <ArrowDown className="w-3 h-3 text-muted-foreground/30" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Platform Services */}
      <SectionCard title="Platform Services" description="Shared infrastructure that powers all Oracle Systems — they connect, they don't decide" delay={0.32}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 + i * 0.04, ease: EASE }}
              className="p-5 rounded-[24px] border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-[14px] ${service.bg} flex items-center justify-center`}>
                  <service.icon className={`w-5 h-5 ${service.color}`} strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-[13px] text-foreground">{service.name}</h4>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{service.purpose}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-3 line-clamp-2">{service.description}</p>
              <div className="flex flex-wrap gap-1">
                {(service.providers || service.capabilities || []).slice(0, 4).map((item) => (
                  <span key={item} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">
                    {item}
                  </span>
                ))}
                {(service.providers || service.capabilities || []).length > 4 && (
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-card border border-border/30 text-muted-foreground">
                    +{(service.providers || service.capabilities || []).length - 4}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="p-4 rounded-[16px] bg-warning/5 border border-warning/15">
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-warning">Key Distinction:</span> Integration Bridge is a Platform Service, not an Oracle System, because it doesn't make decisions — it simply connects UNIBUD to external services. Platform Services provide capabilities; Oracle Systems make business decisions.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Global Registries */}
      <SectionCard title="Global Registries" description="Registry-driven architecture — nothing is hardcoded" delay={0.35}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REGISTRIES.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              className="p-4 rounded-[20px] bg-muted/30 border border-border/20"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-9 h-9 rounded-[14px] ${reg.bg} flex items-center justify-center`}>
                  <reg.icon className={`w-4 h-4 ${reg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-bold text-[13px] text-foreground leading-tight">{reg.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{reg.recordCount > 0 ? `${reg.recordCount} records` : "Configurable"}</p>
                </div>
                {reg.configurable && <span className="text-[9px] font-semibold text-success px-1.5 py-0.5 rounded-full bg-success/10">CFG</span>}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{reg.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="flex flex-wrap gap-2">
            {REGISTRY_PRINCIPLES.map((p, i) => (
              <span key={i} className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Knowledge Network + Country Engine */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Oracle Knowledge Network" description="Global education intelligence graph" delay={0.32}>
          <div className="p-5">
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
              A structured registry of trusted knowledge sources connecting countries, institutions, faculties, departments, courses, lecturers, researchers, students, alumni, scholarships, research, publications, and more into one searchable intelligence network.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {KNOWLEDGE_NODES.map((node) => (
                <span key={node.id} className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-muted/30 border border-border/20 text-foreground">
                  <node.icon className={`w-3 h-3 ${node.color}`} />
                  {node.label}
                  {node.permissionScoped && <Lock className="w-2.5 h-2.5 text-muted-foreground/50" />}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/20">
              <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Search Categories</h5>
              <div className="flex flex-wrap gap-1.5">
                {SEARCH_CATEGORIES.map((cat) => (
                  <span key={cat} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15 text-primary">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Global Country Engine" description="One architecture for every country" delay={0.35}>
          <div className="p-5">
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
              Every country follows the same architecture. 17 domains are supported for every country — only the data changes, the architecture never changes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COUNTRY_DOMAINS.map((domain) => (
                <div key={domain.id} className="flex items-center gap-2 p-2.5 rounded-[12px] bg-muted/30 border border-border/20">
                  <domain.icon className={`w-3.5 h-3.5 ${domain.color} flex-shrink-0`} />
                  <span className="text-[11px] font-medium text-foreground truncate">{domain.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/20">
              <div className="flex flex-wrap gap-1.5">
                {COUNTRY_ENGINE_PRINCIPLES.map((p, i) => (
                  <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-success/5 border border-success/15 text-success">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

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
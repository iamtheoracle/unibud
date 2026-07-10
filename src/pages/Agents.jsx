import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, ShieldCheck, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { AGENTS, isAgentEnabled, setAgentEnabled, formatLastActivity } from "@/lib/agentRegistry";

const MEMORY_FIELDS = [
  "university", "faculty", "department", "level", "preferred_study_time",
  "goals", "interests", "difficult_subjects", "dream_job", "skills_to_develop",
];

export default function Agents() {
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});
  const [expandedAgent, setExpandedAgent] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const filledFields = MEMORY_FIELDS.filter((f) => {
    const val = user?.[f];
    return val && (!Array.isArray(val) || val.length > 0);
  }).length;
  const personalizationPct = Math.round((filledFields / MEMORY_FIELDS.length) * 100);

  const categories = [...new Set(AGENTS.map((a) => a.category))];

  const handleToggle = (agentId) => {
    setAgentEnabled(agentId, !isAgentEnabled(agentId));
    forceUpdate({});
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[20px] tracking-tight text-foreground">Bud Agents</h1>
            <p className="text-[11px] text-muted-foreground">{AGENTS.length} specialist agents</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="font-heading font-semibold text-[13px] text-foreground">Bud coordinates everything</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                You don't choose agents — Bud does. Just talk to Bud and it automatically activates the right specialists behind the scenes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-5">
        <Link to="/bud-memory" className="block bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover spring-tap">
          <div className="flex items-center justify-between mb-2">
            <p className="font-heading font-semibold text-[13px] text-foreground">Personalization</p>
            <span className="text-[11px] font-bold text-primary">{personalizationPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personalizationPct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {personalizationPct < 30 ? "Bud is learning about you" : personalizationPct < 70 ? "Bud knows you fairly well" : "Bud knows you well"}
          </p>
        </Link>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-5">
          <h3 className="font-heading font-bold text-[14px] text-foreground px-5 mb-3">{category}</h3>
          <div className="px-4 space-y-2.5">
            {AGENTS.filter((a) => a.category === category).map((agent, i) => {
              const enabled = isAgentEnabled(agent.id);
              const isExpanded = expandedAgent === agent.id;
              const lastActivity = formatLastActivity(agent.id);
              const AgentIcon = agent.icon;

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="w-full text-left p-3.5 flex items-start gap-3"
                  >
                    <div className={"w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 " + agent.bg}>
                      <AgentIcon className={"w-5 h-5 " + agent.color} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-heading font-semibold text-[13px] text-foreground">{agent.name}</p>
                        {agent.optional === false && (
                          <ShieldCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{agent.short}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={"flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full " + (enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                          <span className={"w-1.5 h-1.5 rounded-full " + (enabled ? "bg-success" : "bg-muted-foreground")} />
                          {enabled ? "Active" : "Disabled"}
                        </span>
                        <span className="text-[9px] text-muted-foreground">Last: {lastActivity}</span>
                      </div>
                    </div>
                    {agent.optional && (
                      <div
                        onClick={(e) => { e.stopPropagation(); handleToggle(agent.id); }}
                        className={"w-10 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 " + (enabled ? "bg-primary" : "bg-muted")}
                      >
                        <motion.div
                          animate={{ x: enabled ? 16 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          className="w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                      </div>
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="px-3.5 pb-3.5"
                    >
                      <div className="pt-1 border-t border-border/30">
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2.5">{agent.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {agent.capabilities.map((cap, ci) => (
                            <span key={ci} className="px-2 py-1 rounded-full bg-muted text-[9px] text-foreground font-medium">{cap}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="text-[9px] text-muted-foreground">Modules:</span>
                          {agent.modules.map((mod, mi) => (
                            <span key={mi} className="text-[9px] text-primary font-medium">{mod}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
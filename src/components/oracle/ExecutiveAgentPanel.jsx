import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Users, Bot } from "lucide-react";
import { SUPER_AGENTS } from "@/lib/oracle/executiveMode";

/**
 * ExecutiveAgentPanel — shows the Oracle consultation plan after
 * authority verification. Visualizes which specialist agents Oracle
 * will coordinate for executive operations.
 */
export default function ExecutiveAgentPanel({ verification, consultationPlan }) {
  if (!verification || !consultationPlan) return null;

  return (
    <div className="crystal-card radius-lg p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-[14px]">Agent Coordination</h3>
          <p className="text-[11px] text-muted-foreground">Oracle orchestrates specialist agents in Executive Mode</p>
        </div>
      </div>

      {/* Verified authority badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass mb-4">
        <Crown className="w-3.5 h-3.5 text-gold" />
        <span className="text-[12px] font-semibold font-mono">{verification.authorityCode}</span>
        <span className="text-[11px] text-muted-foreground">— verified</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-success ml-auto" />
      </div>

      {/* Consultation sequence */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">
          Consultation Sequence ({consultationPlan.totalSteps} agents)
        </p>
        {consultationPlan.consultationSequence.map((step, i) => {
          const Icon = Users;
          return (
            <motion.div
              key={step.agentId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30"
            >
              <div className="w-7 h-7 rounded-full glass flex items-center justify-center text-[11px] font-bold font-mono">
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate">{step.agentName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{step.role}</p>
              </div>
              <span className="text-[9px] text-muted-foreground/60 text-right max-w-[100px] truncate">
                {step.expertise}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Execution phases */}
      <div className="mt-4 pt-4 border-t border-border/20">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">Execution Phases</p>
        <div className="grid grid-cols-4 gap-1.5">
          {consultationPlan.phases?.map((phase) => (
            <div key={phase.phase} className="text-center px-1.5 py-2 rounded-lg glass">
              <p className="text-[9px] font-bold text-muted-foreground/60">P{phase.phase}</p>
              <p className="text-[10px] font-semibold mt-0.5 leading-tight">{phase.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
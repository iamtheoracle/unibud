import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, ShieldCheck, Lock } from "lucide-react";
import { levelByCode, SUPER_AGENT_ROLES } from "@/lib/oracle/authorityLevels";

/**
 * ExecutiveAgentPanel — shows Oracle's coordination plan after
 * authority verification. Displays the verified authority level,
 * its capabilities, and the Super Agents Oracle coordinates.
 */
export default function ExecutiveAgentPanel({ verification }) {
  if (!verification) return null;

  const levelData = levelByCode(verification.authorityCode);
  if (!levelData) return null;

  return (
    <div className="crystal-card radius-lg p-5">
      {/* Verified level header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-[14px]">Authority Recognized</h3>
          <p className="text-[11px] text-muted-foreground">Oracle Executive Mode active</p>
        </div>
        {levelData.readOnly && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full glass text-[9px] font-semibold text-muted-foreground">
            <Lock className="w-2.5 h-2.5" /> Read-only
          </span>
        )}
      </div>

      {/* Level badge */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg glass mb-4">
        <Crown className="w-3.5 h-3.5 text-gold" />
        <div className="flex-1">
          <p className="text-[12px] font-semibold">Level {levelData.level}</p>
          <p className="text-[10px] text-muted-foreground">{levelData.title}</p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{levelData.code}</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
      </div>

      {/* Authority description */}
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-4 px-1">
        {levelData.authority}
      </p>

      {/* Capabilities */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-1.5">
          {levelData.capabilities.map((cap, i) => (
            <motion.span
              key={cap}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="px-2 py-1 rounded-md bg-muted/40 text-[10px] font-medium"
            >
              {cap}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Coordinated Super Agents */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">
          Oracle Coordinates {levelData.agents.length} Agents
        </p>
        <div className="space-y-1.5">
          {levelData.agents.map((agentId, i) => {
            const agent = SUPER_AGENT_ROLES[agentId];
            if (!agent) return null;
            return (
              <motion.div
                key={agentId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg bg-muted/20"
              >
                <div className="w-6 h-6 rounded-full glass flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold uppercase">{agent.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold">{agent.name}</p>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {agent.responsibilities.join(" · ")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
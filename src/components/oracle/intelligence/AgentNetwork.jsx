import React from "react";
import { motion } from "framer-motion";
import { SUPER_AGENTS } from "@/lib/oracle/executiveMode";

const AGENT_DIVISION_COLORS = {
  Vision: "text-information",
  Engineering: "text-success",
  Intelligence: "text-primary",
  Trust: "text-warning",
  Operations: "text-muted-foreground",
  Governance: "text-gold",
};

/**
 * AgentNetwork — visualizes the Super Agent network that Oracle coordinates.
 * Shows each agent, their division, and their current coordination status.
 */
export default function AgentNetwork() {
  const agents = Object.values(SUPER_AGENTS);

  return (
    <div className="crystal-card radius-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading font-bold text-[13px]">Super Agent Network</h3>
          <p className="text-[10px] text-muted-foreground">Oracle coordinates {agents.length} specialist agents</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success live-pulse" />
          <span className="text-[10px] text-muted-foreground">Active</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {agents.map((agent, i) => {
          const colorClass = AGENT_DIVISION_COLORS[agent.role?.split(" ")[0]] || "text-muted-foreground";
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/20 hover:bg-muted/40"
            >
              <div className="w-7 h-7 rounded-lg glass flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold font-mono uppercase">{agent.name.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate">{agent.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{agent.role}</p>
              </div>
              <span className={`text-[9px] font-semibold ${colorClass} shrink-0`}>
                {agent.expertise?.[0] || "—"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Activity, Clock, ArrowRight } from "lucide-react";

const PRIORITY_STYLES = {
  critical: { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30" },
  high: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" },
  medium: { bg: "bg-information/15", text: "text-information", border: "border-information/30" },
  low: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

/**
 * RecommendationCard — displays an Oracle recommendation with the
 * 8-point execution standard: problem, root cause, solution, impact,
 * dependencies, risks, testing plan, rollback strategy.
 */
export default function RecommendationCard({ recommendation, index = 0 }) {
  const priority = PRIORITY_STYLES[recommendation.priority] || PRIORITY_STYLES.medium;
  const PriorityIcon = recommendation.priority === "critical" ? AlertTriangle : recommendation.priority === "high" ? Activity : CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`crystal-card radius-lg p-4 border ${priority.border}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${priority.bg} flex items-center justify-center shrink-0`}>
          <PriorityIcon className={`w-4 h-4 ${priority.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priority.bg} ${priority.text}`}>
              {recommendation.priority}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">{recommendation.id}</span>
          </div>
          <h3 className="text-[13px] font-heading font-semibold leading-tight">{recommendation.problem}</h3>
        </div>
      </div>

      {/* 8-Point Execution Standard */}
      <div className="space-y-2">
        <Detail label="Root Cause" value={recommendation.rootCause} />
        <Detail label="Proposed Solution" value={recommendation.proposedSolution} />
        <Detail label="Expected Impact" value={recommendation.expectedImpact} />

        {recommendation.dependencies?.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider w-20 shrink-0 mt-0.5">Dependencies</span>
            <div className="flex flex-wrap gap-1">
              {recommendation.dependencies.map((d, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">{d}</span>
              ))}
            </div>
          </div>
        )}

        {recommendation.risks?.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider w-20 shrink-0 mt-0.5">Risks</span>
            <div className="flex flex-wrap gap-1">
              {recommendation.risks.map((r, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning-foreground/80">{r}</span>
              ))}
            </div>
          </div>
        )}

        <Detail label="Rollback" value={recommendation.rollbackStrategy} />
      </div>

      {/* Assigned agents */}
      {recommendation.assignedAgents?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/20 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/60">Coordinated by:</span>
          {recommendation.assignedAgents.map(a => (
            <span key={a.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full glass">{a.name}</span>
          ))}
          <span className="text-[10px] text-muted-foreground/40 ml-auto flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Pending Review
          </span>
        </div>
      )}
    </motion.div>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider w-20 shrink-0 mt-0.5">{label}</span>
      <span className="text-[11px] text-foreground/80 leading-relaxed flex-1">{value}</span>
    </div>
  );
}
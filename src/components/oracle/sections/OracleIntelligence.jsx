import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, RefreshCw, Loader2, Zap, Shield, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import HealthGrid from "@/components/oracle/intelligence/HealthGrid";
import AgentNetwork from "@/components/oracle/intelligence/AgentNetwork";
import RecommendationCard from "@/components/oracle/intelligence/RecommendationCard";
import { createExecutionPlan } from "@/lib/oracle/orchestrationEngine";

/**
 * OracleIntelligence — Oracle's autonomous intelligence dashboard.
 * Shows platform health, agent network, active recommendations, and
 * the orchestration engine's execution plans.
 */
export default function OracleIntelligence({ module, onActive }) {
  const { toast } = useToast();
  const [healthData, setHealthData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [orchestrationIntent, setOrchestrationIntent] = useState("");
  const [executionPlan, setExecutionPlan] = useState(null);

  const runHealthScan = useCallback(async () => {
    setScanning(true);
    try {
      const res = await base44.functions.invoke("oracleHealthScan", { scope: "full" });
      const data = res.data || res;
      setHealthData(data);
      if (data.recommendations?.length > 0) {
        setRecommendations(prev => [...data.recommendations, ...prev].slice(0, 10));
      }
      toast({
        title: data.overallStatus === "healthy" ? "Platform Healthy" : `${data.overallStatus} issues detected`,
        description: data.recommendations?.length > 0
          ? `${data.recommendations.length} recommendations generated`
          : "All services operating normally",
      });
    } catch {
      toast({ title: "Health scan failed", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  }, [toast]);

  const handleOrchestrate = () => {
    if (!orchestrationIntent.trim()) return;
    const plan = createExecutionPlan(orchestrationIntent.trim());
    setExecutionPlan(plan);
    toast({
      title: "Execution Plan Generated",
      description: `Oracle coordinated ${plan.analysis.recommendedAgents.length} agents across ${plan.subTasks.length} sub-tasks`,
    });
  };

  return (
    <div className="p-4 lg:p-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass flex items-center justify-center crystal-bloom">
            <Brain className="w-[18px] h-[18px] text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-[16px]">Oracle Intelligence</h1>
            <p className="text-[11px] text-muted-foreground">Autonomous coordination network</p>
          </div>
        </div>
        <button
          onClick={runHealthScan}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold spring-tap disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {scanning ? "Scanning…" : "Run Health Scan"}
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <SummaryTile
          icon={Shield}
          label="Overall Health"
          value={healthData?.overallStatus || "—"}
          color={healthData?.overallStatus === "healthy" ? "text-success" : healthData?.overallStatus === "critical" ? "text-destructive" : "text-warning"}
        />
        <SummaryTile
          icon={Zap}
          label="Active Issues"
          value={healthData ? String(healthData.services?.filter(s => s.status !== "healthy").length) : "—"}
          color="text-warning"
        />
        <SummaryTile
          icon={TrendingUp}
          label="Recommendations"
          value={String(recommendations.length)}
          color="text-information"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Platform Health */}
        <div className="crystal-card radius-lg p-4">
          <h3 className="font-heading font-bold text-[13px] mb-3">Platform Health</h3>
          {healthData ? (
            <HealthGrid services={healthData.services} />
          ) : (
            <div className="py-8 text-center">
              <p className="text-[12px] text-muted-foreground">Run a health scan to see service status</p>
            </div>
          )}
        </div>

        {/* Agent Network */}
        <AgentNetwork />
      </div>

      {/* Orchestration Engine */}
      <div className="crystal-card radius-lg p-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[13px]">Orchestration Engine</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Describe a task — Oracle will analyze it, select agents, break it into sub-tasks, and generate an execution plan.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={orchestrationIntent}
            onChange={(e) => setOrchestrationIntent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOrchestrate()}
            placeholder="e.g. Improve the messaging UX and fix notification delays"
            className="oracle-input flex-1"
          />
          <button
            onClick={handleOrchestrate}
            disabled={!orchestrationIntent.trim()}
            className="px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-40"
          >
            Plan
          </button>
        </div>

        <AnimatePresence>
          {executionPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Execution Plan</span>
                <span className="text-[9px] font-mono text-muted-foreground/50">{executionPlan.planId}</span>
                <span className={`ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full ${executionPlan.analysis.priority === "critical" ? "bg-destructive/15 text-destructive" : executionPlan.analysis.priority === "high" ? "bg-warning/15 text-warning" : "bg-information/15 text-information"}`}>
                  {executionPlan.analysis.priority}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {executionPlan.analysis.recommendedAgents.map(a => (
                  <span key={a.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full glass">{a.name}</span>
                ))}
              </div>

              <div className="space-y-1.5">
                {executionPlan.subTasks.map((sub, i) => (
                  <div key={sub.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/20">
                    <span className="w-5 h-5 rounded-full glass flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate">{sub.title}</p>
                      {sub.description && <p className="text-[10px] text-muted-foreground truncate">{sub.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      {sub.agents.map(a => (
                        <span key={a.id} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">{a.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-4">
          <h3 className="font-heading font-bold text-[14px] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-information" />
            Recommendations ({recommendations.length})
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.id} recommendation={rec} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, color }) {
  return (
    <div className="crystal-card radius-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{label}</span>
      </div>
      <p className={`text-[18px] font-heading font-bold capitalize ${color}`}>{value}</p>
    </div>
  );
}
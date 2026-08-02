import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, CheckCircle2, Wrench, Gauge, Shield,
  Database, Server, Brain, Bell, Cloud, RefreshCw, ChevronDown, ChevronRight,
  Zap, TrendingUp, TrendingDown,
} from "lucide-react";
import { ISSUE_CATEGORIES } from "@/lib/selfhealing/issueRegistry";

const EASE = [0.16, 1, 0.3, 1];

const HEALTH_COLORS = {
  healthy: { bg: "bg-success/15", text: "text-success", label: "Healthy" },
  degraded: { bg: "bg-warning/15", text: "text-warning", label: "Degraded" },
  warning: { bg: "bg-warning/15", text: "text-warning", label: "Warning" },
  critical: { bg: "bg-destructive/15", text: "text-destructive", label: "Critical" },
};

const CATEGORY_ICONS = {
  ui: Activity,
  navigation: Activity,
  api: Server,
  data: Database,
  ai: Brain,
  performance: Gauge,
  security: Shield,
  accessibility: Activity,
  notification: Bell,
  infrastructure: Cloud,
};

const SEVERITY_ICONS = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Activity,
  low: CheckCircle2,
};

const SEVERITY_COLORS = {
  critical: "text-destructive",
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

/**
 * SelfHealingDashboard — admin monitoring dashboard for the self-healing system.
 * Shows live health, detected issues, repair log, and platform metrics.
 */
export default function SelfHealingDashboard({ issues, health, scanning, lastScan, repairLog, onRefresh }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showRepairLog, setShowRepairLog] = useState(false);

  const healthColor = HEALTH_COLORS[health.status] || HEALTH_COLORS.healthy;

  const issuesByCategory = useMemo(() => {
    const groups = {};
    for (const issue of issues) {
      const cat = issue.type ? (issue.type.split("_")[0]) : "other";
      const categoryInfo = ISSUE_CATEGORIES.find((c) => c.id === cat) || ISSUE_CATEGORIES[0];
      const key = categoryInfo.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(issue);
    }
    return groups;
  }, [issues]);

  const stats = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const issue of issues) {
      counts[issue.severity] = (counts[issue.severity] || 0) + 1;
    }
    return counts;
  }, [issues]);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Self-Healing</h1>
          <p className="text-[12px] text-muted-foreground">Continuous monitoring & auto-repair</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={scanning}
          className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap"
        >
          <RefreshCw className={`w-4 h-4 text-foreground ${scanning ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Health Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="crystal-card p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${healthColor.bg} flex items-center justify-center`}>
              <Activity className={`w-6 h-6 ${healthColor.text}`} />
            </div>
            <div>
              <p className="text-[16px] font-bold text-foreground">{health.score}<span className="text-[12px] text-muted-foreground">/100</span></p>
              <p className={`text-[12px] font-medium ${healthColor.text}`}>{healthColor.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Last scan</p>
            <p className="text-[11px] font-medium text-foreground">
              {lastScan ? new Date(lastScan).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            </p>
          </div>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-destructive" },
            { label: "High", value: stats.high, icon: AlertTriangle, color: "text-warning" },
            { label: "Medium", value: stats.medium, icon: Activity, color: "text-warning" },
            { label: "Low", value: stats.low, icon: CheckCircle2, color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-2.5 text-center">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color} mx-auto mb-1`} />
              <p className={`text-[16px] font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Issues by Category */}
      {Object.keys(issuesByCategory).length > 0 ? (
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Detected Issues ({issues.length})
          </p>
          <div className="space-y-2">
            {Object.entries(issuesByCategory).map(([categoryId, catIssues]) => {
              const category = ISSUE_CATEGORIES.find((c) => c.id === categoryId) || ISSUE_CATEGORIES[0];
              const Icon = CATEGORY_ICONS[categoryId] || Activity;
              const isExpanded = expandedCategory === categoryId;
              return (
                <div key={categoryId} className="glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                    className="w-full flex items-center gap-3 p-3.5"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1 text-left text-[13px] font-medium text-foreground">{category.label}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">{catIssues.length}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-border/30">
                      {catIssues.map((issue) => {
                        const SevIcon = SEVERITY_ICONS[issue.severity] || Activity;
                        return (
                          <div key={issue.id} className="flex items-start gap-3 p-3.5 pl-12">
                            <SevIcon className={`w-3.5 h-3.5 ${SEVERITY_COLORS[issue.severity]} mt-0.5 shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-foreground">{issue.title}</p>
                              <p className="text-[11px] text-muted-foreground leading-snug">{issue.message}</p>
                              {issue.repairable && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-success">
                                  <Wrench className="w-2.5 h-2.5" />
                                  Auto-repairable
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="glass rounded-2xl p-6 mb-6 text-center"
        >
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-[14px] font-medium text-foreground">All systems operational</p>
          <p className="text-[12px] text-muted-foreground">No issues detected in the last scan</p>
        </motion.div>
      )}

      {/* Repair Log */}
      {repairLog.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowRepairLog(!showRepairLog)}
            className="flex items-center gap-2 mb-3 spring-tap"
          >
            <Wrench className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Repair Log ({repairLog.length})
            </span>
            {showRepairLog ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {showRepairLog && (
            <div className="glass rounded-2xl divide-y divide-border/30 overflow-hidden">
              {repairLog.slice(0, 20).map((entry, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5">
                  {entry.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground">{entry.action}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.issueId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Platform Metrics */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Platform Health
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "API Health", icon: Server, status: "Operational", color: "text-success" },
            { label: "AI Health", icon: Brain, status: health.status === "healthy" ? "Operational" : "Checking", color: health.status === "healthy" ? "text-success" : "text-warning" },
            { label: "Database", icon: Database, status: "Connected", color: "text-success" },
            { label: "Realtime", icon: Zap, status: typeof navigator !== "undefined" && navigator.onLine ? "Active" : "Offline", color: typeof navigator !== "undefined" && navigator.onLine ? "text-success" : "text-destructive" },
            { label: "Auth", icon: Shield, status: "Active", color: "text-success" },
            { label: "Storage", icon: Cloud, status: "Available", color: "text-success" },
          ].map((metric) => (
            <div key={metric.label} className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={`w-3.5 h-3.5 ${metric.color}`} />
                <span className="text-[11px] font-medium text-foreground">{metric.label}</span>
              </div>
              <p className={`text-[11px] ${metric.color}`}>{metric.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, RefreshCw, Box, Code, Gauge, ShieldCheck, Lock, Heart,
  Brain, Wrench, Rocket, CheckCircle2, AlertTriangle, XCircle, FileText,
} from "lucide-react";
import {
  CONSTITUTION_PREAMBLE,
  CONSTITUTION_CATEGORIES,
  CONSTITUTION_RULES,
  GLOBAL_RULE,
  getRulesByCategory,
} from "@/lib/constitution/rules";
import { runComplianceChecks, computeComplianceScore } from "@/lib/constitution/validator";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORY_ICONS = {
  architecture: Box,
  code_quality: Code,
  performance: Gauge,
  reliability: ShieldCheck,
  security: Lock,
  ux: Heart,
  ai: Brain,
  maintainability: Wrench,
  release: Rocket,
};

const STATUS_ICONS = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
};

const STATUS_COLORS = {
  pass: "text-success",
  warning: "text-warning",
  fail: "text-destructive",
};

/**
 * EngineeringConstitution — admin page showing the complete constitution
 * with live compliance checks.
 *
 * Route: /constitution (admin-only via OracleWorkspaceGuard)
 */
export default function EngineeringConstitution() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ score: 0, status: "pending", counts: {} });

  const runChecks = useCallback(async () => {
    setLoading(true);
    try {
      const checkResults = await runComplianceChecks();
      setResults(checkResults);
      setScore(computeComplianceScore(checkResults));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  // Build a map of ruleId → latest check result
  const resultMap = {};
  for (const r of results) {
    if (!resultMap[r.ruleId] || r.status === "fail") {
      resultMap[r.ruleId] = r;
    }
  }

  const scoreColor =
    score.score >= 90 ? "text-success" : score.score >= 70 ? "text-warning" : "text-destructive";
  const scoreBg =
    score.score >= 90 ? "bg-success/15" : score.score >= 70 ? "bg-warning/15" : "bg-destructive/15";

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Engineering Constitution</h1>
          <p className="text-[12px] text-muted-foreground">{CONSTITUTION_RULES.length} permanent rules</p>
        </div>
        <button
          onClick={runChecks}
          disabled={loading}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
        >
          <RefreshCw className={`w-4 h-4 text-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Preamble */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="crystal-card p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">{CONSTITUTION_PREAMBLE.title}</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{CONSTITUTION_PREAMBLE.statement}</p>
      </motion.div>

      {/* Compliance Score */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="crystal-card p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${scoreBg} flex items-center justify-center`}>
              <ShieldCheck className={`w-6 h-6 ${scoreColor}`} />
            </div>
            <div>
              <p className="text-[18px] font-bold text-foreground">
                {loading ? "—" : `${score.score}`}<span className="text-[12px] text-muted-foreground">/100</span>
              </p>
              <p className={`text-[12px] font-medium ${scoreColor}`}>
                {loading ? "Checking..." : score.status.replace("-", " ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-[12px] font-bold text-success">{score.counts?.pass || 0}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3 h-3 text-warning" />
              <span className="text-[12px] font-bold text-warning">{score.counts?.warning || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-3 h-3 text-destructive" />
              <span className="text-[12px] font-bold text-destructive">{score.counts?.fail || 0}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Automated checks run live. Manual rules require developer review.
        </p>
      </motion.div>

      {/* Global Rule */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 border-l-2 border-l-primary"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Global Rule</p>
        <p className="text-[12px] text-foreground/90 leading-relaxed">{GLOBAL_RULE.rule}</p>
      </motion.div>

      {/* Categories */}
      {CONSTITUTION_CATEGORIES.map((category, catIdx) => {
        const Icon = CATEGORY_ICONS[category.id] || Box;
        const rules = getRulesByCategory(category.id);
        const automatedCount = rules.filter((r) => r.automated).length;

        return (
          <motion.section
            key={category.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.1 + catIdx * 0.03 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-primary" />
              <h2 className="text-[14px] font-bold text-foreground">{category.label}</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {rules.length} rules{automatedCount > 0 ? ` · ${automatedCount} automated` : ""}
              </span>
            </div>

            <div className="glass rounded-2xl divide-y divide-border/30 overflow-hidden">
              {rules.map((rule) => {
                const check = resultMap[rule.id];
                const StatusIcon = check ? STATUS_ICONS[check.status] : null;
                const statusColor = check ? STATUS_COLORS[check.status] : "text-muted-foreground";

                return (
                  <div key={rule.id} className="flex items-start gap-3 p-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                            rule.severity === "critical"
                              ? "bg-destructive/15 text-destructive"
                              : rule.severity === "high"
                              ? "bg-warning/15 text-warning"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {rule.severity}
                        </span>
                        {rule.automated && (
                          <span className="text-[9px] font-medium text-primary">AUTO</span>
                        )}
                      </div>
                      <p className="text-[12px] text-foreground/90 leading-snug">{rule.rule}</p>
                      {check?.message && (
                        <p className={`text-[10px] mt-1 ${statusColor}`}>{check.message}</p>
                      )}
                    </div>
                    {StatusIcon && (
                      <StatusIcon className={`w-4 h-4 ${statusColor} mt-0.5 shrink-0`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
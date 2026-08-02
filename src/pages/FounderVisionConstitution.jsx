import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Fingerprint, Target, Telescope, Sparkles, MousePointerClick,
  ShieldCheck, TrendingUp, Landmark, Check, FileText,
} from "lucide-react";
import {
  FOUNDER_VISION_PREAMBLE,
  FOUNDER_VISION_CATEGORIES,
  FOUNDER_VISION_RULES,
  FOUNDER_VISION_GLOBAL_RULE,
  getFounderVisionRulesByCategory,
} from "@/lib/constitution/founderVision";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORY_ICONS = {
  identity: Fingerprint,
  mission: Target,
  vision: Telescope,
  bud: Sparkles,
  ux: MousePointerClick,
  trust: ShieldCheck,
  growth: TrendingUp,
  legacy: Landmark,
};

export default function FounderVisionConstitution() {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState("identity");

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
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Founder Vision</h1>
          <p className="text-[12px] text-muted-foreground">{FOUNDER_VISION_RULES.length} permanent vision principles</p>
        </div>
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
          <p className="text-[13px] font-bold text-foreground">{FOUNDER_VISION_PREAMBLE.title}</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{FOUNDER_VISION_PREAMBLE.statement}</p>
      </motion.div>

      {/* Global Rule */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="glass rounded-2xl p-4 mb-6 border-l-2 border-l-primary"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Global Rule</p>
        <p className="text-[12px] text-foreground/90 leading-relaxed">{FOUNDER_VISION_GLOBAL_RULE.rule}</p>
      </motion.div>

      {/* Categories */}
      {FOUNDER_VISION_CATEGORIES.map((category, catIdx) => {
        const Icon = CATEGORY_ICONS[category.id] || Fingerprint;
        const rules = getFounderVisionRulesByCategory(category.id);
        const isExpanded = expandedCategory === category.id;

        return (
          <motion.section
            key={category.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.1 + catIdx * 0.03 }}
            className="!mb-4"
          >
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl glass spring-tap"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-semibold text-foreground">{category.label}</p>
                <p className="text-[11px] text-muted-foreground">{rules.length} principles</p>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </motion.div>
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mt-2 glass rounded-2xl divide-y divide-border/30 overflow-hidden"
              >
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 p-3.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      rule.severity === "critical"
                        ? "border-destructive/40 bg-destructive/5"
                        : rule.severity === "high"
                        ? "border-warning/40 bg-warning/5"
                        : "border-muted-foreground/40"
                    }`}>
                      <Check className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground/90 leading-snug">{rule.rule}</p>
                      <span className={`text-[9px] font-bold uppercase mt-1 inline-block ${
                        rule.severity === "critical"
                          ? "text-destructive"
                          : rule.severity === "high"
                          ? "text-warning"
                          : "text-muted-foreground"
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
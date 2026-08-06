import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock } from "lucide-react";
import {
  NON_NEGOTIABLES_PREAMBLE,
  NON_NEGOTIABLES_RULES,
  NON_NEGOTIABLES_GLOBAL_RULE,
} from "@/lib/constitution/nonNegotiables";

const EASE = [0.16, 1, 0.3, 1];

export default function NonNegotiables() {
  const navigate = useNavigate();

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
          <h1 className="text-[20px] font-bold tracking-tight text-foreground">Non-Negotiables</h1>
          <p className="text-[12px] text-muted-foreground">{NON_NEGOTIABLES_RULES.length} permanent rules</p>
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
          <Lock className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">{NON_NEGOTIABLES_PREAMBLE.title}</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{NON_NEGOTIABLES_PREAMBLE.statement}</p>
      </motion.div>

      {/* Global Rule */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="glass rounded-2xl p-4 mb-6 border-l-2 border-l-primary"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Final Rule</p>
        <p className="text-[12px] text-foreground/90 leading-relaxed">{NON_NEGOTIABLES_GLOBAL_RULE.rule}</p>
      </motion.div>

      {/* Rules List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        className="glass rounded-2xl divide-y divide-border/30 overflow-hidden"
      >
        {NON_NEGOTIABLES_RULES.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.12 + idx * 0.02 }}
            className="flex items-start gap-3 p-4"
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
              rule.severity === "critical"
                ? "border-destructive/40 bg-destructive/5"
                : "border-warning/40 bg-warning/5"
            }`}>
              <Check className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground/90 leading-snug">{rule.rule}</p>
              <span className={`text-[9px] font-bold uppercase mt-1 inline-block ${
                rule.severity === "critical"
                  ? "text-destructive"
                  : "text-warning"
              }`}>
                {rule.severity}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
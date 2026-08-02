import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sun, GraduationCap, Building2, Heart, Zap, Sparkles,
  CheckSquare, Brain, Users, ShieldCheck, Flame,
} from "lucide-react";
import { AUTOMATIONS, AUTOMATION_CATEGORIES } from "@/lib/autonomous/automations";
import { loadPreferences, toggleAutomation } from "@/lib/autonomous/preferences";

const CATEGORY_ICONS = {
  briefing: Sun,
  academic: GraduationCap,
  campus: Building2,
  wellness: Heart,
  automation: Zap,
  recommendation: Sparkles,
  productivity: CheckSquare,
  learning: Brain,
  social: Users,
  safety: ShieldCheck,
  living: Flame,
};

const EASE = [0.16, 1, 0.3, 1];

/**
 * AutomationSettings — full page for managing all autonomous capabilities.
 * Users can enable, disable, or customize every automation.
 *
 * Route: /automation-settings
 */
export default function AutomationSettings() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(loadPreferences());

  const handleToggle = useCallback((automationId) => {
    const updated = toggleAutomation(automationId);
    setPrefs({ ...updated });
  }, []);

  const enabledCount = AUTOMATIONS.filter((a) => prefs[a.id] !== false).length;

  return (
    <div className="w-full max-w-[520px] mx-auto px-6 pt-6 pb-36 safe-area-pt">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Autonomous Intelligence</h1>
          <p className="text-[12px] text-muted-foreground">
            {enabledCount} of {AUTOMATIONS.length} automations active
          </p>
        </div>
      </div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass rounded-2xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Bud proactively observes your context, anticipates needs, and takes helpful actions.
            Every automation respects your privacy and permissions. Toggle any feature off anytime.
          </p>
        </div>
      </motion.div>

      {/* Categories */}
      {AUTOMATION_CATEGORIES.map((category, catIdx) => {
    const Icon = CATEGORY_ICONS[category.id] || Sparkles;
    const automations = AUTOMATIONS.filter((a) => a.category === category.id);
    if (automations.length === 0) return null;

    return (
      <motion.section
        key={category.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: catIdx * 0.05 }}
        className="mb-8"
      >
        {/* Category header */}
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-primary" />
          <h2 className="text-[14px] font-bold text-foreground">{category.label}</h2>
          <span className="text-[11px] text-muted-foreground ml-auto">
            {automations.filter((a) => prefs[a.id] !== false).length}/{automations.length}
          </span>
        </div>

        {/* Automation list */}
        <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
          {automations.map((auto) => {
            const enabled = prefs[auto.id] !== false;
            return (
              <div key={auto.id} className="flex items-center justify-between p-3.5">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-[13px] font-medium text-foreground">{auto.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{auto.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(auto.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                    enabled ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
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
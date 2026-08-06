import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Calendar, RefreshCw, Sparkles, ChevronRight } from "lucide-react";
import { generateDailyBriefing, getCurrentBriefingType } from "@/lib/autonomous/briefingGenerator";
import { Link } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1];
const STORAGE_PREFIX = "bud_briefing_";

function getStorageKey(type) {
  const date = new Date().toISOString().split("T")[0];
  return `${STORAGE_PREFIX}${type}_${date}`;
}

function getIcon(type) {
  if (type === "evening") return Moon;
  if (type === "weekly") return Calendar;
  return Sun;
}

/**
 * DailyBriefing — a self-contained card that generates and displays
 * Bud's daily briefing (morning/evening/weekly). Cached per-day per-type
 * to avoid redundant LLM calls. Can be placed on Home or any dashboard.
 */
export default function DailyBriefing() {
  const type = getCurrentBriefingType();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const Icon = getIcon(type);

  const load = useCallback(
    async (force = false) => {
      const cached = !force && localStorage.getItem(getStorageKey(type));
      if (cached) {
        setBriefing(cached);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await generateDailyBriefing(type);
        setBriefing(result);
        localStorage.setItem(getStorageKey(type), result);
      } catch {
        setBriefing(null);
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="crystal-card p-5 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">
              {type === "evening" ? "Evening Recap" : type === "weekly" ? "Weekly Summary" : "Morning Briefing"}
            </p>
            <p className="text-[10px] text-muted-foreground">Powered by Bud</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 rounded-full shimmer w-full" />
          <div className="h-3 rounded-full shimmer w-[85%]" />
          <div className="h-3 rounded-full shimmer w-[70%]" />
        </div>
      ) : briefing ? (
        <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-line">
          {briefing}
        </p>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          Your briefing will appear here shortly.
        </p>
      )}

      {/* Footer */}
      <Link
        to="/automation-settings"
        className="flex items-center gap-1 mt-3 text-[11px] font-medium text-primary spring-tap"
      >
        <Sparkles className="w-3 h-3" />
        Customize autonomous features
        <ChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
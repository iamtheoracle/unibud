import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

export default function BudMilestoneSummary({ achievements }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(false);
    try {
      const verified = achievements.filter((a) => !a.title?.includes("[Draft]"));
      const byCategory = {};
      verified.forEach((a) => {
        const cat = a.category || "other";
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(a);
      });

      const recent = verified
        .filter((a) => a.date_earned)
        .sort((a, b) => new Date(b.date_earned) - new Date(a.date_earned))
        .slice(0, 5);

      const prompt = `You are Bud, a supportive academic mentor for a university student. Based on the student's verified achievements below, write a warm, personalized milestone summary (2-3 sentences). Celebrate their progress, highlight their strongest area, and suggest one meaningful next goal. Be genuine and specific — no generic platitudes.

Total achievements: ${verified.length}
Categories earned: ${Object.keys(byCategory).map((k) => k.replace(/_/g, " ")).join(", ")}
Recent achievements: ${recent.map((a) => `${a.title} (${a.category})`).join("; ") || "None yet"}
Highest category count: ${Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)[0]?.[0]?.replace(/_/g, " ") || "None"}

Write only the summary, no preamble.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            nextGoal: { type: "string" },
          },
        },
      });
      setSummary(res);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (achievements?.length > 0) generate();
    else setLoading(false);
  }, [achievements?.length]);

  if (loading) {
    return (
      <div className="rounded-[18px] glass-card p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-foreground">Bud is reviewing your milestones…</p>
          <p className="text-[10px] text-muted-foreground">Analyzing your verified achievements</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-[18px] glass-card p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] bg-muted/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-foreground">Milestone summary unavailable</p>
          <p className="text-[10px] text-muted-foreground">Try again in a moment</p>
        </div>
        <button onClick={generate} className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center spring-tap">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="relative rounded-[18px] glass-card p-4 ambient-glow"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0 bud-breathe">
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">Bud's Milestone Summary</p>
          <p className="text-[12px] text-foreground/85 leading-relaxed">{summary.summary}</p>
        </div>
      </div>
      {summary.nextGoal && (
        <div className="mt-2.5 pl-12">
          <div className="flex items-start gap-1.5">
            <span className="text-[10px] font-bold text-chocolate">Next goal:</span>
            <span className="text-[11px] text-foreground/70 leading-relaxed">{summary.nextGoal}</span>
          </div>
        </div>
      )}
      <button onClick={generate} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center spring-tap">
        <RefreshCw className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
      </button>
    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, CloudRain, Clock } from "lucide-react";

/**
 * BudInsights — Bud auto-generates calm, useful insights from context + memory.
 * Examples: focus window, attendance trend, rain before lecture, revision gaps.
 */
export default function BudInsights({ ctx, memories }) {
  const out = [];
  if (ctx.timeOfDay === "night") out.push({ icon: Clock, text: "You're up late — a short focused session beats a long tired one." });
  if (ctx.severeWeather || ctx.weatherScene === "rain" || ctx.weatherScene === "storm")
    out.push({ icon: CloudRain, text: "Heavy rain is expected before your next lecture. Plan indoor study." });
  if (ctx.attendanceRate !== null) out.push({ icon: TrendingUp, text: `Your attendance is ${Math.round(ctx.attendanceRate * 100)}% — keep showing up.` });
  if (ctx.nextExamDays !== null && ctx.nextExamDays <= 7)
    out.push({ icon: Sparkles, text: `${ctx.nextExamDays} day${ctx.nextExamDays === 1 ? "" : "s"} to your next exam — now's the best time to revise.` });
  (memories || []).slice(0, 2).forEach((m) => out.push({ icon: Brain, text: m.content }));
  if (!out.length) out.push({ icon: Sparkles, text: "I'm still learning your rhythms. Keep going — I'll start noticing patterns." });

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Smart insights</p>
      {out.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3.5 rounded-[20px] glass">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" strokeWidth={2.2} />
            </span>
            <p className="text-[12.5px] text-foreground leading-snug">{it.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
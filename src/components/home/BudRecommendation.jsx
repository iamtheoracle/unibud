import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BudRecommendation() {
  return (
    <GlassCard delay={0.25} className="p-4 bg-gradient-to-br from-info/10 via-purple/10 to-info/10 border-info/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-info to-purple flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-[13px] text-foreground mb-1">Bud's Daily Tip</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-2.5">
            You've been consistent with Data Structures this week! Try reviewing Binary Trees before tomorrow's class for a head start. 🌟
          </p>
          <Link
            to="/bud"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-info to-purple text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-all"
          >
            Study with Bud
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
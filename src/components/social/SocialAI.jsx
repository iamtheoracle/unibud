import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Briefcase, GraduationCap, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * SocialAI — Bud's social intelligence: surfaces opportunities, deadlines,
 * and safety warnings across the curated feed.
 */
export default function SocialAI() {
  const opps = useQuery({ queryKey: ["social-ai-opps"], queryFn: () => base44.entities.Opportunity.list("-created_date", 30) });
  const sch = useQuery({ queryKey: ["social-ai-sch"], queryFn: () => base44.entities.Scholarship.list("-created_date", 30) });

  const oc = (opps.data || []).length;
  const sc = (sch.data || []).length;
  const soon = (sch.data || []).some((x) => x.deadline) ? "Scholarship deadlines approaching — don't miss out." : null;

  const insights = [
    { icon: Briefcase, text: oc ? `${oc} open opportunit${oc === 1 ? "y" : "ies"} match your path.` : "No open opportunities yet — I'll surface them as they appear.", tone: "text-primary" },
    { icon: GraduationCap, text: sc ? `${sc} scholarship${sc === 1 ? "" : "s"} available right now.${soon ? " " + soon : ""}` : "Watching for scholarships that fit you.", tone: "text-success" },
    { icon: ShieldAlert, text: "Stay safe — beware fake giveaways and suspicious links. I'll flag anything that looks off.", tone: "text-warning" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Bud social intel</p>
      </div>
      {insights.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2.5 p-3 rounded-[18px] glass">
            <span className={`w-7 h-7 rounded-full bg-card flex items-center justify-center flex-shrink-0 ${it.tone}`}><Icon className="w-3.5 h-3.5" strokeWidth={2.2} /></span>
            <p className="text-[12px] text-foreground leading-snug">{it.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
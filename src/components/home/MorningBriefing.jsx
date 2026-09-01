import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function MorningBriefing({ user }) {
  const { isDemoMode } = useDemoMode();
  const { data: budTip } = useQuery({
    queryKey: ["budMorningTip"],
    queryFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "You are Bud, a warm university companion. Generate a short (1-2 sentence) motivational morning message for a student. Be encouraging, specific, and natural. No emojis except maybe one. Vary your tone daily. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) + ".",
      });
      return res;
    },
    staleTime: 1000 * 60 * 60 * 6,
    enabled: !isDemoMode,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const fallback = isDemoMode
    ? "You've got 3 classes today and 2 assignments due this week. Let's make it count!"
    : "Welcome to UNIBUD. Add your courses and assignments to get personalized guidance from Bud.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[24px] p-5 elevated-shadow bg-card border border-border/15 primary-card-gradient"
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/8" />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">{today}</p>
            <p className="text-foreground font-heading font-bold text-[15px]">{greeting}, {firstName}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-[12px] leading-relaxed">{budTip || fallback}</p>
      </div>
    </motion.div>
  );
}
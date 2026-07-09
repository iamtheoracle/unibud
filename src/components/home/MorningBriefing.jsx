import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function MorningBriefing({ user }) {
  const { data: budTip } = useQuery({
    queryKey: ["budMorningTip"],
    queryFn: async () => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud, a warm university companion. Generate a short (1-2 sentence) motivational morning message for a student. Be encouraging, specific, and natural. No emojis except maybe one. Vary your tone daily. Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`,
      });
      return res;
    },
    staleTime: 1000 * 60 * 60 * 6,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-5 shadow-sm bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2E]"
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#28A745]/15" />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide">{today}</p>
            <p className="text-white font-heading font-bold text-[15px]">{greeting}, {firstName}</p>
          </div>
        </div>
        <p className="text-white/70 text-[12px] leading-relaxed">
          {budTip || "You've got 3 classes today and 2 assignments due this week. Let's make it count! 🌟"}
        </p>
      </div>
    </motion.div>
  );
}
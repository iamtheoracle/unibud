import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { resolveDisplayName } from "@/lib/userDisplayName";
import { Send } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function MeBudPanel({ user }) {
  const navigate = useNavigate();
  const [askText, setAskText] = useState("");

  const { data: memories = [] } = useQuery({
    queryKey: ["me", "bud-memory-count"],
    queryFn: () => base44.entities.BudMemory.list("-created_date", 50),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (resolveDisplayName(user) || user?.full_name || "there").split(" ")[0];

  const handleAsk = (e) => {
    e.preventDefault();
    if (!askText.trim()) return;
    navigate("/home");
  };

  const chips = [
    { label: "Memory", value: memories.length },
    { label: "Packs", value: "2" },
    { label: "Automations", value: "—" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
      className="rounded-[24px] p-5 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,138,0,0.06), rgba(17,17,17,0.3))",
        border: "1px solid rgba(255,138,0,0.15)",
      }}
    >
      {/* Bud orb + greeting */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full bud-breathe flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #FFFFFF 0%, #FF8A00 60%, #4A2C1D 100%)",
            boxShadow: "0 0 24px rgba(255,138,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        />
        <div className="flex-1">
          <p className="text-[15px] font-bold text-white">{greeting}, {firstName}</p>
          <p className="text-[12px] text-white/50">Your companion is ready</p>
        </div>
      </div>

      {/* Quick Ask */}
      <form onSubmit={handleAsk} className="flex items-center gap-2 mt-4">
        <input
          value={askText}
          onChange={(e) => setAskText(e.target.value)}
          placeholder="Ask Bud anything..."
          className="flex-1 px-4 py-2.5 rounded-[16px] text-[13px] text-white placeholder:text-white/30 outline-none"
          style={{
            background: "rgba(255,138,0,0.06)",
            border: "1px solid rgba(255,138,0,0.10)",
          }}
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #FF8A00, #FFA64D)" }}
        >
          <Send className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
        </motion.button>
      </form>

      {/* Status chips */}
      <div className="flex gap-2 mt-3">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,138,0,0.08)" }}
          >
            <span className="text-[11px] font-semibold text-white/70">{chip.label}</span>
            <span className="text-[11px] font-bold text-white/90">{chip.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
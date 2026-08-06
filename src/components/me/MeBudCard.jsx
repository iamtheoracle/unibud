import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Brain, Mic, Sparkles, Package, Zap, Link, History,
  ChevronRight, Settings,
} from "lucide-react";
import MeIcon from "@/components/me/MeIcon";

const EASE = [0.16, 1, 0.3, 1];

const BUD_ITEMS = [
  { icon: Brain, label: "Memory", to: "/memory" },
  { icon: Mic, label: "Voice", to: "/bud/notifications" },
  { icon: Package, label: "Experience Packs", to: "/settings" },
  { icon: Zap, label: "Automations", to: "/automation" },
  { icon: Sparkles, label: "Personality", to: "/bud-vision" },
  { icon: History, label: "History", to: "/memory" },
  { icon: Link, label: "Connected Services", to: "/settings/connected-accounts" },
  { icon: Settings, label: "Preferences", to: "/settings" },
];

/**
 * MeBudCard — Bud's home inside Me.
 * Living companion card with pulsing orb, status chips, and settings.
 * Orange glow is exclusive to Bud — no other card uses it.
 */
export default function MeBudCard({ user }) {
  const navigate = useNavigate();

  const { data: memories = [] } = useQuery({
    queryKey: ["me", "bud-memory-count"],
    queryFn: () => base44.entities.BudMemory.list("-created_date", 50),
  });

  const chips = [
    { label: "Memory", value: memories.length, to: "/memory" },
    { label: "Packs", value: "2", to: "/settings" },
    { label: "Automations", value: "—", to: "/automation" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
      className="rounded-[24px] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,138,0,0.06), rgba(17,17,17,0.3))",
        border: "1px solid rgba(255,138,0,0.15)",
      }}
    >
      {/* Bud orb + companion text */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div
          className="w-12 h-12 rounded-full bud-breathe flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #FFFFFF 0%, #FF8A00 60%, #4A2C1D 100%)",
            boxShadow: "0 0 24px rgba(255,138,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        />
        <div className="flex-1">
          <h3 className="text-[16px] font-bold text-white tracking-tight">Bud</h3>
          <p className="text-[12px] text-white/50">
            Your companion · {memories.length} memories
          </p>
        </div>
      </div>

      {/* Status chips */}
      <div className="flex gap-2 px-5 pb-3">
        {chips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => navigate(chip.to)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,138,0,0.08)" }}
          >
            <span className="text-[11px] font-semibold text-white/70">{chip.label}</span>
            <span className="text-[11px] font-bold text-white/90">{chip.value}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px mx-5" style={{ background: "rgba(255,138,0,0.10)" }} />

      {/* Bud settings */}
      <div className="px-5 py-2">
        {BUD_ITEMS.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.to)}
              className="flex items-center gap-3 w-full py-3 transition-opacity active:opacity-60"
            >
              <MeIcon icon={item.icon} color="#FF8A00" size={32} />
              <span className="flex-1 text-left text-[14px] font-medium text-white/90">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
            </motion.button>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
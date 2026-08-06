import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MeIcon from "@/components/me/MeIcon";
import {
  Sparkles, FileText, Calendar, Wallet, ShoppingBag,
  Library, Briefcase, BellRing,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const SHORTCUTS = [
  { icon: Sparkles, label: "Bud", to: "/home", color: "#FF8A00" },
  { icon: FileText, label: "Assignments", to: "/assignments", color: "#10B981" },
  { icon: Calendar, label: "Schedule", to: "/timetable", color: "#10B981" },
  { icon: Wallet, label: "Wallet", to: "/wallet", color: "#FACC15" },
  { icon: ShoppingBag, label: "Market", to: "/marketplace", color: "#14B8A6" },
  { icon: Library, label: "Library", to: "/library", color: "#10B981" },
  { icon: Briefcase, label: "Portfolio", to: "/portfolio", color: "#8B5CF6" },
  { icon: BellRing, label: "Alerts", to: "/notifications", color: "#EF4444" },
];

export default function MeShortcutGrid() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
    >
      <h3 className="text-[13px] font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
        Shortcuts
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {SHORTCUTS.map((s) => (
          <motion.button
            key={s.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(s.to)}
            className="flex flex-col items-center gap-2 p-3 rounded-[18px]"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <MeIcon icon={s.icon} color={s.color} size={36} />
            <span className="text-[10px] font-semibold text-white/70">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
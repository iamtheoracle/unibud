import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function SelectionChip({ label, selected, onClick, variant = "chip", icon: Icon }) {
  const isCard = variant === "card";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center gap-2 font-semibold transition-all duration-200 ${
        isCard
          ? `w-full px-4 py-3.5 rounded-2xl text-[13px] ${selected ? "bg-primary text-primary-foreground premium-shadow border border-primary" : "bg-card text-foreground border border-border/50"}`
          : `px-4 py-2.5 rounded-full text-[13px] ${selected ? "bg-primary text-primary-foreground shadow-[0_2px_12px_rgba(218,175,55,0.3)]" : "bg-card text-foreground border border-border/50"}`
      }`}
    >
      {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{label}</span>
    </motion.button>
  );
}
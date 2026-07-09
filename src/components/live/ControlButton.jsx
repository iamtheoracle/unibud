import React from "react";
import { motion } from "framer-motion";

export default function ControlButton({ icon: Icon, active, onClick, danger, badge }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${
        danger ? "bg-destructive text-destructive-foreground"
        : active ? "bg-primary text-primary-foreground"
        : "glass text-foreground"
      }`}
    >
      <Icon className="w-5 h-5" strokeWidth={2} />
      {badge && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </motion.button>
  );
}
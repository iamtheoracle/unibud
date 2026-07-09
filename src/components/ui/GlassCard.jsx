import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", variant = "default", delay = 0, onClick }) {
  const variants = {
    default: "glass rounded-2xl",
    strong: "glass-strong rounded-2xl",
    subtle: "glass-subtle rounded-2xl",
    solid: "bg-white rounded-2xl shadow-sm border border-border/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`${variants[variant]} ${onClick ? "cursor-pointer card-hover" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";

const variants = {
  default: "bg-card rounded-[24px] border border-border/50 premium-shadow",
  elevated: "bg-card rounded-[24px] border border-border/30 elevated-shadow",
  glass: "glass rounded-[24px]",
  glassStrong: "glass-strong rounded-[24px]",
  flat: "bg-muted/60 rounded-[20px]",
};

export default function GlassCard({ children, className = "", variant = "default", delay = 0, onClick, animate = true }) {
  const content = (
    <div
      onClick={onClick}
      className={`${variants[variant] || variants.default} ${onClick ? "cursor-pointer card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
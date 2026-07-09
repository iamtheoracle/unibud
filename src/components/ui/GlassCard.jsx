import React from "react";
import { motion } from "framer-motion";

const variants = {
  default: "bg-card rounded-[20px] border border-border/40 soft-shadow",
  elevated: "bg-card rounded-[20px] border border-border/30 elevated-shadow",
  glass: "glass rounded-[20px]",
  glassStrong: "glass-strong rounded-[20px]",
  flat: "bg-muted/50 rounded-[20px]",
  solid: "bg-card rounded-[20px] border border-border/40 soft-shadow",
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
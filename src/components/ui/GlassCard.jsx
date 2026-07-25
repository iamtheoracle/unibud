import React from "react";
import { motion } from "framer-motion";

const variants = {
  default: "bg-card rounded-[20px] border border-border/25 soft-shadow hover-lift",
  elevated: "bg-card rounded-[24px] border border-border/20 elevated-shadow hover-lift",
  glass: "glass rounded-[24px] hover-lift",
  glassStrong: "glass-strong rounded-[28px] hover-lift",
  flat: "bg-muted/40 rounded-[20px]",
  solid: "bg-card rounded-[20px] border border-border/25 soft-shadow hover-lift",
  primary: "bg-card rounded-[24px] border border-border/15 primary-card-gradient elevated-shadow hover-lift",
};

export default function GlassCard({ children, className = "", variant = "default", delay = 0, onClick, animate = true }) {
  const content = (
    <div
      onClick={onClick}
      className={`${variants[variant] || variants.default} breathe ${onClick ? "cursor-pointer card-hover" : ""} ${className}`}
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
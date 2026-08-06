import React from "react";
import { motion } from "framer-motion";

const variants = {
  default: "glass-card rounded-[18px] hover-lift",
  elevated: "crystal-card rounded-[18px] hover-lift",
  glass: "glass rounded-[18px] hover-lift",
  glassStrong: "glass-strong rounded-[20px] hover-lift",
  crystal: "crystal-card rounded-[20px] hover-lift glass-shine",
  hero: "crystal-card rounded-[22px] hover-lift crystal-bloom edge-light depth-float",
  compact: "glass rounded-[16px] hover-lift",
  flat: "bg-muted/40 rounded-[16px]",
  solid: "bg-card rounded-[16px] border border-border/25 soft-shadow hover-lift",
  primary: "crystal-card rounded-[18px] primary-card-gradient elevated-shadow hover-lift glass-shine",
};

export default function GlassCard({ children, className = "", variant = "default", delay = 0, onClick, animate = true }) {
  const content = (
    <div
      onClick={onClick}
      className={`${variants[variant] || variants.default} breathe ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
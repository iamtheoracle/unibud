import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground",
  glass: "glass text-foreground",
  glassStrong: "glass-strong text-foreground",
  ghost: "text-foreground hover:bg-foreground/5",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-border text-foreground",
  gold: "bg-gold text-white",
};

const SIZES = {
  sm: "h-8 px-3 text-[11px] gap-1 rounded-full",
  md: "h-10 px-4 text-[13px] gap-1.5 rounded-full",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-full",
  icon: "w-10 h-10 rounded-full",
  iconSm: "w-8 h-8 rounded-full",
  iconLg: "w-12 h-12 rounded-full",
};

/**
 * PremiumButton — unified button primitive for the entire OS.
 *
 * Variants: primary, glass, glassStrong, ghost, destructive, outline, gold
 * Sizes: sm, md, lg, icon, iconSm, iconLg
 *
 * Props:
 *  - variant: see VARIANTS
 *  - size: see SIZES
 *  - loading: boolean — shows spinner, disables
 *  - icon: Lucide icon component
 *  - iconPosition: "left" | "right"
 *  - fullWidth: boolean
 *  - children: label text
 */
export default function PremiumButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-bold spring-tap select-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />}
      {!loading && Icon && iconPosition === "left" && (
        <Icon className={cn(size === "sm" || size === "iconSm" ? "w-3.5 h-3.5" : "w-4 h-4")} strokeWidth={2.5} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && (
        <Icon className={cn(size === "sm" || size === "iconSm" ? "w-3.5 h-3.5" : "w-4 h-4")} strokeWidth={2.5} />
      )}
    </motion.button>
  );
}

export { VARIANTS, SIZES };
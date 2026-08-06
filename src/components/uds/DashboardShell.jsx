import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/uds/tokens";

/**
 * DashboardShell — standardized adaptive dashboard layout for every role.
 * Responsive: 1 col (mobile) → 2 (tablet) → 3 (laptop/desktop). Widgets slot in.
 */
export default function DashboardShell({ title, subtitle, actions, children, className }) {
  return (
    <div className={cn("w-full max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 pb-12 safe-area-pt", className)}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-display font-heading font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-body text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}
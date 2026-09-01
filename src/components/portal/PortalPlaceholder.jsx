import React from "react";
import { motion } from "framer-motion";

export default function PortalPlaceholder({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">{title}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card rounded-2xl p-12 border border-border/40 soft-shadow text-center"
      >
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-primary" strokeWidth={1.8} />
          </div>
        )}
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
          This module is configured and ready. Full interface will be available in the next deployment cycle.
        </p>
      </motion.div>
    </div>
  );
}
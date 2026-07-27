import React from "react";
import { motion } from "framer-motion";

/**
 * EmptyState — premium glass empty state with crystal-bloom icon,
 * Bud guidance, and a helpful action. Never says "No X".
 */
export default function EmptyState({ icon: Icon, title, description, action, budGuidance, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={"flex flex-col items-center justify-center py-16 px-6 text-center " + className}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 20 }}
          className="crystal-bloom"
        >
          <div className="w-18 h-18 rounded-[24px] crystal-card flex items-center justify-center mb-5 edge-light" style={{ width: 72, height: 72 }}>
            <Icon className="w-8 h-8 text-primary" strokeWidth={1.7} />
          </div>
        </motion.div>
      )}
      <h3 className="font-heading font-bold text-[16px] text-foreground mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px]">{description}</p>
      )}
      {budGuidance && (
        <div className="mt-4 px-4 py-2.5 rounded-2xl glass max-w-[280px]">
          <p className="text-[12px] text-foreground/80 leading-relaxed italic">{budGuidance}</p>
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
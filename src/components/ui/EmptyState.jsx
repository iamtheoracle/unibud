import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
        </div>
      )}
      <h3 className="font-heading font-semibold text-[15px] text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[240px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
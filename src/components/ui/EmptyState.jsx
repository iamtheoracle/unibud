import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={"flex flex-col items-center justify-center py-14 px-6 text-center " + className}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-[22px] bg-primary/8 soft-shadow flex items-center justify-center mb-4"
        >
          <Icon className="w-7 h-7 text-primary" strokeWidth={1.8} />
        </motion.div>
      )}
      <h3 className="font-heading font-semibold text-[15px] text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[240px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
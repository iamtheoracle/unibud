import React from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

const ACCENTS = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  purple: "bg-purple/10 text-purple",
  error: "bg-error/10 text-error",
};

export default function UniEmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Check back later or create your first entry.",
  actionLabel,
  onAction,
  accent = "primary",
  delay = 0,
}) {
  const accentClass = ACCENTS[accent] || ACCENTS.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center py-10 px-6"
    >
      <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center mb-4 ${accentClass}`}>
        <Icon className="w-7 h-7" strokeWidth={1.8} />
      </div>
      <p className="font-heading font-semibold text-[14px] text-foreground mb-1">{title}</p>
      <p className="text-[12px] text-muted-foreground max-w-[280px] leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 h-9 px-4 rounded-[12px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
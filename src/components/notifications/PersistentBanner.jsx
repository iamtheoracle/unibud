import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PersistentBanner — top banner reserved for issues requiring user action
 * (offline status, sync failures, authentication expiration). Dismissible
 * only when the underlying issue resolves; never auto-dismisses.
 */
const toneStyles = {
  warning: "bg-warning/15 border-warning/40 text-warning",
  destructive: "bg-destructive/15 border-destructive/40 text-destructive",
  info: "bg-primary/12 border-primary/40 text-primary",
};

export default function PersistentBanner({
  open,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  tone = "warning",
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className={cn(
            "fixed top-0 inset-x-0 z-[90] mx-auto w-full max-w-[520px] px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pointer-events-none"
          )}
        >
          <div className={cn("pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 glass-strong", toneStyles[tone])}>
            <div className="flex-1 min-w-0">
              {title && <p className="text-[13px] font-semibold leading-tight">{title}</p>}
              {message && <p className="text-[12px] opacity-85 leading-tight mt-0.5">{message}</p>}
            </div>
            {actionLabel && (
              <button onClick={onAction} className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold bg-foreground/10 border border-current/30 hover:bg-foreground/15 transition-colors">
                {actionLabel}
              </button>
            )}
            {onDismiss && (
              <button onClick={onDismiss} className="shrink-0 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
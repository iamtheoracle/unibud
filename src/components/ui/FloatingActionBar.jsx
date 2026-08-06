import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * FloatingActionBar — sticky floating action bar for detail pages.
 * Renders actions (Join, Follow, Share, Save, etc.) in a premium glass pill.
 *
 * Props:
 *  - actions: { icon, label, onClick, variant, loading }[]
 *    variant: "primary" | "glass" | "ghost"
 *  - className: extra classes
 */
export default function FloatingActionBar({ actions = [], className = "" }) {
  const primary = actions.filter((a) => a.variant === "primary");
  const secondary = actions.filter((a) => a.variant !== "primary");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
      className={cn(
        "flex items-center gap-2 p-2 rounded-[22px] crystal-dock safe-area-px",
        className
      )}
    >
      {/* Secondary actions — icon buttons */}
      <div className="flex items-center gap-1.5">
        {secondary.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.88 }}
              onClick={action.onClick}
              disabled={action.loading}
              className="w-10 h-10 rounded-full luxury-capsule flex items-center justify-center spring-tap disabled:opacity-50"
              title={action.label}
            >
              {action.loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full"
                />
              ) : (
                Icon && <Icon className="w-4.5 h-4.5 text-foreground" strokeWidth={2} style={{ width: 18, height: 18 }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Primary actions — full-width pill buttons */}
      <div className="flex-1 flex items-center gap-2">
        {primary.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              disabled={action.loading}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-10 rounded-full font-bold text-[13px] spring-tap disabled:opacity-50",
                action.variant === "primary"
                  ? "bg-primary text-primary-foreground"
                  : "luxury-capsule text-foreground"
              )}
            >
              {action.loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full"
                />
              ) : (
                <>
                  {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
                  <span>{action.label}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
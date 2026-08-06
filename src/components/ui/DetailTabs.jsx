import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * DetailTabs — premium animated tab bar for detail pages.
 *
 * Props:
 *  - tabs: { id, label, icon?, count? }[]
 *  - active: current tab id
 *  - onChange: (id) => void
 *  - className: extra classes
 */
export default function DetailTabs({ tabs = [], active, onChange, className = "" }) {
  return (
    <div className={cn("relative flex items-center gap-1 overflow-x-auto no-scrollbar", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
            <span>{tab.label}</span>
            {tab.count != null && tab.count > 0 && (
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="detail-tab-active"
                className="absolute inset-0 rounded-full bg-primary/10 -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * DetailTabContent — animated content swap for detail page tabs.
 * Wraps children in a fade-through transition keyed on `tabId`.
 */
export function DetailTabContent({ tabId, children, className = "" }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
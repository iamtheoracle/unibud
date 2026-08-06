import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * PremiumTabs — animated tab bar with sliding glass indicator.
 *
 * Features:
 *  - Sliding pill indicator that springs between tabs
 *  - Scrollable when tabs overflow
 *  - Optional icons per tab
 *  - Badge count support
 *
 * Props:
 *  - tabs: { id, label, icon?, badge? }[]
 *  - active: currently selected tab id
 *  - onChange: (tabId) => void
 *  - variant: "pill" | "underline" | "segmented"
 *  - className: extra
 */
export default function PremiumTabs({ tabs = [], active, onChange, variant = "pill", className = "" }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeIdx = tabs.findIndex((t) => t.id === active);
    if (activeIdx === -1) return;
    const btn = containerRef.current.children[activeIdx];
    if (!btn) return;
    setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
      opacity: 1,
    });
    // Scroll active tab into view
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active, tabs]);

  if (variant === "underline") {
    return (
      <div className={cn("relative flex items-center gap-1 overflow-x-auto no-scrollbar", className)} ref={containerRef}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-bold whitespace-nowrap flex-shrink-0 spring-tap",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className={cn("px-1.5 py-0.5 rounded-full text-[8px] font-bold", isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground")}>
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator-underline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div className={cn("relative flex items-center gap-1 p-1 rounded-full glass", className)} ref={containerRef}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              className={cn(
                "relative flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 spring-tap z-10",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator-segmented"
                  className="absolute inset-0 rounded-full bg-primary -z-10"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
              {Icon && <Icon className="w-3 h-3" strokeWidth={2.2} />}
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: pill variant
  return (
    <div className={cn("relative flex items-center gap-1 overflow-x-auto no-scrollbar", className)} ref={containerRef}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap flex-shrink-0 spring-tap z-10",
              isActive ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator-pill"
                className="absolute inset-0 rounded-full bg-primary -z-10"
                transition={{ duration: 0.3, ease: EASE }}
              />
            )}
            {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className={cn("px-1.5 py-0.5 rounded-full text-[8px] font-bold", isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground")}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 400, damping: 35 };

/**
 * CategoryTabs — horizontally scrollable, animated category tab bar.
 * Auto-scrolls the active tab into view. Uses framer-motion layoutId
 * for a smooth sliding active indicator.
 */
export default function CategoryTabs({ tabs, activeTab, onChange }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const tab = activeRef.current;
      const tabLeft = tab.offsetLeft;
      const tabRight = tabLeft + tab.offsetWidth;
      const viewLeft = container.scrollLeft;
      const viewRight = viewLeft + container.offsetWidth;
      if (tabLeft < viewLeft) {
        container.scrollTo({ left: Math.max(0, tabLeft - 16), behavior: "smooth" });
      } else if (tabRight > viewRight) {
        container.scrollTo({ left: tabRight - container.offsetWidth + 16, behavior: "smooth" });
      }
    }
  }, [activeTab]);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        const color = tab.color || "0 0% 100%";
        return (
          <button
            key={tab.id}
            ref={active ? activeRef : null}
            onClick={() => onChange(tab.id)}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap shrink-0"
            style={{ color: active ? `hsl(${color})` : "hsl(var(--muted-foreground))" }}
          >
            {active && (
              <motion.div
                layoutId="discovery-category-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: `hsl(${color} / 0.14)`, border: `1px solid hsl(${color} / 0.3)` }}
                transition={SPRING}
              />
            )}
            {!active && (
              <div className="absolute inset-0 rounded-full glass" />
            )}
            <div className="relative flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
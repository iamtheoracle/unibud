import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { hapticTap } from "@/lib/haptics";

const SPRING = { type: "spring", stiffness: 400, damping: 35 };

/**
 * OrbitCategoryBar — pinned, horizontally scrollable, animated category bar.
 * Shows a sliding active indicator, favourite dots, and auto-scrolls the
 * active tab into view. Designed to live inside a sticky container.
 */
export default function OrbitCategoryBar({ categories, activeCategory, onChange, favorites = [] }) {
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
  }, [activeCategory]);

  return (
    <div ref={scrollRef} className="flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const active = activeCategory === cat.id;
        const isFav = favorites.includes(cat.id);
        return (
          <button
            key={cat.id}
            ref={active ? activeRef : null}
            onClick={() => { hapticTap(); onChange(cat.id); }}
            className="relative flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap shrink-0"
            style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
          >
            {active && (
              <motion.div
                layoutId="orbit-category-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: "hsl(var(--foreground) / 0.12)", border: "1px solid hsl(var(--foreground) / 0.2)" }}
                transition={SPRING}
              />
            )}
            {!active && <div className="absolute inset-0 rounded-full glass" />}
            <div className="relative flex items-center gap-1">
              {isFav && <span className="w-1 h-1 rounded-full bg-primary" />}
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
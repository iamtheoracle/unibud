import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * PremiumCarousel — smooth snap-scrolling carousel with page indicators.
 *
 * Features:
 *  - CSS snap scrolling for native momentum
 *  - Prev/next navigation arrows (desktop)
 *  - Page dot indicators
 *  - Drag-to-scroll on touch
 *
 * Props:
 *  - items: ReactNode[]
 *  - itemWidth: CSS width (e.g. "w-64")
 *  - gap: gap between items (e.g. "gap-3")
 *  - showIndicators: boolean
 *  - showArrows: boolean
 *  - className: extra
 */
export default function PremiumCarousel({
  items = [],
  itemWidth = "w-64",
  gap = "gap-3",
  showIndicators = true,
  showArrows = false,
  className = "",
}) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemEl = container.children[0];
    if (!itemEl) return;
    const itemFullWidth = itemEl.offsetWidth + (parseInt(gap.replace("gap-", "").replace("px", "")) || 12);
    const idx = Math.round(container.scrollLeft / itemFullWidth);
    setActiveIndex(idx);
  };

  const scrollToIndex = (idx) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemEl = container.children[0];
    if (!itemEl) return;
    const itemFullWidth = itemEl.offsetWidth + (parseInt(gap.replace("gap-", "").replace("px", "")) || 12);
    container.scrollTo({ left: idx * itemFullWidth, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Arrows */}
      {showArrows && (
        <>
          <button
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full crystal-dock items-center justify-center spring-tap z-10 disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scrollToIndex(Math.min(items.length - 1, activeIndex + 1))}
            disabled={activeIndex === items.length - 1}
            className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full crystal-dock items-center justify-center spring-tap z-10 disabled:opacity-0"
          >
            <ChevronRight className="w-4 h-4 text-foreground" strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Scrollable items */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn("flex overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1", gap)}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item, i) => (
          <div key={i} className={cn(itemWidth, "flex-shrink-0 snap-start")}>
            {item}
          </div>
        ))}
      </div>

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className="spring-tap"
            >
              <motion.div
                animate={{
                  width: i === activeIndex ? 20 : 6,
                  opacity: i === activeIndex ? 1 : 0.3,
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className={cn(
                  "h-1.5 rounded-full",
                  i === activeIndex ? "bg-primary" : "bg-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
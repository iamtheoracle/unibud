import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion/motionPresets";

/**
 * RelatedSection — standardized "related content" section for detail pages.
 * Renders a horizontally scrollable row of cards or a grid.
 *
 * Props:
 *  - title: section heading (e.g. "Similar Communities", "Related Events")
 *  - items: { id, title, subtitle, image, onClick }[]
 *  - variant: "scroll" | "grid"
 *  - empty: ReactNode (shown when items is empty)
 *  - onSeeAll: handler for "See All" link
 */
export default function RelatedSection({
  title = "Related",
  items = [],
  variant = "scroll",
  empty = null,
  onSeeAll,
}) {
  if (items.length === 0 && empty) return <div className="py-4">{empty}</div>;
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-[15px] text-foreground">{title}</h3>
        {onSeeAll && items.length > 3 && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-[12px] font-semibold text-primary spring-tap"
          >
            See All
            <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {variant === "grid" ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 gap-3"
        >
          {items.map((item) => (
            <RelatedCard key={item.id} item={item} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1"
        >
          {items.map((item) => (
            <RelatedCard key={item.id} item={item} compact />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function RelatedCard({ item, compact = false }) {
  return (
    <motion.div
      variants={staggerItem}
      onClick={item.onClick}
      className={cn(
        "crystal-card rounded-[16px] overflow-hidden hover-lift cursor-pointer flex-shrink-0",
        compact ? "w-40" : "w-full"
      )}
    >
      {item.image && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img src={item.image} alt={item.title || ""} loading="lazy" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-semibold text-[12px] text-foreground truncate leading-tight mb-0.5">
          {item.title}
        </h4>
        {item.subtitle && (
          <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
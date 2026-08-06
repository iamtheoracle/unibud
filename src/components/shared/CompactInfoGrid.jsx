import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * CompactInfoGrid — organizes information into compact stat tiles
 * instead of long text blocks. Used on detail pages for:
 * Community (Members, Channels, Events, Resources)
 * Course (Lecturer, Credits, Assignments, Schedule)
 * Marketplace (Seller, Condition, Location, Price)
 *
 * Props:
 *  - items: { label, value, icon?, accent? }[]
 *  - columns: 2 | 3 | 4 (default 2)
 *  - delay: stagger offset
 */
export default function CompactInfoGrid({ items = [], columns = 2, delay = 0 }) {
  const gridCols = columns === 3 ? "grid-cols-3" : columns === 4 ? "grid-cols-4" : "grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-2`}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: delay + i * 0.06, duration: 0.35, ease: EASE }}
            className="glass rounded-[14px] p-2.5 flex flex-col items-center justify-center text-center"
          >
            {Icon && (
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center mb-1.5",
                item.accent ? "" : "bg-primary/10"
              )} style={item.accent ? { background: `${item.accent}15` } : undefined}>
                <Icon
                  className={cn("w-3.5 h-3.5", item.accent ? "" : "text-primary")}
                  strokeWidth={2.2}
                  style={item.accent ? { color: item.accent } : undefined}
                />
              </div>
            )}
            <span className="font-heading font-bold text-[14px] text-foreground leading-none tabular-nums">
              {item.value}
            </span>
            {item.label && (
              <span className="text-[9px] text-muted-foreground font-medium mt-1 leading-tight">
                {item.label}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * CompactInfoRow — horizontal info strip for inline metadata.
 * Used in card footers or detail headers.
 *
 * Props:
 *  - items: { icon, text }[]
 */
export function CompactInfoRow({ items = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {Icon && <Icon className="w-3 h-3" strokeWidth={2.2} />}
            <span className="font-medium">{item.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * InfoChips — metadata chips row (tags, categories, attributes).
 *
 * Props:
 *  - chips: string[] or { label, icon? }[]
 *  - accent: boolean — use primary accent
 */
export function InfoChips({ chips = [], accent = false }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip, i) => {
        const label = typeof chip === "string" ? chip : chip.label;
        const Icon = typeof chip === "object" ? chip.icon : null;
        return (
          <span
            key={i}
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-semibold",
              accent ? "bg-primary/10 text-primary" : "glass text-muted-foreground"
            )}
          >
            {Icon && <Icon className="w-2.5 h-2.5 inline mr-1" strokeWidth={2.2} />}
            {label}
          </span>
        );
      })}
    </div>
  );
}
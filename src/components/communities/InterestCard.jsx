import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * InterestCard — a beautiful, selectable category card inspired by
 * familiar content platforms. These represent interests only — they do
 * NOT connect to any external service.
 */
export default function InterestCard({ category, selected, onToggle, index = 0 }) {
  const Icon = category.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      onClick={onToggle}
      className={`relative p-4 rounded-[20px] text-left transition-all spring-tap overflow-hidden ${
        selected ? "glass-strong" : "glass-card"
      }`}
      style={selected ? { borderColor: `hsl(${category.color} / 0.45)`, boxShadow: `0 0 24px hsl(${category.color} / 0.12)` } : undefined}
    >
      {/* Accent glow when selected */}
      {selected && (
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
          style={{ background: `hsl(${category.color} / 0.18)` }}
        />
      )}

      {/* Check badge */}
      {selected && (
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full grid place-items-center z-10"
          style={{ background: `hsl(${category.color})` }}
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[14px] grid place-items-center mb-3 relative z-[1]"
        style={{ background: `hsl(${category.color} / 0.14)` }}
      >
        <Icon className="w-5 h-5" style={{ color: `hsl(${category.color})` }} strokeWidth={2} />
      </div>

      {/* Label + description */}
      <p className="text-[14px] font-bold text-foreground relative z-[1]">{category.label}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2 relative z-[1]">
        {category.description}
      </p>
    </motion.button>
  );
}
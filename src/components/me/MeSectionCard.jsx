import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import MeIcon from "@/components/me/MeIcon";

const EASE = [0.16, 1, 0.3, 1];

/**
 * MeSectionCard — floating card with semantic-colored glow.
 * Each section uses its own color for the card tint and border.
 * Bud section uses orange; other sections use their semantic color.
 */
export default function MeSectionCard({ title, icon, color, items, headerExtra, delay = 0 }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
      className="rounded-[24px] overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${color}0A, rgba(17,17,17,0.3))`,
        border: `1px solid ${color}12`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <MeIcon icon={icon} color={color} size={36} />
        <h3 className="text-[16px] font-bold text-white tracking-tight">{title}</h3>
      </div>

      {/* Optional header extra */}
      {headerExtra}

      {/* Items */}
      <div className="px-5 pb-2">
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.to)}
              className="flex items-center gap-3 w-full py-3 transition-opacity active:opacity-60"
            >
              <MeIcon icon={item.icon} color={item.color || color} size={32} />
              <span className="flex-1 text-left text-[14px] font-medium text-white/90">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
            </motion.button>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
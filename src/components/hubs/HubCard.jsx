import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

/**
 * HubCard — a compact card representing a hub, shown on the Communities page.
 * Tapping it navigates to the full hub experience.
 */
export default function HubCard({ hub, index = 0 }) {
  const navigate = useNavigate();
  const Icon = hub.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }}
      onClick={() => navigate(`/hub/${hub.id}`)}
      className="relative p-4 rounded-[20px] glass-card spring-tap overflow-hidden text-left"
    >
      {/* Accent glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: `hsl(${hub.color} / 0.12)` }}
      />
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[14px] grid place-items-center mb-2 relative z-[1]"
        style={{ background: `hsl(${hub.color} / 0.14)` }}
      >
        <Icon className="w-5 h-5" style={{ color: `hsl(${hub.color})` }} strokeWidth={2} />
      </div>
      {/* Label + tagline */}
      <p className="text-[14px] font-bold text-foreground relative z-[1]">{hub.label}</p>
      <p className="text-[11px] text-muted-foreground line-clamp-1 relative z-[1]">{hub.tagline}</p>
    </motion.button>
  );
}
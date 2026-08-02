import React, { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * SharedElementCard — reusable card wrapper that supports shared-element
 * transitions to detail pages via layoutId.
 *
 * When the card is tapped, the detail page with the same layoutId animates
 * from the card's position — creating a seamless expansion.
 *
 * Props:
 *  - layoutId: string — must match the layoutId on the detail page hero
 *  - onClick: () => void — navigate to detail
 *  - className: extra
 *  - children: card content
 *  - hoverable: boolean — enable hover lift effect
 *  - accentColor: optional CSS color for accent line
 */
export default function SharedElementCard({
  layoutId,
  onClick,
  className = "",
  children,
  hoverable = true,
  accentColor,
}) {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative rounded-[18px] overflow-hidden crystal-card cursor-pointer",
        hoverable && "hover-elevate",
        className
      )}
    >
      {accentColor && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accentColor }} />
      )}
      {children}
    </motion.div>
  );
}

/**
 * SharedElementHero — the receiving end of a shared-element transition.
 *
 * Place this at the top of a detail page with the same layoutId as the card.
 * The hero animates from the card's position when the detail page opens.
 *
 * Props:
 *  - layoutId: string — must match the card's layoutId
 *  - className: extra
 *  - children: hero content
 */
export function SharedElementHero({ layoutId, className = "", children }) {
  return (
    <motion.div
      layoutId={layoutId}
      className={cn("relative overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * CardBadges — floating badge container for cards (live, friend activity, etc.)
 *
 * Props:
 *  - badges: { id, label, icon?, color?, variant?: "solid"|"glass" }[]
 */
export function CardBadges({ badges = [], className = "" }) {
  if (!badges.length) return null;
  return (
    <div className={cn("absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10", className)}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const isSolid = badge.variant === "solid" || badge.id === "live";
          return (
            <div
              key={badge.id}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md",
                isSolid ? "text-white" : "glass text-white"
              )}
              style={isSolid && badge.color ? { background: badge.color } : undefined}
            >
              {badge.id === "live" && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
              {Icon && <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />}
              {badge.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * CardQuickActions — floating quick action buttons on cards (save, share).
 *
 * Props:
 *  - actions: { id, icon, onClick, active? }[]
 */
export function CardQuickActions({ actions = [], className = "" }) {
  if (!actions.length) return null;
  return (
    <div className={cn("absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick?.();
            }}
            className={cn(
              "w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center spring-tap",
              action.active ? "bg-primary text-primary-foreground" : "glass text-white"
            )}
          >
            <Icon className="w-3 h-3" strokeWidth={2.5} fill={action.active ? "currentColor" : "none"} />
          </motion.button>
        );
      })}
    </div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Building2 } from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";

/**
 * LiveHostBadge — verified host badge for live session creators.
 *
 * Shows host avatar, name, verification check, and organization type.
 *
 * Props:
 *  - host: { name, image, is_verified, is_creator }
 *  - organizationType: string (e.g. "University", "Club", "Department")
 *  - onFollow: () => void
 *  - isFollowing: boolean
 *  - size: "sm" | "md"
 */
export default function LiveHostBadge({ host, organizationType, onFollow, isFollowing = false, size = "md" }) {
  if (!host) return null;
  const avatarSize = size === "sm" ? "xs" : "sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2.5"
    >
      <PremiumAvatar src={host.image} alt={host.name} size={avatarSize} verified={host.is_verified} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[12px] font-bold text-white truncate drop-shadow-lg">{host.name}</span>
          {host.is_verified && (
            <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.5} />
          )}
        </div>
        {organizationType && (
          <div className="flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5 text-white/50" strokeWidth={2.2} />
            <span className="text-[10px] text-white/50 font-medium truncate">{organizationType}</span>
          </div>
        )}
      </div>

      {onFollow && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onFollow}
          className={`px-3.5 h-8 rounded-full text-[11px] font-bold spring-tap flex-shrink-0 ${
            isFollowing ? "glass-strong text-white" : "bg-white text-black"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </motion.button>
      )}
    </motion.div>
  );
}
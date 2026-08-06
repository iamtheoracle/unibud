import React from "react";
import { motion } from "framer-motion";
import { MapPin, GraduationCap, Users, Trophy, BarChart3 } from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * PlayerProfileCard — premium player profile card with stats and achievements.
 *
 * Props:
 *  - player: { name, image, position, university, faculty, team, stats: { appearances, goals, assists, rating }, verified }
 *  - onFollow: () => void
 *  - onViewProfile: () => void
 *  - isFollowing: boolean
 *  - variant: "card" | "compact"
 */
export default function PlayerProfileCard({ player, onFollow, onViewProfile, isFollowing = false, variant = "card" }) {
  if (!player) return null;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={onViewProfile}
        className="flex items-center gap-2.5 p-2.5 rounded-[14px] crystal-card cursor-pointer spring-tap"
      >
        <PremiumAvatar src={player.image} alt={player.name} size="sm" verified={player.verified} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-foreground truncate">{player.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{player.position} · {player.team}</p>
        </div>
        {onFollow && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onFollow(); }}
            className={cn(
              "px-2.5 h-7 rounded-full text-[10px] font-bold spring-tap flex-shrink-0",
              isFollowing ? "glass text-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            {isFollowing ? "✓" : "+ Follow"}
          </motion.button>
        )}
      </motion.div>
    );
  }

  const statItems = [
    { label: "Apps", value: player.stats?.appearances || 0, icon: Users },
    { label: "Goals", value: player.stats?.goals || 0, icon: Trophy },
    { label: "Assists", value: player.stats?.assists || 0, icon: BarChart3 },
    { label: "Rating", value: player.stats?.rating?.toFixed(1) || "—", icon: BarChart3 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewProfile}
      className="crystal-card rounded-[18px] p-4 cursor-pointer hover-elevate"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <PremiumAvatar src={player.image} alt={player.name} size="lg" verified={player.verified} ring="story" />
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold text-foreground truncate">{player.name}</h4>
          <p className="text-[11px] text-primary font-semibold">{player.position}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <GraduationCap className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-[10px] text-muted-foreground truncate">{player.university}</span>
          </div>
          {player.faculty && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[10px] text-muted-foreground truncate">{player.faculty}</span>
            </div>
          )}
        </div>
        {onFollow && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onFollow(); }}
            className={cn(
              "px-3 h-8 rounded-full text-[11px] font-bold spring-tap flex-shrink-0",
              isFollowing ? "glass text-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            {isFollowing ? "Following" : "Follow"}
          </motion.button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1.5 mt-3">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-[10px] p-2 text-center">
              <Icon className="w-2.5 h-2.5 text-muted-foreground mx-auto mb-0.5" strokeWidth={2.2} />
              <p className="text-[14px] font-extrabold tabular-nums text-foreground">{stat.value}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
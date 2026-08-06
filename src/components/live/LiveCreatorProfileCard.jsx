import React from "react";
import { motion } from "framer-motion";
import {
  Users, CalendarDays, Video, Award, BadgeCheck, MapPin,
  GraduationCap, Building2, Sparkles,
} from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

function StatBlock({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
      <span className="text-[14px] font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

/**
 * LiveCreatorProfileCard — creator profile card for live streamers and hosts.
 *
 * Props:
 *  - creator: { name, image, verified, bio, campus, faculty, department, followers_count, events_count, broadcasts_count, is_following, achievements: [], upcoming_events: [], recent_broadcasts: [] }
 *  - onFollow: () => void
 *  - onViewProfile: () => void
 *  - variant: "full" | "compact"
 */
export default function LiveCreatorProfileCard({ creator, onFollow, onViewProfile, variant = "full" }) {
  if (!creator) return null;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 p-2 rounded-[12px] crystal-card"
      >
        <PremiumAvatar src={creator.image} alt={creator.name} size="md" verified={creator.verified} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-foreground truncate">{creator.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {creator.followers_count || 0} followers
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onFollow}
          className={cn(
            "h-7 px-3 rounded-full text-[10px] font-bold spring-tap flex-shrink-0",
            creator.is_following ? "glass text-foreground" : "bg-primary text-primary-foreground"
          )}
        >
          {creator.is_following ? "Following" : "Follow"}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card rounded-[18px] overflow-hidden"
    >
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-br from-primary/10 via-transparent to-muted/20">
        <div className="absolute inset-0 glass-shine" />
      </div>

      {/* Avatar + info */}
      <div className="px-4 -mt-8 relative">
        <div className="flex items-end justify-between">
          <PremiumAvatar src={creator.image} alt={creator.name} size="xl" verified={creator.verified} ring="verified" />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onFollow}
            className={cn(
              "h-8 px-4 rounded-full text-[11px] font-bold spring-tap mb-1",
              creator.is_following ? "glass text-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            {creator.is_following ? "Following" : "Follow"}
          </motion.button>
        </div>

        <h3 className="font-heading font-bold text-[16px] text-foreground mt-2">{creator.name}</h3>
        {creator.verified && (
          <div className="flex items-center gap-1">
            <BadgeCheck className="w-3 h-3 text-primary" strokeWidth={2.2} />
            <span className="text-[10px] text-primary font-medium">Verified Creator</span>
          </div>
        )}

        {/* Campus info */}
        <div className="flex flex-wrap gap-2 mt-2">
          {creator.campus && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <Building2 className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-muted-foreground">{creator.campus}</span>
            </div>
          )}
          {creator.faculty && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <GraduationCap className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-muted-foreground">{creator.faculty}</span>
            </div>
          )}
          {creator.department && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[9px] text-muted-foreground">{creator.department}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-[12px] text-muted-foreground mt-2 leading-relaxed">{creator.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-around py-3 mt-2 border-y border-border/30">
          <StatBlock icon={Users} value={creator.followers_count || 0} label="Followers" />
          <div className="w-px h-8 bg-border/30" />
          <StatBlock icon={Video} value={creator.broadcasts_count || 0} label="Broadcasts" />
          <div className="w-px h-8 bg-border/30" />
          <StatBlock icon={CalendarDays} value={creator.events_count || 0} label="Events" />
        </div>

        {/* Achievements */}
        {creator.achievements && creator.achievements.length > 0 && (
          <div className="py-3">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Achievements</p>
            <div className="flex flex-wrap gap-1.5">
              {creator.achievements.slice(0, 6).map((ach, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10">
                  <Award className="w-2.5 h-2.5 text-gold" strokeWidth={2.2} />
                  <span className="text-[9px] font-medium text-foreground">{ach.title || ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {creator.upcoming_events && creator.upcoming_events.length > 0 && (
          <div className="pb-3">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Upcoming</p>
            <div className="space-y-1.5">
              {creator.upcoming_events.slice(0, 2).map((ev, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded-[10px] glass">
                  <CalendarDays className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={2.2} />
                  <span className="text-[10px] text-foreground truncate flex-1">{ev.title}</span>
                  {ev.date && <span className="text-[9px] text-muted-foreground">{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View profile */}
        <button
          onClick={onViewProfile}
          className="w-full h-8 rounded-full glass text-[11px] font-bold text-foreground spring-tap mb-3 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.2} />
          View Full Profile
        </button>
      </div>
    </motion.div>
  );
}
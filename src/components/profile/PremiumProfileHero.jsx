import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Award, Briefcase, BadgeCheck, Settings, Share2,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * PremiumProfileHero — large hero image profile header.
 * Modern profile cards with achievements, verification badges,
 * skills, projects, and portfolio.
 *
 * Props:
 *  - user: { name, handle, image, cover_url, faculty, department, level, bio, is_verified }
 *  - stats: { posts, followers, following, achievements }
 *  - skills: [{ name, level }]
 *  - badges: [{ id, icon, label, color }]
 *  - onEdit: () => void
 *  - onShare: () => void
 */
export default function PremiumProfileHero({
  user = {},
  stats = { posts: 0, followers: 0, following: 0, achievements: 0 },
  skills = [],
  badges = [],
  onEdit,
  onShare,
}) {
  return (
    <div className="relative">
      {/* Cover image */}
      <div className="relative h-40 overflow-hidden rounded-b-[28px]">
        {user.cover_url ? (
          <Image src={user.cover_url} alt={user.name} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full gradient-chocolate" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Top actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onShare}
            className="w-8 h-8 rounded-full glass-strong flex items-center justify-center spring-tap"
          >
            <Share2 className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onEdit}
            className="w-8 h-8 rounded-full glass-strong flex items-center justify-center spring-tap"
          >
            <Settings className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </motion.button>
        </div>
      </div>

      {/* Profile info */}
      <div className="px-4 -mt-12 relative z-10">
        {/* Avatar */}
        <div className="flex items-end justify-between">
          <PremiumAvatar
            src={user.image}
            alt={user.name}
            size="xl"
            ring="highlight"
            verified={user.is_verified}
          />
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onEdit}
            className="px-4 h-9 rounded-full bg-primary text-[12px] font-bold text-primary-foreground spring-tap"
          >
            Edit Profile
          </motion.button>
        </div>

        {/* Name & handle */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[22px] font-bold text-foreground tracking-tight">{user.name}</h1>
            {user.is_verified && (
              <BadgeCheck className="w-5 h-5 text-primary" strokeWidth={2.2} />
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">@{user.handle}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-[13px] text-foreground mt-2 leading-relaxed">{user.bio}</p>
        )}

        {/* Academic info */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {user.faculty && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
              {user.faculty}
            </span>
          )}
          {user.department && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />
              {user.department}
            </span>
          )}
          {user.level && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Award className="w-3.5 h-3.5" strokeWidth={2} />
              {user.level}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pb-4 border-b border-border/30">
          <Stat label="Posts" value={stats.posts} />
          <Stat label="Followers" value={stats.followers} />
          <Stat label="Following" value={stats.following} />
          <Stat label="Achievements" value={stats.achievements} />
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold spring-tap",
                    skill.level === "expert"
                      ? "bg-primary text-primary-foreground"
                      : "glass text-muted-foreground"
                  )}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Badges</p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {badges.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.id || i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1 flex-shrink-0"
                  >
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                      style={{ background: `${badge.color}15` }}
                    >
                      <Icon className="w-4.5 h-4.5" strokeWidth={2.2} style={{ color: badge.color }} />
                    </div>
                    <span className="text-[8px] font-bold text-muted-foreground max-w-[48px] text-center truncate">
                      {badge.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[16px] font-bold text-foreground tabular-nums">{value.toLocaleString()}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
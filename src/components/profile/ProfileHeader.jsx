import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Share2, MessageCircle, UserPlus, BadgeCheck, Pencil, CheckCircle,
  GraduationCap,
} from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileHeader({
  user, stats = {}, isOwnProfile, onBack, onFollow, onAddFriend, onMessage, onShare, isFollowing,
}) {
  const data = user?.data || {};
  const coverUrl = data.cover_url || data.banner_url;
  const avatarUrl = data.avatar_url || data.image_url;
  const name = user?.full_name || "Student";
  const username = data.username || user?.email?.split("@")[0] || "student";
  const university = data.university || "";
  const faculty = data.faculty || "";
  const department = data.department || "";
  const level = data.level || data.year || "";
  const isVerified = data.is_verified || false;
  const bio = data.bio || "";

  const uniParts = [university, faculty, department, level].filter(Boolean);

  return (
    <div>
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-muted to-card overflow-hidden safe-area-pt">
        {coverUrl ? (
          <Image src={coverUrl} fittingType="fill" className="w-full h-full" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 safe-area-pt">
          <button onClick={onBack} className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button onClick={onShare} className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Profile info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="px-4 -mt-12"
      >
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full ring-4 ring-background overflow-hidden liquid-mirror shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full grid place-items-center bg-muted">
              <span className="text-[24px] font-bold text-muted-foreground">{name?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Name + verified */}
        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">{name}</h1>
          {isVerified && <BadgeCheck className="w-[18px] h-[18px] text-primary" />}
        </div>
        <p className="text-[13px] text-muted-foreground">@{username}</p>

        {/* University info */}
        {uniParts.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{uniParts.join(" · ")}</span>
          </div>
        )}

        {/* Bio */}
        {bio && <p className="text-[13px] text-foreground/80 leading-relaxed mt-2.5">{bio}</p>}

        {/* Stats */}
        <div className="flex items-center gap-5 mt-4">
          <Stat label="Posts" value={stats.posts || 0} />
          <Stat label="Followers" value={stats.followers || 0} />
          <Stat label="Following" value={stats.following || 0} />
          <Stat label="Collections" value={stats.collections || 0} />
          <Stat label="Achievements" value={stats.achievements || 0} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {isOwnProfile ? (
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full glass-card text-[12px] font-semibold text-foreground spring-tap">
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <>
              <button onClick={onAddFriend} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-foreground text-background text-[12px] font-semibold spring-tap">
                <UserPlus className="w-3.5 h-3.5" /> Add Friend
              </button>
              <button
                onClick={onFollow}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[12px] font-semibold spring-tap ${
                  isFollowing ? "glass-card text-muted-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {isFollowing ? <CheckCircle className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button onClick={onMessage} className="w-10 h-10 rounded-full glass-card grid place-items-center spring-tap">
                <MessageCircle className="w-4 h-4 text-foreground" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[16px] font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
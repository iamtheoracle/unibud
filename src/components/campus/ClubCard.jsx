import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Check, BadgeCheck, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { hapticImpact } from "@/lib/haptics";
import { getIcon, CLUB_CATEGORIES } from "./campusConstants";

export default function ClubCard({ club, user, index = 0, onView }) {
  const [joined, setJoined] = useState(
    (club.members || []).some((m) => m.user_id === user?.id)
  );
  const [joining, setJoining] = useState(false);
  const [membersCount, setMembersCount] = useState(club.members_count || 0);

  const catMeta = CLUB_CATEGORIES[club.category] || CLUB_CATEGORIES.other;
  const Icon = getIcon(club.icon || catMeta.icon);

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (joined || !user) return;
    hapticImpact();
    setJoining(true);
    setJoined(true);
    setMembersCount((c) => c + 1);
    try {
      const newMember = {
        user_id: user.id,
        name: user.full_name || "You",
        image: user.avatar_url || user.image || "",
        role: "member",
        joined_at: new Date().toISOString(),
      };
      const updatedMembers = [...(club.members || []), newMember];
      await base44.entities.Club.update(club.id, {
        members: updatedMembers,
        members_count: membersCount + 1,
      });
    } catch {
      setJoined(false);
      setMembersCount((c) => c - 1);
    }
    setJoining(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onView?.(club)}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover cursor-pointer"
    >
      <div
        className="h-16 flex items-center justify-center relative"
        style={{ background: `hsl(${club.accent_color || catMeta.color} / 0.08)` }}
      >
        {club.banner_url ? (
          <img src={club.banner_url} alt="" className="w-full h-full object-cover absolute inset-0" />
        ) : null}
        <div
          className="w-12 h-12 rounded-[16px] flex items-center justify-center relative z-10 bg-card soft-shadow"
        >
          <Icon
            className="w-5 h-5"
            style={{ color: `hsl(${club.accent_color || catMeta.color})` }}
            strokeWidth={2}
          />
        </div>
        {club.is_verified && (
          <span className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <BadgeCheck className="w-3 h-3 text-primary-foreground" />
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1 mb-0.5">
          <h3 className="font-heading font-semibold text-[13px] text-foreground truncate flex-1">{club.name}</h3>
          {club.is_recruiting && (
            <span className="px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[8px] font-bold">Recruiting</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mb-1.5">{catMeta.label}</p>

        {club.description && (
          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mb-2">{club.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-2.5 h-2.5" />
              {membersCount}
            </span>
            {club.president && (
              <span className="flex items-center gap-1 truncate max-w-[80px]">
                <Crown className="w-2.5 h-2.5 text-primary" />
                {club.president}
              </span>
            )}
          </div>

          {user ? (
            <button
              onClick={handleJoin}
              disabled={joining}
              className={
                "px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all spring-tap " +
                (joined
                  ? "bg-muted text-muted-foreground border border-border/40"
                  : "bg-primary text-primary-foreground soft-shadow")
              }
            >
              {joined ? (
                <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Joined</span>
              ) : (
                <span className="flex items-center gap-1"><UserPlus className="w-2.5 h-2.5" /> Join</span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
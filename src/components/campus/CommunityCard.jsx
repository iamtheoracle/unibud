import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, UserPlus, Check, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIcon, COMMUNITY_TYPES } from "./campusConstants";

export default function CommunityCard({ community, user, index = 0 }) {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(
    (community.members || []).some((m) => m.user_id === user?.id)
  );
  const [joining, setJoining] = useState(false);

  const typeMeta = COMMUNITY_TYPES[community.type] || COMMUNITY_TYPES.department;
  const Icon = getIcon(community.icon || typeMeta.icon);

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (joined || !user) return;
    setJoining(true);
    setJoined(true);
    try {
      const newMember = {
        user_id: user.id,
        name: user.full_name || "You",
        image: user.avatar_url || user.image || "",
        role: "member",
        joined_at: new Date().toISOString(),
      };
      const updatedMembers = [...(community.members || []), newMember];
      await base44.entities.Community.update(community.id, {
        members: updatedMembers,
        members_count: (community.members_count || 0) + 1,
      });
    } catch {
      setJoined(false);
    }
    setJoining(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate("/communities/" + community.id)}
      className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 flex items-center gap-3 card-hover cursor-pointer"
    >
      <div
        className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0"
        style={{ background: `hsl(${community.accent_color || typeMeta.color} / 0.10)` }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: `hsl(${community.accent_color || typeMeta.color})` }}
          strokeWidth={2}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-heading font-semibold text-[14px] text-foreground truncate">{community.name}</h3>
          {community.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {typeMeta.label}
          {community.members_count ? ` · ${community.members_count} members` : ""}
        </p>
        {community.description && (
          <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-1">{community.description}</p>
        )}
      </div>

      {user ? (
        <button
          onClick={handleJoin}
          disabled={joining}
          className={
            "flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all spring-tap " +
            (joined
              ? "bg-muted text-muted-foreground border border-border/40"
              : "bg-primary text-primary-foreground soft-shadow gold-glow")
          }
        >
          {joined ? (
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Joined</span>
          ) : (
            <span className="flex items-center gap-1"><UserPlus className="w-3 h-3" /> Join</span>
          )}
        </button>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
    </motion.div>
  );
}
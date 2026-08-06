import React from "react";
import { motion } from "framer-motion";
import { Mic, Users, Radio, Volume2, Calendar, Lock } from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const ROOM_TYPE_META = {
  student_discussion: { icon: Mic, label: "Discussion" },
  society_meeting: { icon: Users, label: "Society Meeting" },
  club_session: { icon: Users, label: "Club Session" },
  public_discussion: { icon: Volume2, label: "Public Discussion" },
  academic_qa: { icon: Mic, label: "Academic Q&A" },
  department_announcement: { icon: Radio, label: "Announcement" },
  campus_radio: { icon: Radio, label: "Campus Radio" },
  event_broadcast: { icon: Radio, label: "Live Broadcast" },
  study_group: { icon: Users, label: "Study Group" },
  other: { icon: Mic, label: "Voice Room" },
};

/**
 * VoiceRoomCard — premium card for displaying a voice room.
 *
 * Shows: live indicator, host avatar, speakers stack, listener count,
 * room type badge, and join button. Only real rooms are displayed.
 *
 * Props:
 *  - room: VoiceRoom entity
 *  - onJoin: (room) => void
 *  - delay: stagger delay
 *  - compact: smaller variant for rails
 */
export default function VoiceRoomCard({ room, onJoin, delay = 0, compact = false }) {
  if (!room) return null;

  const typeMeta = ROOM_TYPE_META[room.room_type] || ROOM_TYPE_META.other;
  const Icon = typeMeta.icon;
  const isLive = room.status === "live";
  const speakers = (room.speakers || []).filter((s) => s.role !== "listener").slice(0, 4);
  const speakingNow = room.speakers?.find((s) => s.is_speaking);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onJoin?.(room)}
      className={cn(
        "relative overflow-hidden crystal-card hover-lift cursor-pointer",
        compact ? "w-64 flex-shrink-0" : "w-full"
      )}
      style={{ borderRadius: compact ? 18 : 22 }}
    >
      {/* Accent glow for live rooms */}
      {isLive && (
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-destructive/10 blur-3xl pointer-events-none" />
      )}

      <div className={cn("relative z-10", compact ? "p-3.5" : "p-4")}>
        {/* Top row: type badge + live indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            <Icon className="w-3 h-3" strokeWidth={2.2} />
            {room.category_label || typeMeta.label}
          </div>

          {isLive ? (
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-destructive"
              />
              <span className="text-[9px] font-extrabold text-destructive uppercase tracking-wider">Live</span>
            </div>
          ) : room.status === "scheduled" ? (
            <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" strokeWidth={2.5} />
              <span>Scheduled</span>
            </div>
          ) : (
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ended</span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-heading font-bold text-foreground leading-tight mb-1 truncate",
          compact ? "text-[13px]" : "text-[15px]"
        )}>
          {room.title}
        </h3>

        {/* Description */}
        {room.description && !compact && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Host */}
        {room.host && (
          <div className="flex items-center gap-2 mb-3">
            <PremiumAvatar src={room.host.image} alt={room.host.name} size="xs" verified={room.host.is_verified} />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-foreground truncate block">{room.host.name}</span>
              <span className="text-[9px] text-muted-foreground">Host</span>
            </div>
          </div>
        )}

        {/* Speakers stack */}
        {speakers.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {speakers.slice(0, 3).map((s, i) => (
                <div key={s.user_id || i} className="relative">
                  <PremiumAvatar src={s.image} alt={s.name} size="xs" />
                  {s.is_speaking && (
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border border-background"
                    />
                  )}
                </div>
              ))}
            </div>
            {speakers.length > 3 && (
              <span className="text-[10px] font-medium text-muted-foreground">+{speakers.length - 3}</span>
            )}
            {speakingNow && (
              <span className="text-[9px] text-success font-semibold ml-1 truncate">
                {speakingNow.name} speaking
              </span>
            )}
          </div>
        )}

        {/* Footer: listener count + join */}
        <div className="flex items-center justify-between pt-2.5 card-separator">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {room.listeners_count || 0}
            </span>
            {room.visibility === "private" && (
              <Lock className="w-3 h-3 text-muted-foreground ml-1" strokeWidth={2} />
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            disabled={!isLive && room.status !== "scheduled"}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[11px] font-bold spring-tap",
              isLive
                ? "bg-destructive text-destructive-foreground"
                : "glass text-foreground"
            )}
          >
            {isLive ? "Join" : room.status === "scheduled" ? "Remind" : "Ended"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { Eye, Users, Radio } from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const STREAM_TYPE_LABELS = {
  lecture: "Lecture",
  study_session: "Study Session",
  campus_event: "Campus Event",
  club_meeting: "Club Meeting",
  sports: "Sports",
  graduation: "Graduation",
  hackathon: "Hackathon",
  seminar: "Seminar",
  workshop: "Workshop",
  department_event: "Department Event",
  student_union: "Student Union",
  orientation: "Orientation",
  career_fair: "Career Fair",
  startup_demo: "Startup Demo",
  concert: "Concert",
  talent_show: "Talent Show",
  debate: "Debate",
  award_ceremony: "Awards",
  cultural_night: "Cultural Night",
  voice_space: "Voice Space",
  other: "Live",
};

/**
 * LiveStreamCard — premium card for a live stream.
 * Shows: live badge with viewer count, host avatar, thumbnail,
 * stream type, title, and Join/Watch/Remind button.
 *
 * Props:
 *  - stream: LiveStream entity
 *  - onJoin: (stream) => void
 *  - delay: stagger
 *  - variant: "default" | "compact" | "wide"
 */
export default function LiveStreamCard({ stream, onJoin, delay = 0, variant = "default" }) {
  if (!stream) return null;
  const typeLabel = STREAM_TYPE_LABELS[stream.stream_type] || "Live";
  const isLive = stream.status === "live";
  const isUpcoming = stream.status === "upcoming";

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4, ease: EASE }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onJoin?.(stream)}
        className="flex-shrink-0 w-52 crystal-card rounded-[16px] overflow-hidden cursor-pointer hover-lift"
      >
        <div className="aspect-video w-full bg-muted relative">
          {stream.thumbnail_url && (
            <Image src={stream.thumbnail_url} alt={stream.title} fittingType="fill" className="w-full h-full" />
          )}
          {isLive && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-destructive flex items-center gap-1">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-white"
              />
              <span className="text-[8px] font-bold text-white uppercase">Live</span>
            </div>
          )}
          {isLive && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/60 flex items-center gap-0.5">
              <Eye className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-white">{stream.viewer_count || 0}</span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <span className="text-[8px] font-bold uppercase tracking-wider text-primary">{typeLabel}</span>
          <h4 className="font-bold text-[11px] text-foreground truncate mt-0.5">{stream.title}</h4>
          {stream.host && (
            <div className="flex items-center gap-1 mt-1.5">
              <PremiumAvatar src={stream.host.image} alt={stream.host.name} size="xs" verified={stream.host.is_verified} />
              <span className="text-[9px] text-muted-foreground truncate">{stream.host.name}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: EASE }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onJoin?.(stream)}
        className="crystal-card rounded-[20px] overflow-hidden cursor-pointer hover-lift flex"
      >
        <div className="w-32 aspect-video flex-shrink-0 bg-muted relative">
          {stream.thumbnail_url && (
            <Image src={stream.thumbnail_url} alt={stream.title} fittingType="fill" className="w-full h-full" />
          )}
          {isLive && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-destructive flex items-center gap-0.5">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-white"
              />
              <span className="text-[7px] font-bold text-white uppercase">Live</span>
            </div>
          )}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-primary">{typeLabel}</span>
            <h4 className="font-bold text-[13px] text-foreground truncate mt-0.5">{stream.title}</h4>
            {stream.host && (
              <span className="text-[10px] text-muted-foreground truncate block mt-0.5">{stream.host.name}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            {isLive ? (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Eye className="w-3 h-3" strokeWidth={2.2} />
                <span className="font-semibold">{stream.viewer_count || 0} watching</span>
              </div>
            ) : isUpcoming ? (
              <span className="text-[10px] text-muted-foreground">
                {stream.scheduled_start ? new Date(stream.scheduled_start).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Soon"}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">Ended</span>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onJoin?.(stream); }}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold spring-tap",
                isLive ? "bg-destructive text-destructive-foreground" : "glass text-foreground"
              )}
            >
              {isLive ? "Join" : isUpcoming ? "Remind" : "Watch"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onJoin?.(stream)}
      className="crystal-card rounded-[20px] overflow-hidden cursor-pointer hover-lift"
    >
      <div className="aspect-video w-full bg-muted relative">
        {stream.thumbnail_url && (
          <Image src={stream.thumbnail_url} alt={stream.title} fittingType="fill" className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Live badge */}
        {isLive ? (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-destructive flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live</span>
          </div>
        ) : isUpcoming ? (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass-strong">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upcoming</span>
          </div>
        ) : (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass-strong">
            <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Replay</span>
          </div>
        )}

        {/* Viewer count */}
        {isLive && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/60 flex items-center gap-1">
            <Eye className="w-3 h-3 text-white" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-white">{stream.viewer_count || 0}</span>
          </div>
        )}

        {/* Host avatar */}
        {stream.host && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <PremiumAvatar src={stream.host.image} alt={stream.host.name} size="xs" verified={stream.host.is_verified} />
            <span className="text-[10px] font-semibold text-white drop-shadow-lg">{stream.host.name}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{typeLabel}</span>
          {stream.requires_registration && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Registration</span>
          )}
        </div>
        <h3 className="font-heading font-bold text-[14px] text-foreground leading-tight mb-2 line-clamp-2">{stream.title}</h3>

        {stream.scheduled_start && !isLive && (
          <p className="text-[11px] text-muted-foreground mb-2.5">
            {new Date(stream.scheduled_start).toLocaleString("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        )}

        <div className="flex items-center justify-between pt-2.5 card-separator">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {isLive ? `${stream.viewer_count || 0} watching` : `${stream.registered_count || 0} registered`}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onJoin?.(stream); }}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-bold spring-tap flex items-center gap-1",
              isLive ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            <Radio className="w-3 h-3" strokeWidth={2.5} />
            {isLive ? "Join" : isUpcoming ? "Register" : "Watch Replay"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
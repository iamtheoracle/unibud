import React from "react";
import { motion } from "framer-motion";
import { Radio, Users, Calendar, MapPin, Bell, Clock } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const EVENT_TYPE_LABELS = {
  career_fair: "Career Fair",
  sports: "Sports",
  convocation: "Convocation",
  orientation: "Orientation",
  hackathon: "Hackathon",
  research_conference: "Conference",
  competition: "Competition",
  club_meeting: "Club Meeting",
  guest_lecture: "Guest Lecture",
  workshop: "Workshop",
  social: "Social",
  cultural: "Cultural",
};

/**
 * LiveEventCard — premium card for live/scheduled campus events.
 * Shows live indicator, participant count, schedule, reminder, and join button.
 *
 * Props:
 *  - event: CampusEvent entity
 *  - onJoin: (event) => void
 *  - onRemind: (event) => void
 *  - delay: stagger delay
 *  - variant: "featured" | "compact" | "default"
 */
export default function LiveEventCard({ event, onJoin, onRemind, delay = 0, variant = "default" }) {
  if (!event) return null;

  const isLive = event.status === "ongoing";
  const isUpcoming = event.status === "upcoming";
  const typeLabel = EVENT_TYPE_LABELS[event.type] || "Event";

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4, ease: EASE }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onJoin?.(event)}
        className="flex-shrink-0 w-44 crystal-card rounded-[16px] overflow-hidden cursor-pointer hover-lift"
      >
        {event.banner_url && (
          <div className="aspect-[5/3] w-full overflow-hidden bg-muted relative">
            <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />
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
          </div>
        )}
        <div className="p-3">
          <span className="text-[8px] font-bold uppercase tracking-wider text-primary">{typeLabel}</span>
          <h4 className="font-bold text-[12px] text-foreground truncate mt-0.5">{event.title}</h4>
          <div className="flex items-center gap-1 mt-1.5">
            <Users className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-[9px] text-muted-foreground">{event.attendees_count || 0} attending</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.5, ease: EASE }}
        whileTap={{ scale: 0.99 }}
        className="relative w-full overflow-hidden crystal-card rounded-[24px] hover-lift"
      >
        {event.banner_url && (
          <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-destructive flex items-center gap-1.5 z-10">
            <motion.span
              animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-white"
            />
            <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Live Now</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{typeLabel}</span>
          <h3 className="font-heading font-extrabold text-[20px] text-white leading-tight mt-1 mb-2 drop-shadow-lg">{event.title}</h3>

          <div className="flex items-center gap-4 text-white/70 mb-3">
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" strokeWidth={2.2} />
                <span className="text-[11px] font-medium">{event.location}</span>
              </div>
            )}
            {event.start_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2.2} />
                <span className="text-[11px] font-medium">{event.start_time}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" strokeWidth={2.2} />
              <span className="text-[11px] font-medium">{event.attendees_count || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onJoin?.(event)}
              className="flex-1 h-10 rounded-full bg-white text-black font-bold text-[13px] flex items-center justify-center gap-1.5 spring-tap"
            >
              <Radio className="w-4 h-4" strokeWidth={2.5} />
              {isLive ? "Join Now" : "Register"}
            </motion.button>
            {!isLive && isUpcoming && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => onRemind?.(event)}
                className="w-10 h-10 rounded-full glass-strong flex items-center justify-center spring-tap"
              >
                <Bell className="w-4 h-4 text-white" strokeWidth={2.2} />
              </motion.button>
            )}
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
      onClick={() => onJoin?.(event)}
      className="crystal-card rounded-[20px] overflow-hidden hover-lift cursor-pointer"
    >
      {event.banner_url && (
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
          <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />
          {isLive && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-destructive flex items-center gap-1.5">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white"
              />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{typeLabel}</span>
          {event.is_featured && (
            <span className="text-[9px] font-bold text-gold uppercase tracking-wider">Featured</span>
          )}
        </div>
        <h3 className="font-heading font-bold text-[15px] text-foreground leading-tight mb-2 line-clamp-2">{event.title}</h3>

        <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-3">
          {event.date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" strokeWidth={2.2} />
              <span className="text-[11px] font-medium">{new Date(event.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
            </div>
          )}
          {event.start_time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={2.2} />
              <span className="text-[11px] font-medium">{event.start_time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" strokeWidth={2.2} />
              <span className="text-[11px] font-medium truncate max-w-[100px]">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2.5 card-separator">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            <span className="text-[11px] font-semibold text-muted-foreground">
              {event.attendees_count || 0} attending
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onJoin?.(event); }}
            className={cn(
              "px-4 py-1.5 rounded-full text-[11px] font-bold spring-tap",
              isLive ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            {isLive ? "Join" : "Register"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
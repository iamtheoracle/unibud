import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Share2, CalendarPlus, Bell } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const EVENT_TYPES = {
  tournament: { color: "hsl(var(--gold))", label: "Tournament" },
  inter_university: { color: "hsl(var(--information))", label: "Inter-University" },
  training: { color: "hsl(var(--success))", label: "Training" },
  fitness: { color: "hsl(var(--warning))", label: "Fitness" },
  friendly: { color: "hsl(var(--primary))", label: "Friendly Match" },
  viewing_party: { color: "hsl(280 65% 60%)", label: "Watch Party" },
};

/**
 * SportsEventCard — premium card for sports events with RSVP actions.
 *
 * Props:
 *  - event: { title, type, date, start_time, end_time, location, banner_url, organizer, attendees_count, capacity, is_free, price }
 *  - onRSVP: (status: "going"|"interested") => void
 *  - rsvpStatus: "going" | "interested" | null
 *  - onShare: () => void
 *  - onAddToCalendar: () => void
 *  - onRemindMe: () => void
 *  - compact: boolean
 */
export default function SportsEventCard({
  event,
  onRSVP,
  rsvpStatus,
  onShare,
  onAddToCalendar,
  onRemindMe,
  compact = false,
}) {
  if (!event) return null;

  const typeConfig = EVENT_TYPES[event.type] || EVENT_TYPES.friendly;
  const isGoing = rsvpStatus === "going";
  const isInterested = rsvpStatus === "interested";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      className="crystal-card rounded-[18px] overflow-hidden cursor-pointer hover-elevate"
    >
      {/* Banner */}
      {!compact && event.banner_url && (
        <div className="relative h-28 overflow-hidden">
          <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Type badge */}
          <div
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white backdrop-blur-md"
            style={{ background: `${typeConfig.color}cc` }}
          >
            {typeConfig.label}
          </div>

          {/* Attendees */}
          {event.attendees_count != null && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white glass">
              <Users className="w-2.5 h-2.5" strokeWidth={2.2} />
              {event.attendees_count}
              {event.capacity && ` / ${event.capacity}`}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Title + type (compact) */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {compact && (
              <span
                className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white mb-1"
                style={{ background: typeConfig.color }}
              >
                {typeConfig.label}
              </span>
            )}
            <h4 className="text-[13px] font-bold text-foreground leading-tight line-clamp-2">{event.title}</h4>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="w-2.5 h-2.5" strokeWidth={2.2} />
            {event.date}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
            {event.start_time}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={2.2} />
            <span className="truncate">{event.location}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-3">
          {/* RSVP */}
          {onRSVP && (
            <>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={(e) => { e.stopPropagation(); onRSVP("going"); }}
                className={cn(
                  "flex-1 h-8 rounded-full text-[11px] font-bold spring-tap",
                  isGoing ? "bg-success text-white" : "bg-primary text-primary-foreground"
                )}
              >
                {isGoing ? "✓ Going" : "Going"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={(e) => { e.stopPropagation(); onRSVP("interested"); }}
                className={cn(
                  "h-8 px-3 rounded-full text-[11px] font-bold spring-tap",
                  isInterested ? "glass-strong text-foreground" : "glass text-muted-foreground"
                )}
              >
                {isInterested ? "★ Interested" : "Interested"}
              </motion.button>
            </>
          )}

          {/* Icon actions */}
          <div className="flex items-center gap-1 ml-auto">
            {onAddToCalendar && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); onAddToCalendar(); }}
                className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap"
              >
                <CalendarPlus className="w-3 h-3 text-foreground" strokeWidth={2.2} />
              </motion.button>
            )}
            {onRemindMe && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); onRemindMe(); }}
                className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap"
              >
                <Bell className="w-3 h-3 text-foreground" strokeWidth={2.2} />
              </motion.button>
            )}
            {onShare && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap"
              >
                <Share2 className="w-3 h-3 text-foreground" strokeWidth={2.2} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { EVENT_TYPES };
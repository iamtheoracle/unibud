import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Clock, MapPin, Users, Bell, Share2, Check, X, HelpCircle,
  Sparkles, CalendarPlus,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const RSVP_STATES = {
  going: { icon: Check, label: "Going", color: "hsl(142 71% 45%)", bg: "bg-success/15" },
  maybe: { icon: HelpCircle, label: "Maybe", color: "hsl(46 74% 55%)", bg: "bg-gold/15" },
  declined: { icon: X, label: "Can't Go", color: "hsl(0 84% 60%)", bg: "bg-destructive/15" },
  pending: { icon: Bell, label: "Respond", color: "hsl(217 91% 60%)", bg: "bg-primary/15" },
};

/**
 * EventInvitationCard — beautiful animated invitation card.
 * Supports Accept/Maybe/Decline, reminders, calendar sync, and sharing.
 *
 * Props:
 *  - event: { title, description, banner_url, date, start_time, end_time, location, host: { name, image, verified }, organizer_name, is_verified, attendees_count, status }
 *  - rsvpStatus: "going" | "maybe" | "declined" | "pending"
 *  - onRSVP: (status) => void
 *  - onRemind: () => void
 *  - onShare: () => void
 *  - onAddToCalendar: () => void
 *  - variant: "card" | "compact"
 */
export default function EventInvitationCard({ event, rsvpStatus = "pending", onRSVP, onRemind, onShare, onAddToCalendar, variant = "card" }) {
  const [responded, setResponded] = useState(rsvpStatus !== "pending");
  const current = RSVP_STATES[rsvpStatus] || RSVP_STATES.pending;
  const CurrentIcon = current.icon;

  const handleRSVP = (status) => {
    setResponded(true);
    onRSVP?.(status);
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 p-2.5 rounded-[12px] crystal-card"
      >
        <div className="w-10 h-10 rounded-[10px] overflow-hidden flex-shrink-0">
          {event.banner_url && <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-foreground truncate">{event.title}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {event.date && new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {event.start_time && ` · ${event.start_time}`}
          </p>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", current.bg)}>
          <CurrentIcon className="w-3 h-3" strokeWidth={2.2} style={{ color: current.color }} />
          <span className="text-[9px] font-bold" style={{ color: current.color }}>{current.label}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card rounded-[18px] overflow-hidden liquid-mirror"
    >
      {/* Banner */}
      {event.banner_url && (
        <div className="relative h-24 overflow-hidden">
          <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

          {/* Verified badge */}
          {event.is_verified && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full glass-strong">
              <Sparkles className="w-2.5 h-2.5 text-primary" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-primary">Verified</span>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3">
        {/* Title */}
        <h3 className="font-heading font-bold text-[16px] text-foreground leading-tight">{event.title}</h3>
        {event.description && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {event.date && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[10px] text-foreground">
                {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          )}
          {event.start_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[10px] text-foreground">{event.start_time}{event.end_time ? `–${event.end_time}` : ""}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[10px] text-foreground truncate">{event.location}</span>
            </div>
          )}
          {event.attendees_count != null && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[10px] text-foreground">{event.attendees_count} attending</span>
            </div>
          )}
        </div>

        {/* Host */}
        {event.host && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/30">
            <PremiumAvatar src={event.host.image} alt={event.host.name} size="xs" verified={event.host.verified} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-foreground truncate">{event.host.name}</p>
              <p className="text-[9px] text-muted-foreground">{event.organizer_name || "Organizer"}</p>
            </div>
          </div>
        )}

        {/* RSVP actions */}
        <div className="mt-3">
          <AnimatePresence mode="wait">
            {!responded ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-3 gap-2"
              >
                {["going", "maybe", "declined"].map((status) => {
                  const config = RSVP_STATES[status];
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={status}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleRSVP(status)}
                      className="flex flex-col items-center gap-1 py-2 rounded-[12px] glass spring-tap"
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: config.color }} />
                      <span className="text-[9px] font-bold text-foreground">{config.label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="responded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-1", current.bg)}>
                  <CurrentIcon className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: current.color }} />
                  <span className="text-[11px] font-bold" style={{ color: current.color }}>{current.label}</span>
                </div>
                <button
                  onClick={() => setResponded(false)}
                  className="text-[10px] text-muted-foreground font-medium spring-tap"
                >
                  Change
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Secondary actions */}
        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={onRemind}
            className="flex-1 h-8 rounded-full glass text-[10px] font-bold text-foreground spring-tap flex items-center justify-center gap-1"
          >
            <Bell className="w-3 h-3" strokeWidth={2.2} />
            Remind Me
          </button>
          <button
            onClick={onAddToCalendar}
            className="flex-1 h-8 rounded-full glass text-[10px] font-bold text-foreground spring-tap flex items-center justify-center gap-1"
          >
            <CalendarPlus className="w-3 h-3" strokeWidth={2.2} />
            Calendar
          </button>
          <button
            onClick={onShare}
            className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap"
          >
            <Share2 className="w-3.5 h-3.5 text-foreground" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
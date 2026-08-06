import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Clock, MapPin, Users, Bell, Share2, Play, Radio,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining(null);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining({ days, hours, mins, secs });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return remaining;
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <motion.div
        key={value}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="w-9 h-9 rounded-[10px] crystal-card flex items-center justify-center"
      >
        <span className="text-[14px] font-bold text-foreground tabular-nums">{String(value).padStart(2, "0")}</span>
      </motion.div>
      <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

/**
 * LiveEventDetailHeader — immersive event page header with countdown,
 * registration, live status, host info, and key details.
 *
 * Props:
 *  - event: { title, description, banner_url, date, start_time, end_time, location, venue_details, organizer_name, host: { name, image, verified }, status, capacity, attendees_count, is_free, price, is_registered }
 *  - onRegister: () => void
 *  - onRemind: () => void
 *  - onShare: () => void
 *  - onWatchLive: () => void
 */
export default function LiveEventDetailHeader({ event, onRegister, onRemind, onShare, onWatchLive }) {
  const [expanded, setExpanded] = useState(false);
  const countdown = useCountdown(event?.status === "upcoming" ? `${event.date}T${event.start_time || "00:00"}` : null);

  if (!event) return null;
  const isLive = event.status === "ongoing";
  const isPast = event.status === "completed";
  const isFull = event.capacity && event.attendees_count >= event.capacity;

  return (
    <div className="relative">
      {/* Banner */}
      {event.banner_url && (
        <div className="relative w-full h-[200px] md:h-[280px] overflow-hidden">
          <Image src={event.banner_url} alt={event.title} fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="px-4 -mt-16 relative z-10">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-3">
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive text-white text-[9px] font-bold"
            >
              <Radio className="w-3 h-3" strokeWidth={2.5} />
              LIVE NOW
            </motion.div>
          )}
          {event.status === "upcoming" && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full glass text-[9px] font-bold text-foreground">
              <CalendarDays className="w-3 h-3 text-primary" strokeWidth={2.2} />
              UPCOMING
            </div>
          )}
          {isPast && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full glass text-[9px] font-bold text-muted-foreground">
              COMPLETED
            </div>
          )}
          {event.organizer_name && (
            <span className="text-[10px] text-muted-foreground">by {event.organizer_name}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading font-bold text-[22px] md:text-[28px] text-foreground tracking-tight leading-tight">{event.title}</h1>

        {/* Key details */}
        <div className="flex flex-wrap gap-3 mt-3">
          {event.date && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5" strokeWidth={2.2} />
              {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          )}
          {event.start_time && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="w-3.5 h-3.5" strokeWidth={2.2} />
              {event.start_time}{event.end_time && ` – ${event.end_time}`}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} />
              {event.location}
            </div>
          )}
          {event.attendees_count != null && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="w-3.5 h-3.5" strokeWidth={2.2} />
              {event.attendees_count} attending
            </div>
          )}
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="flex items-center gap-2 mt-4">
            <CountdownUnit value={countdown.days} label="Days" />
            <CountdownUnit value={countdown.hours} label="Hrs" />
            <CountdownUnit value={countdown.mins} label="Min" />
            <CountdownUnit value={countdown.secs} label="Sec" />
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="mt-4">
            <p className={cn("text-[13px] text-muted-foreground leading-relaxed", !expanded && "line-clamp-2")}>
              {event.description}
            </p>
            {event.description.length > 120 && (
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] text-primary font-medium mt-1 spring-tap">
                {expanded ? "Show less" : "Show more"}
                {expanded ? <ChevronUp className="w-3 h-3" strokeWidth={2.2} /> : <ChevronDown className="w-3 h-3" strokeWidth={2.2} />}
              </button>
            )}
          </div>
        )}

        {/* Host */}
        {event.host && (
          <div className="flex items-center gap-2.5 mt-4 p-2.5 rounded-[12px] glass">
            <PremiumAvatar src={event.host.image} alt={event.host.name} size="sm" verified={event.host.verified} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-foreground">{event.host.name}</p>
              <p className="text-[10px] text-muted-foreground">Host</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {isLive && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onWatchLive}
              className="flex-1 h-10 rounded-full bg-destructive text-[13px] font-bold text-white spring-tap flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
              Watch Live
            </motion.button>
          )}
          {!isPast && !isLive && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRegister}
              disabled={isFull}
              className={cn(
                "flex-1 h-10 rounded-full text-[13px] font-bold spring-tap flex items-center justify-center gap-1.5",
                isFull ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              )}
            >
              {isFull ? "Full" : event.is_registered ? "Registered" : "Register"}
            </motion.button>
          )}
          {isPast && event.recording_url && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onWatchLive}
              className="flex-1 h-10 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
              Watch Replay
            </motion.button>
          )}
          {!isPast && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onRemind}
              className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap"
            >
              <Bell className="w-4 h-4 text-foreground" strokeWidth={2.2} />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onShare}
            className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap"
          >
            <Share2 className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* Price */}
        {!event.is_free && event.price != null && (
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`}
          </p>
        )}
      </div>
    </div>
  );
}
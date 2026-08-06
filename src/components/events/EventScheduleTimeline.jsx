import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, MapPin, Radio, CheckCircle2, Circle, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

function formatCountdown(targetDate) {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins };
}

/**
 * EventScheduleTimeline — schedule timeline for event pages.
 * Shows agenda items with live status, countdown, and location.
 *
 * Props:
 *  - event: { title, date, start_time, end_time, location, status, schedule: [{ time, title, description, location, is_current }] }
 *  - onItemPress: (item, index) => void
 */
export default function EventScheduleTimeline({ event, onItemPress }) {
  const [countdown, setCountdown] = useState(null);
  const schedule = event?.schedule || [];

  useEffect(() => {
    if (event?.status !== "upcoming") return;
    const target = `${event.date}T${event.start_time || "00:00"}`;
    const update = () => setCountdown(formatCountdown(target));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [event?.status, event?.date, event?.start_time]);

  const isLive = event?.status === "ongoing";

  return (
    <div className="space-y-3">
      {/* Countdown / Live status */}
      {event && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-[14px] crystal-card"
        >
          {isLive ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-destructive"
              />
              <div>
                <p className="text-[12px] font-bold text-destructive">Live Now</p>
                <p className="text-[10px] text-muted-foreground">{event.title}</p>
              </div>
            </div>
          ) : countdown ? (
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-primary" strokeWidth={2.2} />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Starts In</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {countdown.days > 0 && <span className="text-[13px] font-bold text-foreground tabular-nums">{countdown.days}d</span>}
                  <span className="text-[13px] font-bold text-foreground tabular-nums">{countdown.hours}h</span>
                  <span className="text-[13px] font-bold text-foreground tabular-nums">{countdown.mins}m</span>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Schedule timeline */}
      {schedule.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border/40" />

          <div className="space-y-3">
            {schedule.map((item, i) => {
              const isCurrent = item.is_current;
              const isPast = item.is_past;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
                  onClick={() => onItemPress?.(item, i)}
                  className="relative flex gap-3 cursor-pointer spring-tap"
                >
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    {isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center"
                      >
                        <Radio className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </motion.div>
                    ) : isPast ? (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                        <Circle className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-1 p-2.5 rounded-[12px] spring-tap",
                    isCurrent ? "glass-strong ring-1 ring-destructive/30" : "glass"
                  )}>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
                      <span className="text-[10px] font-bold text-foreground">{item.time}</span>
                      {isCurrent && (
                        <span className="ml-auto text-[8px] font-bold text-destructive uppercase tracking-wider">Now</span>
                      )}
                    </div>
                    <p className={cn(
                      "text-[12px] font-bold mt-0.5",
                      isPast ? "text-muted-foreground" : "text-foreground"
                    )}>{item.title}</p>
                    {item.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
                        <span className="text-[9px] text-muted-foreground">{item.location}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
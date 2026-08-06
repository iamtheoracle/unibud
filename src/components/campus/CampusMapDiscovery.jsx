import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Calendar, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * CampusMapDiscovery — spatial event discovery using a simplified campus layout.
 *
 * Features:
 *  - Interactive campus building pins with event counts
 *  - Tap a pin to see nearby events
 *  - Premium glass overlay for event details
 *  - Distance indicators
 *
 * Props:
 *  - venues: { id, name, type: "lecture_hall"|"library"|"cafe"|"sports_centre"|"student_centre", x, y, eventCount }[]
 *  - events: { id, title, venue, date, start_time, distance_m }[]
 *  - onVenueSelect: (venue) => void
 *  - onEventSelect: (event) => void
 */
export default function CampusMapDiscovery({ venues = [], events = [], onVenueSelect, onEventSelect }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [nearbyEvents, setNearbyEvents] = useState([]);

  const handleVenueTap = (venue) => {
    setSelectedVenue(venue);
    setNearbyEvents(events.filter((e) => e.venue === venue.name));
    onVenueSelect?.(venue);
  };

  const venueColors = {
    lecture_hall: "hsl(var(--information))",
    library: "hsl(var(--success))",
    cafe: "hsl(var(--warning))",
    sports_centre: "hsl(var(--destructive))",
    student_centre: "hsl(var(--primary))",
  };

  return (
    <div className="relative w-full aspect-[4/5] rounded-[20px] overflow-hidden crystal-card">
      {/* Campus background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/40 to-background">
        {/* Decorative campus paths */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,30 Q30,20 50,30 T100,30" stroke="hsl(var(--border))" strokeWidth="0.3" fill="none" />
          <path d="M0,60 Q30,50 50,60 T100,60" stroke="hsl(var(--border))" strokeWidth="0.3" fill="none" />
          <path d="M20,0 Q25,30 20,50 T20,100" stroke="hsl(var(--border))" strokeWidth="0.3" fill="none" />
          <path d="M70,0 Q75,30 70,50 T70,100" stroke="hsl(var(--border))" strokeWidth="0.3" fill="none" />
        </svg>
      </div>

      {/* Venue pins */}
      {venues.map((venue, i) => {
        const color = venueColors[venue.type] || "hsl(var(--primary))";
        const hasEvents = venue.eventCount > 0;
        const isSelected = selectedVenue?.id === venue.id;

        return (
          <motion.button
            key={venue.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVenueTap(venue)}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${venue.x}%`, top: `${venue.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              {/* Pin */}
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all",
                  isSelected ? "scale-125 ring-2 ring-foreground/20" : ""
                )}
                style={{ background: color }}
              >
                <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              {/* Pin tail */}
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-transparent" style={{ borderTopColor: color }} />

              {/* Event count badge */}
              {hasEvents && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[9px] font-bold">
                  {venue.eventCount}
                </div>
              )}
            </div>
          </motion.button>
        );
      })}

      {/* Selected venue events sheet */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute bottom-0 left-0 right-0 crystal-dock rounded-t-[20px] p-4 max-h-[45%] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                <Navigation className="w-3.5 h-3.5 text-foreground" strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <h4 className="text-[13px] font-bold text-foreground">{selectedVenue.name}</h4>
                <p className="text-[10px] text-muted-foreground capitalize">{selectedVenue.type.replace("_", " ")}</p>
              </div>
              <button onClick={() => setSelectedVenue(null)} className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap">
                <X className="w-3.5 h-3.5 text-foreground" strokeWidth={2.5} />
              </button>
            </div>

            {nearbyEvents.length > 0 ? (
              <div className="space-y-2">
                {nearbyEvents.map((event) => (
                  <motion.button
                    key={event.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onEventSelect?.(event)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-[12px] glass spring-tap text-left"
                  >
                    <div className="w-10 h-10 rounded-[10px] glass-strong flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-primary" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
                          {event.start_time}
                        </span>
                        {event.distance_m != null && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Navigation className="w-2.5 h-2.5" strokeWidth={2.2} />
                            {event.distance_m}m
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground text-center py-4">No events at this venue right now</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
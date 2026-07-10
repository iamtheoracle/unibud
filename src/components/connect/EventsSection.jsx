import React from "react";
import { Calendar, MapPin, ChevronRight, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_EVENTS = [
  { id: "d1", title: "Career Fair 2026", start_date: new Date(Date.now() + 2 * 86400000).toISOString(), location: "Main Auditorium" },
  { id: "d2", title: "Hackathon Kickoff", start_date: new Date(Date.now() + 4 * 86400000).toISOString(), location: "Tech Hub" },
  { id: "d3", title: "Chess Tournament", start_date: new Date(Date.now() + 5 * 86400000).toISOString(), location: "Student Centre" },
];

export default function EventsSection() {
  const { isDemoMode } = useDemoMode();

  const { data: traditions, isLoading } = useQuery({
    queryKey: ["connectEvents"],
    queryFn: () => base44.entities.CampusTradition.filter({ status: "upcoming" }, "start_date", 5),
    enabled: !isDemoMode,
  });

  const events = isDemoMode ? DEMO_EVENTS : (traditions || []);

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Upcoming Events</h3>
        <Link to="/campus-traditions" className="text-[12px] font-semibold text-primary flex items-center spring-tap">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {isLoading && !isDemoMode ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-[20px] shimmer" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Inbox} title="No upcoming events" description="Campus events and traditions will appear here" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event, i) => {
            const date = event.start_date ? new Date(event.start_date) : null;
            const dateStr = date ? date.toLocaleDateString("en", { month: "short", day: "numeric" }) : "";
            return (
              <motion.div
                key={event.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/campus-traditions" className="block">
                  <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3.5 card-hover">
                    <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-primary mb-0.5" />
                      <span className="text-[9px] font-bold text-primary">{dateStr}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-[13px] text-foreground">{event.title}</p>
                      {event.location && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <MapPin className="w-2.5 h-2.5" />
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <button className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">RSVP</button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
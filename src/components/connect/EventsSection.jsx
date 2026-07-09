import React from "react";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const events = [
  { title: "Career Fair 2026", date: "Jul 12", time: "10:00 AM", location: "Main Auditorium", attendees: 234 },
  { title: "Hackathon Kickoff", date: "Jul 14", time: "2:00 PM", location: "Tech Hub", attendees: 128 },
  { title: "Chess Tournament", date: "Jul 15", time: "9:00 AM", location: "Student Centre", attendees: 56 },
];

export default function EventsSection() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Upcoming Events</h3>
        <button className="text-[12px] font-semibold text-primary flex items-center spring-tap">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-2.5">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3.5 card-hover"
          >
            <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-primary mb-0.5" />
              <span className="text-[9px] font-bold text-primary">{event.date}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-[13px] text-foreground">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{event.time}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5" />
                  {event.location}
                </span>
              </div>
            </div>
            <button className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">RSVP</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
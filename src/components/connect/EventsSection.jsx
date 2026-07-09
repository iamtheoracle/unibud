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
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A]">Upcoming Events</h3>
        <button className="text-[12px] font-semibold text-[#28A745] flex items-center">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-2.5">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3.5 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-[#28A745]/10 flex flex-col items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-[#28A745] mb-0.5" />
              <span className="text-[10px] font-bold text-[#28A745]">{event.date}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-[13px] text-[#1A1A1A]">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#86868B]">{event.time}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-[#86868B]">
                  <MapPin className="w-2.5 h-2.5" />
                  {event.location}
                </span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-full bg-[#28A745] text-white text-[11px] font-semibold">RSVP</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
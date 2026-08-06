import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import EventCard from "@/components/campus/EventCard";

/**
 * CommunityEvents — upcoming and past events for a community.
 */
export default function CommunityEvents({ events, user, onAddToCalendar }) {
  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No events scheduled"
        description="Community events will appear here once created."
      />
    );
  }
  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <EventCard event={event} user={user} index={i} onAddToCalendar={onAddToCalendar} />
        </motion.div>
      ))}
    </div>
  );
}
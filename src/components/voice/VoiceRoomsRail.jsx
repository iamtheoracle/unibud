import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Mic, ChevronRight } from "lucide-react";
import VoiceRoomCard from "./VoiceRoomCard";
import EmptyState from "@/components/ui/EmptyState";

/**
 * VoiceRoomsRail — horizontal scroll of active voice rooms in Orbit.
 * Only shows real, live or scheduled rooms. Beautiful empty state when none exist.
 *
 * Props:
 *  - user: current user (for institution scoping)
 *  - onJoinRoom: (room) => void
 *  - onSeeAll: () => void
 *  - filter: "live" | "all" | "scheduled"
 */
export default function VoiceRoomsRail({ user, onJoinRoom, onSeeAll, filter = "live" }) {
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["voice-rooms", filter, user?.data?.institution_id],
    queryFn: async () => {
      const query = {};
      if (filter === "live") query.status = "live";
      if (user?.data?.institution_id) query.institution_id = user.data.institution_id;
      return await base44.entities.VoiceRoom.filter(query, "-started_at", 10);
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="w-64 h-44 crystal-card rounded-[18px] shimmer flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="px-4">
        <div className="crystal-card rounded-[18px] p-5">
          <EmptyState
            icon={Mic}
            title="No Active Voice Rooms"
            description="When students start voice discussions, society meetings, or campus radio sessions, they'll appear here."
            budGuidance="Tip: Start a room from your community or club to bring people together."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-destructive" strokeWidth={2.2} />
          </div>
          <h3 className="font-heading font-bold text-[14px] text-foreground">Voice Rooms</h3>
          {filter === "live" && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-destructive uppercase tracking-wider">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-destructive"
              />
              Live Now
            </span>
          )}
        </div>
        {onSeeAll && rooms.length > 2 && (
          <button onClick={onSeeAll} className="flex items-center gap-0.5 text-[11px] font-semibold text-primary spring-tap">
            See All
            <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {rooms.map((room, i) => (
          <VoiceRoomCard
            key={room.id}
            room={room}
            onJoin={onJoinRoom}
            delay={i * 0.06}
            compact
          />
        ))}
      </div>
    </div>
  );
}
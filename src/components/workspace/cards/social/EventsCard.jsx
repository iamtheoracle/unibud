import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function EventsCard() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["card-events"],
    queryFn: async () => {
      const data = await base44.entities.CampusEvent.list("-date", 6);
      return data || [];
    },
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={2} />;

  const upcoming = (events || []).filter((e) => new Date(e.date || e.start_time || "") >= new Date()).slice(0, 3);

  if (upcoming.length === 0) {
    return <p className="text-[12px] text-muted-foreground py-2">No upcoming events. Check back soon!</p>;
  }

  return (
    <div className="space-y-3">
      {upcoming.map((e) => {
        const eventDate = new Date(e.date || e.start_time || "");
        return (
          <Link key={e.id} to="/events" className="flex items-center gap-3 spring-tap">
            <div className="w-10 h-10 rounded-lg bg-foreground/[0.08] grid place-items-center shrink-0 flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">{eventDate.toLocaleDateString("en-US", { month: "short" })}</span>
              <span className="text-[14px] font-bold text-foreground leading-none">{eventDate.getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{e.title}</p>
              {e.location && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                  <MapPin className="w-2.5 h-2.5" /> {e.location}
                </p>
              )}
            </div>
          </Link>
        );
      })}
      <Link to="/events" className="block text-[12px] font-medium text-primary pt-1">
        All events →
      </Link>
    </div>
  );
}
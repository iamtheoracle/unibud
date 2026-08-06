import React from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

function formatEventDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CalendarCard() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["card-calendar"],
    queryFn: () => base44.entities.CalendarEvent.list("date", 10),
    staleTime: 60000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  const today = new Date().toISOString().split("T")[0];
  const upcoming = (events || []).filter((e) => e.date >= today);

  if (upcoming.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No upcoming events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.slice(0, 4).map((e) => (
        <Link key={e.id} to="/calendar" className="flex items-center gap-2.5 spring-tap">
          <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{e.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatEventDate(e.date)}{e.start_time ? ` · ${e.start_time}` : ""}
            </p>
          </div>
        </Link>
      ))}
      <Link to="/calendar" className="block text-[12px] font-medium text-primary pt-1">
        Open calendar →
      </Link>
    </div>
  );
}
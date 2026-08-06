import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ExternalLink, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CALENDAR_TYPE_META, formatDateRange, timeUntil } from "@/components/university/universityConstants";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileCalendar({ institutionId, search }) {
  const { data: events, isLoading } = useQuery({
    queryKey: ["uni-calendar", institutionId],
    queryFn: () => base44.entities.AcademicCalendarEvent.filter({ institution_id: institutionId }, "start_date", 100),
    staleTime: 120000,
  });

  const today = new Date().toISOString().split("T")[0];

  const filtered = (events || []).filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (e.title || "").toLowerCase().includes(q) || (e.type || "").toLowerCase().includes(q) ||
      (e.academic_session || "").toLowerCase().includes(q) || (e.semester || "").toLowerCase().includes(q);
  });

  const upcoming = filtered.filter((e) => (e.end_date || e.start_date) >= today);
  const past = filtered.filter((e) => (e.end_date || e.start_date) < today).reverse().slice(0, 5);

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-[70px] rounded-[18px] shimmer" />)}</div>;
  }

  if (filtered.length === 0) {
    return (
      <div className="crystal-card">
        <EmptyState
          icon={CalendarDays}
          title={search ? "No results" : "No calendar events"}
          description={search ? "Try a different search term." : "Your institution's academic calendar will appear here."}
        />
      </div>
    );
  }

  const renderEvent = (event, i) => {
    const typeMeta = CALENDAR_TYPE_META[event.type] || CALENDAR_TYPE_META.other;
    const Icon = typeMeta.icon;
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03, duration: 0.35, ease: EASE }}
        className="crystal-card p-3.5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-muted/20 flex items-center justify-center flex-shrink-0">
            <Icon className={`w-5 h-5 ${typeMeta.color}`} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded-full bg-muted/20 text-[8px] font-bold ${typeMeta.color}`}>{typeMeta.label}</span>
              {event.academic_session && <span className="text-[8px] text-muted-foreground font-medium">{event.academic_session}</span>}
            </div>
            <h3 className="font-heading font-bold text-[13px] text-foreground leading-snug">{event.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" /> {formatDateRange(event.start_date, event.end_date)}
              </span>
              {event.start_date >= today && (
                <span className="text-[9px] font-bold text-primary">{timeUntil(event.start_date)}</span>
              )}
            </div>
            {event.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{event.description}</p>}
            {event.location && (
              <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground mt-1.5">
                <MapPin className="w-2.5 h-2.5" /> {event.location}
              </span>
            )}
            {event.link_url && (
              <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[10px] text-primary spring-tap font-medium mt-1.5">
                Open link <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Upcoming</p>
          <div className="space-y-2">{upcoming.map(renderEvent)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Recent Past</p>
          <div className="space-y-2 opacity-60">{past.map((e, i) => renderEvent(e, i))}</div>
        </div>
      )}
    </div>
  );
}
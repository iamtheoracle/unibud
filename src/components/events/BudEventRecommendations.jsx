import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, Calendar, MapPin } from "lucide-react";
import { EVENT_TYPES, formatEventDate } from "@/components/campus/campusConstants";

const EASE = [0.16, 1, 0.3, 1];

export default function BudEventRecommendations({ user, onOpenEvent }) {
  const { data: events } = useQuery({
    queryKey: ["campusEvents", user?.university],
    queryFn: () => base44.entities.CampusEvent.filter({ university: user?.university || "", status: "upcoming" }, "date", 50),
    enabled: !!user,
  });

  const { data: clubs } = useQuery({
    queryKey: ["userClubsForRecs"],
    queryFn: () => base44.entities.Club.filter({ "members.user_id": user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const recommendations = useMemo(() => {
    if (!events || !user) return [];
    const now = new Date();

    return events
      .filter((e) => new Date(e.date) >= now && e.status === "upcoming")
      .map((event) => {
        let score = 0;
        const reasons = [];

        if (event.is_featured) { score += 3; reasons.push("Featured"); }
        if ((event.attendees_count || 0) > 50) { score += 2; reasons.push("Popular"); }

        const userClubNames = (clubs || []).map((c) => c.name);
        if (userClubNames.includes(event.organizer_name)) {
          score += 10;
          reasons.push("Your organization");
        }

        const friendsAttending = (event.rsvp_list || []).filter(
          (r) => r.user_id !== user.id
        ).length;
        if (friendsAttending > 0) {
          score += friendsAttending * 3;
          reasons.push(`${friendsAttending} attending`);
        }

        const typeMeta = EVENT_TYPES[event.type];
        if (typeMeta && user?.data?.interests?.includes(event.type)) {
          score += 5;
          reasons.push("Matches interests");
        }

        const daysUntil = Math.ceil((new Date(event.date) - now) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3) score += 1;

        return { event, score, reasons, daysUntil };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [events, user, clubs]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2.5 px-1">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-[13px] font-bold text-foreground">Bud Recommends</h3>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {recommendations.map((rec, i) => {
          const typeMeta = EVENT_TYPES[rec.event.type] || EVENT_TYPES.other;
          return (
            <motion.button
              key={rec.event.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
              onClick={() => onOpenEvent?.(rec.event)}
              className="shrink-0 w-[200px] glass-card rounded-[16px] overflow-hidden text-left spring-tap card-hover"
            >
              {rec.event.banner_url ? (
                <div className="h-16 overflow-hidden relative">
                  <img src={rec.event.banner_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              ) : (
                <div className="h-10 flex items-center justify-center" style={{ background: `hsl(${rec.event.accent_color || typeMeta.color} / 0.10)` }} />
              )}
              <div className="p-2.5">
                <p className="text-[12px] font-bold text-foreground line-clamp-2 leading-tight mb-1">{rec.event.title}</p>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {formatEventDate(rec.event.date)}
                  {rec.daysUntil <= 3 && <span className="text-primary font-bold ml-1">{rec.daysUntil === 0 ? "Today" : `${rec.daysUntil}d`}</span>}
                </div>
                {rec.event.location && (
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1.5">
                    <MapPin className="w-2.5 h-2.5" /> <span className="truncate">{rec.event.location}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {rec.reasons.slice(0, 2).map((reason) => (
                    <span key={reason} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold">{reason}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Bookmark, Star, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { hapticTap, hapticImpact } from "@/lib/haptics";
import {
  getIcon, EVENT_TYPES, formatEventDate, formatEventTime, getDaysUntil,
} from "./campusConstants";

export default function EventCard({ event, user, index = 0, onAddToCalendar, onOpen }) {
  const qc = useQueryClient();
  const existingRSVP = user && event.rsvp_list
    ? event.rsvp_list.find((r) => r.user_id === user.id)
    : null;
  const [rsvp, setRsvp] = useState(existingRSVP?.status || null);
  const [saved, setSaved] = useState(() => {
    try {
      const data = localStorage.getItem("saved_events");
      return data ? JSON.parse(data).includes(event.id) : false;
    } catch { return false; }
  });
  const [attendees, setAttendees] = useState(event.attendees_count || 0);

  const typeMeta = EVENT_TYPES[event.type] || EVENT_TYPES.other;
  const Icon = getIcon(typeMeta.icon);
  const daysUntil = getDaysUntil(event.date);
  const isUpcoming = daysUntil >= 0;

  const handleRSVP = async (status) => {
    if (!user) return;
    hapticImpact();
    const prevRSVP = rsvp;
    const newRSVP = prevRSVP === status ? null : status;
    setRsvp(newRSVP);

    const rsvpList = (event.rsvp_list || []).filter((r) => r.user_id !== user.id);
    if (newRSVP) {
      rsvpList.push({ user_id: user.id, name: user.full_name, status: newRSVP, rsvp_at: new Date().toISOString() });
    }
    const countDelta = newRSVP ? (prevRSVP ? 0 : 1) : -1;

    try {
      await base44.entities.CampusEvent.update(event.id, {
        rsvp_list: rsvpList,
        attendees_count: Math.max(0, attendees + countDelta),
      });
      setAttendees((a) => Math.max(0, a + countDelta));
      qc.invalidateQueries({ queryKey: ["campusEvents"] });
    } catch {
      setRsvp(prevRSVP);
    }
  };

  const toggleSave = () => {
    hapticTap();
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      const data = localStorage.getItem("saved_events") || "[]";
      const arr = JSON.parse(data);
      if (newSaved) arr.push(event.id);
      else arr.splice(arr.indexOf(event.id), 1);
      localStorage.setItem("saved_events", JSON.stringify(arr));
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen?.(event)}
      className="bg-card rounded-[18px] soft-shadow border border-border/40 overflow-hidden card-hover cursor-pointer"
    >
      {event.banner_url ? (
        <div className="relative h-28 overflow-hidden">
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {event.is_featured && (
            <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          <div className="absolute bottom-2.5 left-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[9px] font-semibold">
              <Icon className="w-2.5 h-2.5" /> {typeMeta.label}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="h-16 flex items-center justify-center relative"
          style={{ background: `hsl(${event.accent_color || typeMeta.color} / 0.10)` }}
        >
          <Icon
            className="w-7 h-7"
            style={{ color: `hsl(${event.accent_color || typeMeta.color})` }}
            strokeWidth={1.5}
          />
          {event.is_featured && (
            <span className="absolute top-2 left-2.5 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </div>
      )}

      <div className="p-3">
        <h3 className="font-heading font-semibold text-[14px] text-foreground leading-snug mb-2">{event.title}</h3>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{formatEventDate(event.date)}</span>
            {event.start_time && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{formatEventTime(event.start_time)}</span>
              </>
            )}
            {isUpcoming && daysUntil === 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold ml-1">Today</span>
            )}
            {isUpcoming && daysUntil > 0 && daysUntil <= 7 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold ml-1">{daysUntil}d</span>
            )}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{attendees}</span>
            </div>
            {!event.is_free && event.price > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">${event.price}</span>
            )}
            {event.organizer_name && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">by {event.organizer_name}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); toggleSave(); }}
              className="w-7 h-7 rounded-full flex items-center justify-center spring-tap hover:bg-muted"
            >
              <Bookmark className={"w-3.5 h-3.5 " + (saved ? "text-primary fill-primary" : "text-muted-foreground")} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCalendar?.(event); }}
              className="w-7 h-7 rounded-full flex items-center justify-center spring-tap hover:bg-muted"
            >
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {user && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleRSVP("going"); }}
              className={
                "flex-1 py-1.5 rounded-full text-[11px] font-semibold transition-all spring-tap " +
                (rsvp === "going"
                  ? "bg-success text-success-foreground soft-shadow"
                  : "bg-muted text-muted-foreground border border-border/40")
              }
            >
              {rsvp === "going" ? "✓ Going" : "Going"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRSVP("interested"); }}
              className={
                "flex-1 py-1.5 rounded-full text-[11px] font-semibold transition-all spring-tap " +
                (rsvp === "interested"
                  ? "bg-primary text-primary-foreground soft-shadow"
                  : "bg-muted text-muted-foreground border border-border/40")
              }
            >
              {rsvp === "interested" ? "✓ Interested" : "Interested"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
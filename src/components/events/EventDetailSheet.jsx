import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { hapticImpact } from "@/lib/haptics";
import EventUpdatesFeed from "./EventUpdatesFeed";
import EventCheckInSheet from "./EventCheckInSheet";
import {
  X, MapPin, Clock, Calendar, Users, Star, Navigation, QrCode,
  Bookmark, CheckCircle2, Ticket, Loader2, Shield,
} from "lucide-react";
import { EVENT_TYPES, getIcon, formatEventDate, formatEventTime } from "@/components/campus/campusConstants";

export default function EventDetailSheet({ event: initialEvent, user, onClose, onAddToCalendar, onShare }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const { data: freshEvent } = useQuery({
    queryKey: ["eventDetail", initialEvent.id],
    queryFn: () => base44.entities.CampusEvent.get(initialEvent.id),
    enabled: !!initialEvent.id,
  });

  const event = freshEvent || initialEvent;
  const typeMeta = EVENT_TYPES[event.type] || EVENT_TYPES.other;
  const Icon = getIcon(typeMeta.icon);

  const isOrganizer = event.created_by_id === user?.id;
  const isPaid = !event.is_free && event.price > 0;
  const rsvpEntry = event.rsvp_list?.find((r) => r.user_id === user?.id);
  const hasTicket = !!rsvpEntry;
  const isCheckedIn = event.checked_in?.includes(user?.id);

  const handleRSVP = async (status) => {
    if (!user) return;
    hapticImpact();
    const prev = rsvpEntry?.status;
    const newStatus = prev === status ? null : status;
    const rsvpList = (event.rsvp_list || []).filter((r) => r.user_id !== user.id);
    if (newStatus) {
      rsvpList.push({ user_id: user.id, name: user.full_name, status: newStatus, rsvp_at: new Date().toISOString() });
    }
    const countDelta = newStatus ? (prev ? 0 : 1) : -1;
    try {
      await base44.entities.CampusEvent.update(event.id, {
        rsvp_list: rsvpList,
        attendees_count: Math.max(0, (event.attendees_count || 0) + countDelta),
      });
      qc.invalidateQueries({ queryKey: ["eventDetail", event.id] });
      qc.invalidateQueries({ queryKey: ["campusEvents"] });
    } catch {
      toast({ title: "Couldn't update RSVP", variant: "destructive" });
    }
  };

  const handleBuyTicket = async () => {
    if (window.self !== window.top) {
      alert("Ticket purchase works only from a published app. Please open UNIBUD in a new tab.");
      return;
    }
    setPurchasing(true);
    try {
      const response = await base44.functions.invoke("purchaseEventTicket", { event_id: event.id });
      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        toast({ title: "Couldn't start checkout", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    }
    setPurchasing(false);
  };

  return (
    <motion.div className="fixed inset-0 z-[2000] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] glass-strong no-scrollbar"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Banner */}
        {event.banner_url ? (
          <div className="relative h-32 overflow-hidden rounded-t-[28px]">
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            {event.is_featured && (
              <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> Featured
              </span>
            )}
            <div className="absolute bottom-3 left-3 right-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[9px] font-semibold">
                <Icon className="w-2.5 h-2.5" /> {typeMeta.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center relative rounded-t-[28px]" style={{ background: `hsl(${event.accent_color || typeMeta.color} / 0.10)` }}>
            <Icon className="w-7 h-7" style={{ color: `hsl(${event.accent_color || typeMeta.color})` }} strokeWidth={1.5} />
            {event.is_featured && (
              <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>
        )}

        <div className="p-5 pb-8">
          {/* Title */}
          <h2 className="text-[18px] font-bold text-foreground leading-tight mb-3">{event.title}</h2>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-[12px] text-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{formatEventDate(event.date)}</span>
              {event.start_time && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span>{formatEventTime(event.start_time)}{event.end_time ? ` – ${formatEventTime(event.end_time)}` : ""}</span>
                </>
              )}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-[12px] text-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            {event.organizer_name && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Shield className="w-3 h-3 shrink-0" />
                <span>by {event.organizer_name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-muted/40 text-[9px] capitalize">{event.organizer_type}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendees_count || 0}{event.capacity ? ` / ${event.capacity}` : ""}</span>
              {isPaid && <span className="flex items-center gap-1 text-primary font-bold"><Ticket className="w-3 h-3" /> ${event.price}</span>}
              {event.is_free && <span className="flex items-center gap-1 text-success font-bold">Free</span>}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-[13px] text-foreground/80 leading-relaxed mb-4">{event.description}</p>
          )}

          {/* Check-in badge */}
          {isCheckedIn && (
            <div className="glass-card p-2.5 rounded-[14px] mb-4 flex items-center gap-2 border border-success/30">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <p className="text-[12px] font-semibold text-success">You're checked in!</p>
            </div>
          )}

          {/* RSVP / Ticket actions */}
          {!isPaid ? (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleRSVP("going")}
                className={`flex-1 py-2.5 rounded-[14px] text-[12px] font-semibold spring-tap ${rsvpEntry?.status === "going" ? "bg-success text-success-foreground" : "glass-card text-foreground"}`}
              >
                {rsvpEntry?.status === "going" ? "✓ Going" : "Going"}
              </button>
              <button
                onClick={() => handleRSVP("interested")}
                className={`flex-1 py-2.5 rounded-[14px] text-[12px] font-semibold spring-tap ${rsvpEntry?.status === "interested" ? "bg-primary text-primary-foreground" : "glass-card text-foreground"}`}
              >
                {rsvpEntry?.status === "interested" ? "✓ Interested" : "Interested"}
              </button>
            </div>
          ) : hasTicket ? (
            <div className="glass-card p-3 rounded-[14px] mb-4 flex items-center gap-2 border border-success/30">
              <Ticket className="w-4 h-4 text-success" />
              <p className="text-[12px] font-semibold text-foreground">You have a ticket</p>
            </div>
          ) : (
            <button
              onClick={handleBuyTicket}
              disabled={purchasing}
              className="w-full py-3 rounded-[14px] bg-primary text-primary-foreground text-[14px] font-bold flex items-center justify-center gap-2 spring-tap disabled:opacity-50 mb-4"
            >
              {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
              Buy Ticket · ${event.price}
            </button>
          )}

          {/* Organizer tools */}
          {isOrganizer && (
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Organizer Tools</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="flex-1 py-2.5 rounded-[12px] bg-primary/10 text-primary text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
                >
                  <QrCode className="w-4 h-4" /> QR Check-in
                </button>
                <button
                  onClick={onShare}
                  className="flex-1 py-2.5 rounded-[12px] glass-card text-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
                >
                  <Navigation className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => onAddToCalendar?.(event)} className="flex-1 py-2 rounded-[12px] glass-card text-muted-foreground text-[11px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
              <Calendar className="w-3.5 h-3.5" /> Add to Calendar
            </button>
            <button onClick={onShare} className="flex-1 py-2 rounded-[12px] glass-card text-muted-foreground text-[11px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
              <Bookmark className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* Event Updates */}
          <EventUpdatesFeed eventId={event.id} isOrganizer={isOrganizer} />
        </div>

        {/* Check-in sheet */}
        <AnimatePresence>
          {showCheckIn && (
            <EventCheckInSheet event={event} user={user} onClose={() => setShowCheckIn(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
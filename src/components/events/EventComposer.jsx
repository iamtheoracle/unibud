import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, CalendarDays, Clock, MapPin, Users, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { id: "academic", label: "Academic" },
  { id: "social", label: "Social" },
  { id: "career", label: "Career" },
  { id: "sports", label: "Sports" },
  { id: "cultural", label: "Cultural" },
  { id: "religious", label: "Religious" },
  { id: "other", label: "Other" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  event_type: "social",
  date: "",
  time: "",
  location: "",
  capacity: "",
  is_free: true,
  ticket_price: "",
};

export default function EventComposer({ open, onClose, user, event }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const isEditing = !!event;
  const title = isEditing ? "Edit Event" : "Create Event";

  useEffect(() => {
    if (!open) return;
    setForm({
      title: event?.title || "",
      description: event?.description || "",
      event_type: event?.event_type || event?.type || "social",
      date: event?.date || "",
      time: event?.time || event?.start_time || "",
      location: event?.location || "",
      capacity: event?.capacity ?? "",
      is_free: event?.is_free ?? true,
      ticket_price: event?.ticket_price ?? event?.price ?? "",
    });
  }, [event, open]);

  const canSubmit = useMemo(
    () => form.title.trim() && form.title.trim().length <= 100 && form.date,
    [form.date, form.title]
  );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!canSubmit || submitting || !user) return;

    const payload = {
      title: form.title.trim().slice(0, 100),
      description: form.description.trim().slice(0, 500),
      event_type: form.event_type,
      type: form.event_type,
      date: form.date,
      time: form.time || "",
      start_time: form.time || "",
      location: form.location.trim(),
      capacity: form.capacity === "" ? null : Number(form.capacity),
      is_free: !!form.is_free,
      ticket_price: form.is_free || form.ticket_price === "" ? 0 : Number(form.ticket_price),
      price: form.is_free || form.ticket_price === "" ? 0 : Number(form.ticket_price),
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await base44.entities.CampusEvent.update(event.id, payload);
      } else {
        await base44.entities.CampusEvent.create({
          ...payload,
          organizer_id: user.id,
          organizer_name: user.full_name,
          university: user.university,
          rsvp_count: 0,
          attendees_count: 0,
          status: "upcoming",
        });
      }
      qc.invalidateQueries({ queryKey: ["campusEvents"] });
      qc.invalidateQueries({ queryKey: ["eventDetail", event?.id] });
      toast({ title: isEditing ? "Event updated" : "Event created" });
      onClose?.();
    } catch (error) {
      toast({
        title: isEditing ? "Couldn't update event" : "Couldn't create event",
        description: error?.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[4000] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[4001] mx-auto w-full max-w-[520px] rounded-t-[28px] glass-strong safe-area-pb"
          >
            <div className="max-h-[88vh] overflow-y-auto no-scrollbar p-4 pb-6">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-foreground">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value.slice(0, 100))}
                    placeholder="Event title"
                    className="w-full mt-1 h-11 px-3 rounded-[14px] glass text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value.slice(0, 500))}
                    placeholder="Tell students what to expect"
                    className="w-full mt-1 p-3 rounded-[14px] glass text-[13px] text-foreground resize-none outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event Type</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => update("event_type", type.id)}
                        className={cn(
                          "px-3 py-2 rounded-full text-[11px] font-semibold spring-tap border",
                          form.event_type === type.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border/40"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                    <div className="relative mt-1">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        className="w-full h-11 pl-9 pr-3 rounded-[14px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time</label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="w-full h-11 pl-9 pr-3 rounded-[14px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="Venue or meeting point"
                      className="w-full h-11 pl-9 pr-3 rounded-[14px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Capacity</label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                      placeholder="Optional attendee limit"
                      className="w-full h-11 pl-9 pr-3 rounded-[14px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-[16px] p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-foreground">Free Event</p>
                      <p className="text-[10px] text-muted-foreground">Turn off to add a ticket price</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => update("is_free", !form.is_free)}
                      className={cn(
                        "w-12 h-7 rounded-full p-1 transition-colors",
                        form.is_free ? "bg-success/80" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "block w-5 h-5 rounded-full bg-white transition-transform",
                          form.is_free ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {!form.is_free && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ticket Price</label>
                      <div className="relative mt-1">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.ticket_price}
                          onChange={(e) => update("ticket_price", e.target.value)}
                          placeholder="0.00"
                          className="w-full h-11 pl-9 pr-3 rounded-[14px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={onClose} className="flex-1 h-11 rounded-[14px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex-1 h-11 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap disabled:opacity-50"
                >
                  {submitting ? (isEditing ? "Saving..." : "Creating...") : title}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
